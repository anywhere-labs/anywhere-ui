"use client"

import {
  ArrowLeft,
  Home,
  LayoutDashboard,
  Layers,
  Palette,
  Settings,
  ShieldCheck,
  UserRound,
} from "lucide-react"
import { useRouter } from "next/navigation"

import { ConsoleShell } from "@/components/console/console-shell"
import { AccountSwitcher } from "@/components/console/console-sidebar"
import type { NavGroup } from "@/components/console/nav"
import type { SectionDestination } from "@/components/console/section-switcher"
import { useI18n } from "@/components/i18n-provider"
import { SidebarMenu, SidebarMenuItem } from "@/components/ui/sidebar"
import { APP_CONFIG } from "@/lib/config"
import {
  useAccounts,
  useSession,
  useSignOut,
  useSwitchAccount,
} from "@/lib/session"

export const ACCOUNT_HOME = "/account"
export const PROFILE_PATH = "/account/profile"
export const APPEARANCE_PATH = "/account/appearance"
export const ADMIN_HOME = "/admin"
export const ADMIN_ITEMS_PATH = "/admin/items"
export const ADMIN_SETTINGS_PATH = "/admin/settings"

/**
 * Connects the reusable `ConsoleShell` and `AccountSwitcher` primitives to
 * this app's navigation, multi-account session adapter, and i18n dictionary.
 */
export function AppConsole({
  section,
  children,
}: {
  section: "account" | "admin"
  children: React.ReactNode
}) {
  const { t } = useI18n()
  const router = useRouter()
  const user = useSession().data?.user
  const accountsQuery = useAccounts(!!user)
  const switchAccount = useSwitchAccount()
  const signOut = useSignOut()
  const isAdmin = APP_CONFIG.enableAdminConsole && user?.role === "admin"

  const nav: NavGroup[] =
    section === "account"
      ? [
          {
            items: [{ title: t("shell.navHome"), href: ACCOUNT_HOME, icon: Home }],
          },
          {
            label: t("shell.groupAccount"),
            items: [
              { title: t("shell.navProfile"), href: PROFILE_PATH, icon: UserRound },
              { title: t("shell.navAppearance"), href: APPEARANCE_PATH, icon: Palette },
            ],
          },
        ]
      : [
          {
            label: t("shell.groupAdmin"),
            items: [
              { title: t("shell.navOverview"), href: ADMIN_HOME, icon: LayoutDashboard },
              { title: t("shell.navItems"), href: ADMIN_ITEMS_PATH, icon: Layers },
              { title: t("shell.navSettings"), href: ADMIN_SETTINGS_PATH, icon: Settings },
            ],
          },
        ]

  const destinations: SectionDestination[] = []
  if (section !== "account") {
    destinations.push({
      href: ACCOUNT_HOME,
      title: t("shell.accountConsole"),
      icon: ArrowLeft,
    })
  }
  if (isAdmin && section !== "admin") {
    destinations.push({
      href: ADMIN_HOME,
      title: t("shell.adminConsole"),
      icon: ShieldCheck,
    })
  }

  const accounts =
    accountsQuery.data && accountsQuery.data.length > 0
      ? accountsQuery.data
      : user
        ? [{ user, active: true }]
        : []

  const footer = (
    <SidebarMenu>
      <SidebarMenuItem>
        <AccountSwitcher
          accounts={accounts}
          pending={switchAccount.isPending || signOut.isPending}
          onSwitch={(userId) => {
            switchAccount.mutate(userId, {
              onSuccess: () => router.refresh(),
            })
          }}
          onAddAccount={() => router.push("/sign-in?add=1&next=/account")}
          onSignOut={() => {
            signOut.mutate(undefined, {
              onSuccess: (result) => {
                router.replace(result.switchedTo ? "/account" : "/sign-in")
              },
            })
          }}
          onSignOutAll={() => {
            signOut.mutate(
              { all: true },
              { onSuccess: () => router.replace("/sign-in") }
            )
          }}
          labels={{
            triggerAria: t("shell.switchAccount"),
            accountsHeading: t("shell.accountsLabel"),
            addAccount: t("shell.addAccount"),
            signOut: t("shell.signOut"),
            signOutAll: t("shell.signOutAll"),
          }}
        />
      </SidebarMenuItem>
    </SidebarMenu>
  )

  return (
    <ConsoleShell
      sectionKey={section}
      brandName={APP_CONFIG.brandName}
      badge={section === "admin" ? t("shell.adminLabel") : undefined}
      home={section === "admin" ? ADMIN_HOME : ACCOUNT_HOME}
      homeLabel={t("shell.accountConsole")}
      openNavigationLabel={t("shell.openNavigation")}
      switchLabel={t("shell.switchConsole")}
      destinations={destinations}
      nav={nav}
      footer={footer}
    >
      {children}
    </ConsoleShell>
  )
}
