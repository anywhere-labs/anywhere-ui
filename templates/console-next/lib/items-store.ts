"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

export type ItemStatus = "active" | "draft" | "archived"

export interface ManagedItem {
  id: string
  name: string
  slug: string
  owner: string
  status: ItemStatus
  updatedAt: string
}

export interface WorkspaceSettings {
  siteName: string
  supportEmail: string
  announcement: string
  allowSignUps: boolean
  requireMfaForAdmins: boolean
  auditRetentionDays: number
}

/**
 * Business Swap #3: Sample CRUD & settings store.
 *
 * Replace these functions with your own REST/tRPC/GraphQL client calls to
 * connect `/admin/items` and `/admin/settings` to a real database.
 */
let demoItems: ManagedItem[] = [
  {
    id: "itm_01",
    name: "Production API Gateway",
    slug: "prod-api-gateway",
    owner: "platform@anywhere.dev",
    status: "active",
    updatedAt: "2026-11-20",
  },
  {
    id: "itm_02",
    name: "Desktop Workbench OAuth",
    slug: "desktop-workbench",
    owner: "client@anywhere.dev",
    status: "active",
    updatedAt: "2026-11-19",
  },
  {
    id: "itm_03",
    name: "Staging Connector Relay",
    slug: "staging-connector",
    owner: "infra@anywhere.dev",
    status: "draft",
    updatedAt: "2026-11-18",
  },
  {
    id: "itm_04",
    name: "Legacy CLI Bridge",
    slug: "legacy-cli-bridge",
    owner: "ops@anywhere.dev",
    status: "archived",
    updatedAt: "2026-11-12",
  },
  {
    id: "itm_05",
    name: "Enterprise SSO Sync",
    slug: "enterprise-sso-sync",
    owner: "security@anywhere.dev",
    status: "active",
    updatedAt: "2026-11-10",
  },
  {
    id: "itm_06",
    name: "Webhook Event Dispatcher",
    slug: "webhook-dispatcher",
    owner: "platform@anywhere.dev",
    status: "draft",
    updatedAt: "2026-11-08",
  },
  {
    id: "itm_07",
    name: "Billing Usage Collector",
    slug: "billing-collector",
    owner: "finance@anywhere.dev",
    status: "active",
    updatedAt: "2026-11-05",
  },
]

let demoSettings: WorkspaceSettings = {
  siteName: "Agents Anywhere",
  supportEmail: "support@anywhere.dev",
  announcement: "",
  allowSignUps: true,
  requireMfaForAdmins: true,
  auditRetentionDays: 90,
}

export const itemsQueryKey = ["admin", "items"] as const
export const settingsQueryKey = ["admin", "settings"] as const

export function useManagedItems(search: string, status: ItemStatus | "all") {
  return useQuery({
    queryKey: [...itemsQueryKey, search, status],
    queryFn: async () => {
      const q = search.trim().toLowerCase()
      return demoItems.filter((item) => {
        if (status !== "all" && item.status !== status) return false
        if (!q) return true
        return (
          item.name.toLowerCase().includes(q) ||
          item.slug.toLowerCase().includes(q) ||
          item.owner.toLowerCase().includes(q)
        )
      })
    },
  })
}

export function useCreateManagedItem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: { name: string; slug: string; owner: string; status: ItemStatus }) => {
      const next: ManagedItem = {
        id: `itm_${Date.now().toString(36)}`,
        name: input.name.trim(),
        slug: input.slug.trim(),
        owner: input.owner.trim(),
        status: input.status,
        updatedAt: new Date().toISOString().slice(0, 10),
      }
      demoItems = [next, ...demoItems]
      return next
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: itemsQueryKey })
    },
  })
}

export function useUpdateManagedItem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: ManagedItem) => {
      demoItems = demoItems.map((item) =>
        item.id === input.id
          ? { ...input, updatedAt: new Date().toISOString().slice(0, 10) }
          : item
      )
      return input
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: itemsQueryKey })
    },
  })
}

export function useDeleteManagedItem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      demoItems = demoItems.filter((item) => item.id !== id)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: itemsQueryKey })
    },
  })
}

export function useWorkspaceSettings() {
  return useQuery({
    queryKey: settingsQueryKey,
    queryFn: async () => ({ ...demoSettings }),
  })
}

export function useSaveWorkspaceSettings() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (next: WorkspaceSettings) => {
      demoSettings = { ...next }
      return demoSettings
    },
    onSuccess: (saved) => {
      queryClient.setQueryData(settingsQueryKey, saved)
    },
  })
}
