"use client"

import { ArrowRight, Layers, Settings } from "lucide-react"
import Link from "next/link"

import { ActionList, ActionRow } from "@/components/console/action-list"
import { ADMIN_ITEMS_PATH, ADMIN_SETTINGS_PATH } from "@/components/console/app-console"
import { PageContainer, PageHeader } from "@/components/console/page-header"
import { useI18n } from "@/components/i18n-provider"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useManagedItems } from "@/lib/items-store"

export default function AdminOverviewPage() {
  const { t } = useI18n()
  const items = useManagedItems("", "all")
  const rows = items.data ?? []
  const activeCount = rows.filter((item) => item.status === "active").length
  const draftCount = rows.filter((item) => item.status === "draft").length

  const metrics = [
    { label: t("admin.overview.metricTotal"), value: rows.length },
    { label: t("admin.overview.metricActive"), value: activeCount },
    { label: t("admin.overview.metricDraft"), value: draftCount },
  ]

  return (
    <PageContainer>
      <PageHeader
        title={t("admin.overview.title")}
        description={t("admin.overview.description")}
        actions={
          <Button render={<Link href={ADMIN_ITEMS_PATH} />} nativeButton={false}>
            {t("admin.items.new")}
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        {metrics.map((metric) => (
          <div key={metric.label} className="flex flex-col gap-2 rounded-card bg-card p-6">
            <span className="text-sm text-muted-foreground">{metric.label}</span>
            {items.isPending ? (
              <Skeleton className="h-8 w-16 rounded-full" />
            ) : (
              <span className="font-heading text-3xl font-semibold tracking-tight tabular-nums">
                {metric.value}
              </span>
            )}
          </div>
        ))}
      </div>

      <section className="flex flex-col gap-2">
        <h2 className="text-base font-semibold">{t("admin.overview.quickActions")}</h2>
        <ActionList className="border-t">
          <ActionRow
            icon={Layers}
            title={t("admin.overview.manageItems")}
            description={t("admin.overview.manageItemsDesc")}
            action={
              <Button
                variant="outline"
                size="sm"
                render={<Link href={ADMIN_ITEMS_PATH} />}
                nativeButton={false}
              >
                {t("shell.navItems")}
                <ArrowRight data-icon="inline-end" />
              </Button>
            }
          />
          <ActionRow
            icon={Settings}
            title={t("admin.overview.manageSettings")}
            description={t("admin.overview.manageSettingsDesc")}
            action={
              <Button
                variant="outline"
                size="sm"
                render={<Link href={ADMIN_SETTINGS_PATH} />}
                nativeButton={false}
              >
                {t("shell.navSettings")}
                <ArrowRight data-icon="inline-end" />
              </Button>
            }
          />
        </ActionList>
      </section>
    </PageContainer>
  )
}
