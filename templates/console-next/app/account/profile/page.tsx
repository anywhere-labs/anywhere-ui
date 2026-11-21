"use client"

import { useState } from "react"
import { toast } from "sonner"

import { CopyableValue } from "@/components/console/copyable-value"
import { FormField, FormSection } from "@/components/console/form-layout"
import { PageContainer, PageHeader } from "@/components/console/page-header"
import { UserAvatar } from "@/components/console/user-avatar"
import { useI18n } from "@/components/i18n-provider"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useSession, useUpdateProfile } from "@/lib/session"

export default function ProfilePage() {
  const { t } = useI18n()
  const user = useSession().data?.user
  const updateProfile = useUpdateProfile()
  const [draftName, setDraftName] = useState<string | null>(null)

  if (!user) return null
  const displayName = draftName ?? user.display_name
  const dirty = displayName.trim() !== "" && displayName.trim() !== user.display_name

  const handleSave = (event: React.FormEvent) => {
    event.preventDefault()
    if (!dirty) return
    updateProfile.mutate(
      { display_name: displayName },
      {
        onSuccess: () => {
          setDraftName(null)
          toast.success(t("account.profile.updated"))
        },
      }
    )
  }

  return (
    <PageContainer className="max-w-3xl">
      <PageHeader
        title={t("account.profile.title")}
        description={t("account.profile.description")}
      />

      <div className="flex flex-col gap-5 rounded-card bg-card p-6">
        <div className="flex items-center gap-4">
          <UserAvatar user={user} className="size-14 text-lg" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="truncate text-base font-medium">{user.display_name}</p>
              <Badge variant="secondary">{user.plan}</Badge>
            </div>
            <p className="mt-0.5 truncate text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>
        <CopyableValue
          label={t("account.profile.accountId")}
          value={user.id}
          copyLabel={t("common.copy")}
          copyFailedLabel={t("common.copyFailed")}
        />
      </div>

      <form onSubmit={handleSave}>
        <FormSection title={t("account.profile.identitySection")}>
          <FormField label={t("account.profile.displayName")} htmlFor="profile-display-name">
            <Input
              id="profile-display-name"
              value={displayName}
              onChange={(event) => setDraftName(event.target.value)}
            />
          </FormField>
          <FormField label={t("account.profile.email")} htmlFor="profile-email">
            <Input id="profile-email" value={user.email} disabled />
          </FormField>
          <div className="flex justify-end">
            <Button type="submit" disabled={!dirty || updateProfile.isPending}>
              {updateProfile.isPending ? t("common.saving") : t("common.save")}
            </Button>
          </div>
        </FormSection>
      </form>
    </PageContainer>
  )
}
