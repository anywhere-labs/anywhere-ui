"use client"

import { useState } from "react"
import { toast } from "sonner"

import {
  CountedTextField,
  FormField,
  FormSection,
  SwitchField,
} from "@/components/console/form-layout"
import { PageContainer, PageHeader } from "@/components/console/page-header"
import { useI18n } from "@/components/i18n-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import {
  useSaveWorkspaceSettings,
  useWorkspaceSettings,
  type WorkspaceSettings,
} from "@/lib/items-store"

export default function AdminSettingsPage() {
  const { t } = useI18n()
  const settings = useWorkspaceSettings()
  const save = useSaveWorkspaceSettings()
  const [draft, setDraft] = useState<WorkspaceSettings | null>(null)

  if (settings.isPending || !settings.data) {
    return (
      <PageContainer className="max-w-3xl">
        <PageHeader title={t("admin.settings.title")} />
        <Skeleton className="h-44 w-full" />
      </PageContainer>
    )
  }

  const form = draft ?? settings.data
  const patch = (next: Partial<WorkspaceSettings>) => setDraft({ ...form, ...next })
  const dirty = draft !== null

  return (
    <PageContainer className="max-w-3xl">
      <PageHeader
        title={t("admin.settings.title")}
        description={t("admin.settings.description")}
      />

      <form
        onSubmit={(event) => {
          event.preventDefault()
          save.mutate(form, {
            onSuccess: () => {
              setDraft(null)
              toast.success(t("common.saved"))
            },
          })
        }}
      >
        <FormSection
          title={t("admin.settings.generalTitle")}
          description={t("admin.settings.generalDesc")}
        >
          <CountedTextField
            id="settings-site-name"
            label={t("admin.settings.siteName")}
            value={form.siteName}
            max={60}
            onChange={(siteName) => patch({ siteName })}
          />
          <FormField label={t("admin.settings.supportEmail")} htmlFor="settings-support-email">
            <Input
              id="settings-support-email"
              type="email"
              value={form.supportEmail}
              onChange={(event) => patch({ supportEmail: event.target.value })}
            />
          </FormField>
          <CountedTextField
            id="settings-announcement"
            label={t("admin.settings.announcement")}
            value={form.announcement}
            max={160}
            multiline
            placeholder={t("admin.settings.announcementPlaceholder")}
            onChange={(announcement) => patch({ announcement })}
          />
        </FormSection>

        <FormSection
          title={t("admin.settings.securityTitle")}
          description={t("admin.settings.securityDesc")}
        >
          <SwitchField
            htmlFor="settings-allow-signups"
            label={t("admin.settings.allowSignUps")}
            description={t("admin.settings.allowSignUpsDesc")}
            control={
              <Switch
                id="settings-allow-signups"
                checked={form.allowSignUps}
                onCheckedChange={(allowSignUps) => patch({ allowSignUps })}
              />
            }
          />
          <SwitchField
            htmlFor="settings-require-mfa"
            label={t("admin.settings.requireMfa")}
            description={t("admin.settings.requireMfaDesc")}
            control={
              <Switch
                id="settings-require-mfa"
                checked={form.requireMfaForAdmins}
                onCheckedChange={(requireMfaForAdmins) => patch({ requireMfaForAdmins })}
              />
            }
          />
          <FormField label={t("admin.settings.retentionDays")} htmlFor="settings-retention">
            <Input
              id="settings-retention"
              type="number"
              min={7}
              max={365}
              value={form.auditRetentionDays}
              onChange={(event) =>
                patch({ auditRetentionDays: Number(event.target.value) || 30 })
              }
              className="w-36 tabular-nums"
            />
          </FormField>
          <div className="flex justify-end">
            <Button type="submit" disabled={!dirty || save.isPending}>
              {save.isPending ? t("common.saving") : t("common.save")}
            </Button>
          </div>
        </FormSection>
      </form>
    </PageContainer>
  )
}
