"use client"

import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense, useState } from "react"

import { PasswordInput } from "@/components/auth/password-input"
import { Field } from "@/components/field"
import { useI18n } from "@/components/i18n-provider"
import { LanguageButton } from "@/components/language-menu"
import { SignInShell, StepHeading } from "@/components/sign-in/sign-in-shell"
import { FullPageSpinner } from "@/components/spinner"
import { Button } from "@/components/ui/button"
import { APP_CONFIG } from "@/lib/config"
import { useSignIn } from "@/lib/session"

function PasswordForm() {
  const { t } = useI18n()
  const router = useRouter()
  const params = useSearchParams()
  const signIn = useSignIn()

  const email = params.get("email") || "admin@anywhere.dev"
  const next = params.get("next") || "/account"
  const [password, setPassword] = useState("")

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    signIn.mutate(
      { email, password },
      { onSuccess: () => router.replace(next) }
    )
  }

  return (
    <SignInShell
      brandName={APP_CONFIG.brandName}
      headerEnd={<LanguageButton />}
      footer={
        <Link
          href={`/sign-in?${new URLSearchParams({ email, next }).toString()}`}
          className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          {t("signIn.changeAccount")}
        </Link>
      }
    >
      <div className="flex w-full max-w-sm flex-col gap-6">
        <StepHeading title={t("signIn.title")} description={email} />
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field label={t("signIn.passwordLabel")} htmlFor="sign-in-password">
            <PasswordInput
              id="sign-in-password"
              autoComplete="current-password"
              autoFocus
              placeholder={t("signIn.passwordPlaceholder")}
              showLabel={t("common.showPassword")}
              hideLabel={t("common.hidePassword")}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </Field>
          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={signIn.isPending}
          >
            {t("signIn.submit")}
          </Button>
        </form>
      </div>
    </SignInShell>
  )
}

export default function PasswordSignInPage() {
  return (
    <Suspense fallback={<FullPageSpinner />}>
      <PasswordForm />
    </Suspense>
  )
}
