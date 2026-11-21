"use client"

import {
  ArrowLeft,
  Home,
  Languages,
  LayoutDashboard,
  Layers,
  LogOut,
  Palette,
  Settings,
  ShieldCheck,
} from "lucide-react"
import { useRouter } from "next/navigation"

import { ConsoleShell } from "@/components/console/console-shell"
import type { NavGroup } from "@/components/console/nav"
import type { SectionDestination } from "@/components/console/section-switcher"
import { useI18n } from "@/components/i18n-provider"
import { LanguageItems } from "@/components/language-menu"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { APP_CONFIG } from "@/lib/config"
import { LOCALE_LABELS } from "@/lib/i18n"
import { useSession, useSignOut } from "@/lib/session"

export const ACCOUNT_HOME = "/account"
export const PROFILE_PATH = "/account/profile"
export const APPEARANCE_PATH = "/account/appearance"
export const ADMIN_HOME = "/admin"
export const ADMIN_ITEMS_PATH = "/admin/items"
export const ADMIN_SETTINGS_PATH = "/admin/settings"

/**
 * Connects the reusable `ConsoleShell` primitive to this app's navigation,
 * session adapter, and bilingual i18n dictionary.
 */
export function AppConsole({
  section,
  children,
}: {
  section: "account" | "admin"
  children: React.ReactNode
}) {
  const { t, locale } = useI18n()
  const router = useRouter()
  const user = useSession().data?.user
  const signOut = useSignOut()
  const isAdmin = APP_CONFIG.enableAdminConsole && user?.role === "admin"

  const nav: NavGroup[] =
    section === "account"
      ? [
          {
            label: t("shell.groupAccount"),
            items: [
              { title: t("shell.navHome"), href: ACCOUNT_HOME, icon: Home },
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

  const footer = (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={<SidebarMenuButton />}
            aria-label={t("common.language")}
          >
            <Languages />
            <span>{LOCALE_LABELS[locale]}</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" side="top">
            <LanguageItems />
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton
          disabled={signOut.isPending}
          onClick={() => {
            signOut.mutate(undefined, {
              onSuccess: () => router.replace("/sign-in"),
            })
          }}
        >
          <LogOut />
          <span>{t("shell.signOut")}</span>
        </SidebarMenuButton>
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
      account={{ href: PROFILE_PATH, user }}
      nav={nav}
      footer={footer}
    >
      {children}
    </ConsoleShell>
  )
}
