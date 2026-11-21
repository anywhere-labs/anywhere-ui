"use client"

import {
  ArrowRight,
  Layers,
  Palette,
  Pencil,
  Search,
  ShieldCheck,
  Sparkles,
  UserRound,
  X,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useRef, useState } from "react"

import {
  ADMIN_HOME,
  APPEARANCE_PATH,
  PROFILE_PATH,
} from "@/components/console/app-console"
import { NAV_FORWARD } from "@/components/console/page-transition"
import { UserAvatar } from "@/components/console/user-avatar"
import { useI18n } from "@/components/i18n-provider"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { APP_CONFIG } from "@/lib/config"
import type { MessageKey } from "@/lib/i18n"
import { useSession } from "@/lib/session"
import { cn } from "@/lib/utils"

interface SearchEntry {
  id: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  title: MessageKey
  description: MessageKey
  keywords: string
  adminOnly?: boolean
}

const SEARCH_ENTRIES: readonly SearchEntry[] = [
  {
    id: "profile",
    href: PROFILE_PATH,
    icon: UserRound,
    title: "account.home.item.profile",
    description: "account.home.item.profileDesc",
    keywords: "profile name email plan id 资料 名称 邮箱 套餐",
  },
  {
    id: "appearance",
    href: APPEARANCE_PATH,
    icon: Palette,
    title: "account.home.item.appearance",
    description: "account.home.item.appearanceDesc",
    keywords: "theme dark light system language chinese english 外观 主题 深色 浅色 语言 中文 英文",
  },
  {
    id: "admin",
    href: ADMIN_HOME,
    icon: ShieldCheck,
    title: "shell.adminConsole",
    description: "account.home.item.adminDesc",
    keywords: "admin console resources items overview settings 管理 后台 资源 概览 设置",
    adminOnly: true,
  },
]

const QUICK_PILLS: readonly {
  label: MessageKey
  href: string
  adminOnly?: boolean
}[] = [
  { label: "account.home.pill.profile", href: PROFILE_PATH },
  { label: "account.home.pill.appearance", href: APPEARANCE_PATH },
  { label: "account.home.pill.admin", href: ADMIN_HOME, adminOnly: true },
]

/**
 * Calm identity-centred account home (`/account`), following Anywhere UI's
 * monochrome pill and borderless surface system.
 */
export default function AccountHomePage() {
  const { t } = useI18n()
  const router = useRouter()
  const user = useSession().data?.user

  const [dismissedTip, setDismissedTip] = useState(false)
  const [query, setQuery] = useState("")
  const [searchOpen, setSearchOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const searchRoot = useRef<HTMLDivElement>(null)
  const searchInput = useRef<HTMLInputElement>(null)

  const isAdmin = APP_CONFIG.enableAdminConsole && user?.role === "admin"

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    const visible = SEARCH_ENTRIES.filter(
      (entry) => !entry.adminOnly || isAdmin
    )
    if (!q) return visible
    return visible.filter((entry) => {
      const hay = `${t(entry.title)} ${t(entry.description)} ${entry.keywords}`.toLowerCase()
      return hay.includes(q)
    })
  }, [query, isAdmin, t])

  // Press `/` outside inputs to focus the account search pill.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "/" || event.metaKey || event.ctrlKey || event.altKey) return
      const tag = (event.target as HTMLElement | null)?.tagName
      if (tag === "INPUT" || tag === "TEXTAREA" || (event.target as HTMLElement | null)?.isContentEditable) return
      event.preventDefault()
      searchInput.current?.focus()
      setSearchOpen(true)
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])

  useEffect(() => {
    if (!searchOpen) return
    const onPointerDown = (event: PointerEvent) => {
      if (!searchRoot.current?.contains(event.target as Node)) setSearchOpen(false)
    }
    document.addEventListener("pointerdown", onPointerDown)
    return () => document.removeEventListener("pointerdown", onPointerDown)
  }, [searchOpen])

  if (!user) return null

  const safeIndex = results.length > 0 ? Math.min(activeIndex, results.length - 1) : 0
  const showDropdown = searchOpen && query.trim().length > 0

  const go = (href: string) => {
    setSearchOpen(false)
    setQuery("")
    router.push(href)
  }

  return (
    <div className="mx-auto flex min-h-[calc(100svh-3.5rem)] w-full max-w-2xl flex-col px-6 py-12 md:min-h-svh md:px-10 md:py-16">
      <div className="flex flex-1 flex-col items-center justify-center">
        {/* Identity hero */}
        <Link
          href={PROFILE_PATH}
          aria-label={t("account.profile.title")}
          className="group relative rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <UserAvatar user={user} className="size-20 rounded-full text-2xl" />
          <span className="absolute right-0 bottom-0 flex size-7 items-center justify-center rounded-full bg-card text-foreground shadow-sm ring-2 ring-background transition-colors group-hover:bg-surface-hover">
            <Pencil className="size-3.5" />
          </span>
        </Link>

        <Link
          href={PROFILE_PATH}
          className="mt-3.5 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Badge variant="secondary">{user.plan}</Badge>
        </Link>

        <h1 className="mt-2.5 text-center font-heading text-2xl font-semibold tracking-tight">
          {user.display_name}
        </h1>
        <p className="mt-1 text-center text-sm text-muted-foreground">{user.email}</p>

        {/* Search pill */}
        <div ref={searchRoot} className="relative mt-8 w-full max-w-xl">
          <div className="flex h-12 w-full items-center gap-3 rounded-full bg-card px-5 transition-colors focus-within:bg-surface-raised">
            <Search className="size-4 shrink-0 text-muted-foreground" />
            <input
              ref={searchInput}
              type="text"
              role="combobox"
              aria-expanded={showDropdown}
              aria-controls="account-home-search-results"
              aria-label={t("account.home.searchPlaceholder", { brand: APP_CONFIG.brandName })}
              placeholder={t("account.home.searchPlaceholder", { brand: APP_CONFIG.brandName })}
              value={query}
              onFocus={() => setSearchOpen(true)}
              onChange={(event) => {
                setQuery(event.target.value)
                setActiveIndex(0)
                setSearchOpen(true)
              }}
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  setSearchOpen(false)
                  setQuery("")
                  searchInput.current?.blur()
                } else if (event.key === "ArrowDown" && results.length > 0) {
                  event.preventDefault()
                  setActiveIndex((prev) => (prev + 1) % results.length)
                } else if (event.key === "ArrowUp" && results.length > 0) {
                  event.preventDefault()
                  setActiveIndex((prev) => (prev - 1 + results.length) % results.length)
                } else if (event.key === "Enter" && results[safeIndex]) {
                  event.preventDefault()
                  go(results[safeIndex].href)
                }
              }}
              className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
            {query ? (
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                aria-label={t("common.close")}
                onClick={() => {
                  setQuery("")
                  searchInput.current?.focus()
                }}
              >
                <X />
              </Button>
            ) : (
              <kbd className="hidden rounded-full bg-background px-2 py-0.5 font-mono text-[11px] text-muted-foreground sm:inline-block">
                /
              </kbd>
            )}
          </div>

          {showDropdown && (
            <div
              id="account-home-search-results"
              role="listbox"
              className="absolute inset-x-0 top-full z-20 mt-2 flex flex-col gap-0.5 rounded-card bg-popover p-1.5 text-popover-foreground shadow-2xl ring-1 ring-foreground/5 dark:ring-foreground/10"
            >
              {results.length === 0 ? (
                <p className="px-4 py-3 text-center text-sm text-muted-foreground">
                  {t("account.home.searchEmpty")}
                </p>
              ) : (
                results.map((item, index) => (
                  <button
                    key={item.id}
                    type="button"
                    role="option"
                    aria-selected={index === safeIndex}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => go(item.href)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-full px-4 py-2.5 text-left text-sm transition-colors outline-none",
                      index === safeIndex ? "bg-accent text-accent-foreground" : "hover:bg-accent"
                    )}
                  >
                    <item.icon className="size-4 shrink-0 text-muted-foreground" />
                    <span className="min-w-0 flex-1 truncate font-medium">{t(item.title)}</span>
                    <span className="hidden max-w-[45%] truncate text-xs text-muted-foreground sm:inline">
                      {t(item.description)}
                    </span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* Quick-access wireframe pills */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          {QUICK_PILLS.filter((pill) => !pill.adminOnly || isAdmin).map((pill) => (
            <Button
              key={pill.href}
              variant="outline"
              size="sm"
              render={
                <Link
                  href={pill.href}
                  transitionTypes={pill.href === ADMIN_HOME ? [NAV_FORWARD] : undefined}
                />
              }
              nativeButton={false}
            >
              {t(pill.label)}
            </Button>
          ))}
        </div>

        {/* Single contextual spotlight card */}
        <div className="mt-8 w-full max-w-xl rounded-card bg-card p-6">
          {!dismissedTip && isAdmin ? (
            <div className="flex flex-col gap-5">
              <div className="flex items-start gap-4">
                <Sparkles className="mt-0.5 size-6 shrink-0 stroke-[1.5] text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <p className="text-base font-medium">
                    {t("account.home.spotlightTitle")}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {t("account.home.spotlightBody")}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setDismissedTip(true)}
                >
                  {t("account.home.spotlightDismiss")}
                </Button>
                <Button
                  size="sm"
                  render={<Link href={ADMIN_HOME} transitionTypes={[NAV_FORWARD]} />}
                  nativeButton={false}
                >
                  {t("account.home.spotlightAction")}
                  <ArrowRight data-icon="inline-end" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              <div className="flex items-start gap-4">
                <Layers className="mt-0.5 size-6 shrink-0 stroke-[1.5] text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <p className="text-base font-medium">
                    {t("account.home.planTitle", { plan: user.plan })}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {t("account.home.planBody", { email: user.email })}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-end gap-2">
                <Button
                  size="sm"
                  render={<Link href={PROFILE_PATH} />}
                  nativeButton={false}
                >
                  {t("account.home.viewProfile")}
                  <ArrowRight data-icon="inline-end" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quiet footer */}
      <footer className="mt-12 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-center text-xs text-muted-foreground">
        <ShieldCheck className="size-4 shrink-0" />
        <span>{t("account.home.privacyNote")}</span>
        <Link
          href={APPEARANCE_PATH}
          className="text-foreground underline-offset-4 hover:underline"
        >
          {t("account.home.privacyLink")}
        </Link>
      </footer>
    </div>
  )
}
