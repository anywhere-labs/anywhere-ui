"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

export interface SessionUser {
  id: string
  email: string
  display_name: string
  role: "user" | "admin"
  plan: string
  avatar?: string | null
  mfa_enabled?: boolean
}

export interface SessionState {
  user: SessionUser
}

export interface BrowserAccount {
  user: SessionUser
  active: boolean
}

export interface SignOutResult {
  switchedTo?: SessionUser | null
}

/**
 * Business Swap #2: Authentication & multi-account session adapter.
 *
 * Replace `demoAuthAdapter` with calls to your own backend API (cookie session,
 * OIDC BFF, Anywhere Auth, NextAuth, etc.) while keeping the `AuthAdapter`
 * contract intact — every page, guard (`SessionGate`), footer `AccountSwitcher`,
 * and `<ViewTransition>` animation works unchanged.
 */
export interface AuthAdapter {
  getSession(): Promise<SessionState | null>
  listAccounts(): Promise<BrowserAccount[]>
  switchAccount(userId: string): Promise<SessionState>
  signInWithPassword(input: { email: string; password: string }): Promise<SessionState>
  updateProfile(input: { display_name: string }): Promise<SessionState>
  signOut(options?: { all?: boolean }): Promise<SignOutResult>
}

const DEMO_STORAGE_KEY = "anywhere-ui.demo-accounts"

const DEFAULT_DEMO_USER: SessionUser = {
  id: "usr_demo_01",
  email: "admin@anywhere.dev",
  display_name: "Anywhere Admin",
  role: "admin",
  plan: "Pro",
  avatar: null,
  mfa_enabled: false,
}

interface DemoStore {
  activeId: string | null
  users: SessionUser[]
}

function readDemoStore(): DemoStore {
  if (typeof window === "undefined") {
    return { activeId: DEFAULT_DEMO_USER.id, users: [DEFAULT_DEMO_USER] }
  }
  try {
    const raw = window.sessionStorage.getItem(DEMO_STORAGE_KEY)
    if (!raw) return { activeId: DEFAULT_DEMO_USER.id, users: [DEFAULT_DEMO_USER] }
    return JSON.parse(raw) as DemoStore
  } catch {
    return { activeId: DEFAULT_DEMO_USER.id, users: [DEFAULT_DEMO_USER] }
  }
}

function writeDemoStore(store: DemoStore) {
  if (typeof window === "undefined") return
  try {
    window.sessionStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(store))
  } catch {
    // Private browsing or disabled storage: ignore.
  }
}

export const demoAuthAdapter: AuthAdapter = {
  async getSession() {
    const store = readDemoStore()
    if (!store.activeId) return null
    const user = store.users.find((u) => u.id === store.activeId)
    return user ? { user } : null
  },
  async listAccounts() {
    const store = readDemoStore()
    return store.users.map((user) => ({
      user,
      active: user.id === store.activeId,
    }))
  },
  async switchAccount(userId) {
    const store = readDemoStore()
    const user = store.users.find((u) => u.id === userId)
    if (!user) throw new Error("Account session not found")
    writeDemoStore({ ...store, activeId: user.id })
    return { user }
  },
  async signInWithPassword({ email }) {
    const store = readDemoStore()
    const cleanEmail = (email.trim() || DEFAULT_DEMO_USER.email).toLowerCase()
    const existing = store.users.find((u) => u.email.toLowerCase() === cleanEmail)
    if (existing) {
      writeDemoStore({ ...store, activeId: existing.id })
      return { user: existing }
    }
    const created: SessionUser =
      cleanEmail === DEFAULT_DEMO_USER.email
        ? DEFAULT_DEMO_USER
        : {
            id: `usr_${Date.now().toString(36)}`,
            email: cleanEmail,
            display_name: cleanEmail.split("@")[0] || "Demo User",
            role: "admin",
            plan: "Free",
            avatar: null,
            mfa_enabled: false,
          }
    const users = [created, ...store.users.filter((u) => u.id !== created.id)]
    writeDemoStore({ activeId: created.id, users })
    return { user: created }
  },
  async updateProfile({ display_name }) {
    const store = readDemoStore()
    const trimmed = display_name.trim()
    const users = store.users.map((u) =>
      u.id === store.activeId && trimmed ? { ...u, display_name: trimmed } : u
    )
    const active = users.find((u) => u.id === store.activeId) ?? DEFAULT_DEMO_USER
    writeDemoStore({ activeId: active.id, users })
    return { user: active }
  },
  async signOut(options) {
    if (options?.all) {
      writeDemoStore({ activeId: null, users: [] })
      return { switchedTo: null }
    }
    const store = readDemoStore()
    const remaining = store.users.filter((u) => u.id !== store.activeId)
    const next = remaining[0] ?? null
    writeDemoStore({ activeId: next?.id ?? null, users: remaining })
    return { switchedTo: next }
  },
}

/** Active adapter — swap this single export to connect a real backend. */
export const authAdapter: AuthAdapter = demoAuthAdapter

export const sessionQueryKey = ["session"] as const
export const accountsQueryKey = ["session", "accounts"] as const

export function useSession() {
  return useQuery({
    queryKey: sessionQueryKey,
    queryFn: () => authAdapter.getSession(),
    staleTime: 60_000,
  })
}

export function useAccounts(enabled = true) {
  return useQuery({
    queryKey: accountsQueryKey,
    queryFn: () => authAdapter.listAccounts(),
    enabled,
    staleTime: 30_000,
  })
}

export function useSwitchAccount() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (userId: string) => authAdapter.switchAccount(userId),
    onSuccess: (session) => {
      queryClient.setQueryData(sessionQueryKey, session)
      void queryClient.invalidateQueries({ queryKey: accountsQueryKey })
    },
  })
}

export function useSignIn() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: { email: string; password: string }) =>
      authAdapter.signInWithPassword(input),
    onSuccess: (session) => {
      queryClient.setQueryData(sessionQueryKey, session)
      void queryClient.invalidateQueries({ queryKey: accountsQueryKey })
    },
  })
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: { display_name: string }) => authAdapter.updateProfile(input),
    onSuccess: (session) => {
      queryClient.setQueryData(sessionQueryKey, session)
      void queryClient.invalidateQueries({ queryKey: accountsQueryKey })
    },
  })
}

export function useSignOut() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (options?: { all?: boolean }) => authAdapter.signOut(options),
    onSuccess: (result) => {
      queryClient.setQueryData(
        sessionQueryKey,
        result.switchedTo ? { user: result.switchedTo } : null
      )
      void queryClient.invalidateQueries({ queryKey: accountsQueryKey })
    },
  })
}
