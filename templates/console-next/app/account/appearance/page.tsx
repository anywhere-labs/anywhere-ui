"use client"

import { Languages, Monitor, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useSyncExternalStore } from "react"

import { ActionList, ActionRow } from "@/components/console/action-list"
import { PageContainer, PageHeader } from "@/components/console/page-header"
import { DropdownSelect } from "@/components/dropdown-select"
import { useI18n } from "@/components/i18n-provider"
import { LOCALES, LOCALE_LABELS, isLocale } from "@/lib/i18n"
import { cn } from "@/lib/utils"

const themes = [
  { value: "light", title: "common.themeLight", icon: Sun },
  { value: "dark", title: "common.themeDark", icon: Moon },
  { value: "system", title: "common.themeSystem", icon: Monitor },
] as const

export default function AppearancePage() {
  const { t, locale, setLocale } = useI18n()
  const { theme, setTheme } = useTheme()
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )

  return (
    <PageContainer className="max-w-3xl">
      <PageHeader
        title={t("account.appearance.title")}
        description={t("account.appearance.description")}
      />

      <section className="flex flex-col gap-3">
        <div>
          <h2 className="text-base font-semibold">{t("account.appearance.theme")}</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {t("account.appearance.themeDescription")}
          </p>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {themes.map((item) => {
            const active = mounted && theme === item.value
            return (
              <button
                key={item.value}
                type="button"
                aria-pressed={active}
                onClick={() => setTheme(item.value)}
                className={cn(
                  "flex h-20 flex-col items-center justify-center gap-1.5 rounded-2xl bg-card text-sm text-muted-foreground transition-colors outline-none hover:bg-surface-hover hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring",
                  active && "bg-secondary font-medium text-foreground"
                )}
              >
                <item.icon
                  className={cn("size-5", active ? "text-foreground" : "text-muted-foreground")}
                />
                {t(item.title)}
              </button>
            )
          })}
        </div>
      </section>

      <ActionList className="border-t">
        <ActionRow
          icon={Languages}
          title={t("common.language")}
          description={t("account.appearance.languageDescription")}
          action={
            <DropdownSelect
              label={t("common.language")}
              value={locale}
              options={LOCALES.map((code) => ({ value: code, label: LOCALE_LABELS[code] }))}
              onChange={(value) => {
                if (isLocale(value)) setLocale(value)
              }}
              variant="outline"
              align="end"
            />
          }
        />
      </ActionList>
    </PageContainer>
  )
}
