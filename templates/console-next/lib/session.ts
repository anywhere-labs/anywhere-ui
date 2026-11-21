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

/**
 * Business Swap #2: Authentication & session adapter.
 *
 * Replace `demoAuthAdapter` with calls to your own backend API (cookie session,
 * OIDC BFF, NextAuth, Supabase, etc.) while keeping the `AuthAdapter` contract
 * intact — every page, guard (`SessionGate`), and transition animation works
 * unchanged.
 */
export interface AuthAdapter {
  getSession(): Promise<SessionState | null>
  signInWithPassword(input: { email: string; password: string }): Promise<SessionState>
  updateProfile(input: { display_name: string }): Promise<SessionState>
  signOut(): Promise<void>
}

const DEMO_STORAGE_KEY = "anywhere-ui.demo-session"

const DEFAULT_DEMO_USER: SessionUser = {
  id: "usr_demo_01",
  email: "admin@anywhere.dev",
  display_name: "Anywhere Admin",
  role: "admin",
  plan: "Pro",
  avatar: null,
  mfa_enabled: false,
}

function readDemoSession(): SessionState | null {
  if (typeof window === "undefined") return null
  try {
    const raw = window.sessionStorage.getItem(DEMO_STORAGE_KEY)
    if (raw === "signed-out") return null
    if (!raw) return { user: DEFAULT_DEMO_USER }
    return JSON.parse(raw) as SessionState
  } catch {
    return { user: DEFAULT_DEMO_USER }
  }
}

function writeDemoSession(state: SessionState | null) {
  if (typeof window === "undefined") return
  try {
    if (state) {
      window.sessionStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(state))
    } else {
      window.sessionStorage.setItem(DEMO_STORAGE_KEY, "signed-out")
    }
  } catch {
    // Private browsing or disabled storage: ignore.
  }
}

export const demoAuthAdapter: AuthAdapter = {
  async getSession() {
    return readDemoSession()
  },
  async signInWithPassword({ email }) {
    const cleanEmail = email.trim() || DEFAULT_DEMO_USER.email
    const next: SessionState = {
      user: {
        ...DEFAULT_DEMO_USER,
        email: cleanEmail,
        display_name: cleanEmail === DEFAULT_DEMO_USER.email
          ? DEFAULT_DEMO_USER.display_name
          : cleanEmail.split("@")[0] || "Demo User",
      },
    }
    writeDemoSession(next)
    return next
  },
  async updateProfile({ display_name }) {
    const current = readDemoSession() ?? { user: DEFAULT_DEMO_USER }
    const next: SessionState = {
      user: { ...current.user, display_name: display_name.trim() || current.user.display_name },
    }
    writeDemoSession(next)
    return next
  },
  async signOut() {
    writeDemoSession(null)
  },
}

/** Active adapter — swap this single export to connect a real backend. */
export const authAdapter: AuthAdapter = demoAuthAdapter

export const sessionQueryKey = ["session"] as const

export function useSession() {
  return useQuery({
    queryKey: sessionQueryKey,
    queryFn: () => authAdapter.getSession(),
    staleTime: 60_000,
  })
}

export function useSignIn() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: { email: string; password: string }) =>
      authAdapter.signInWithPassword(input),
    onSuccess: (session) => {
      queryClient.setQueryData(sessionQueryKey, session)
    },
  })
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: { display_name: string }) => authAdapter.updateProfile(input),
    onSuccess: (session) => {
      queryClient.setQueryData(sessionQueryKey, session)
    },
  })
}

export function useSignOut() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => authAdapter.signOut(),
    onSuccess: () => {
      queryClient.setQueryData(sessionQueryKey, null)
    },
  })
}
