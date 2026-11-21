"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Suspense, useState } from "react"

import { Field } from "@/components/field"
import { useI18n } from "@/components/i18n-provider"
import { LanguageButton } from "@/components/language-menu"
import { OrDivider } from "@/components/sign-in/or-divider"
import { SignInShell, StepHeading } from "@/components/sign-in/sign-in-shell"
import { FullPageSpinner } from "@/components/spinner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { APP_CONFIG } from "@/lib/config"
import { useSignIn } from "@/lib/session"

function SignInForm() {
  const { t } = useI18n()
  const router = useRouter()
  const params = useSearchParams()
  const signIn = useSignIn()
  const next = params.get("next") || "/account"
  const [email, setEmail] = useState(params.get("email") ?? "")

  const handleContinue = (event: React.FormEvent) => {
    event.preventDefault()
    const clean = email.trim() || "admin@anywhere.dev"
    const qs = new URLSearchParams({ email: clean, next })
    router.push(`/sign-in/password?${qs.toString()}`)
  }

  const handleDemoAdmin = () => {
    signIn.mutate(
      { email: "admin@anywhere.dev", password: "demo" },
      { onSuccess: () => router.replace(next) }
    )
  }

  return (
    <SignInShell
      brandName={APP_CONFIG.brandName}
      headerEnd={<LanguageButton />}
      footer={
        <p className="text-center text-xs text-muted-foreground">
          {t("signIn.demoHint")}
        </p>
      }
    >
      <div className="flex w-full max-w-sm flex-col gap-6">
        <StepHeading title={t("signIn.title")} />
        <form onSubmit={handleContinue} className="flex flex-col gap-4">
          <Field label={t("signIn.emailLabel")} htmlFor="sign-in-email">
            <Input
              id="sign-in-email"
              type="email"
              autoComplete="email"
              placeholder={t("signIn.emailPlaceholder")}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </Field>
          <Button type="submit" size="lg" className="w-full">
            {t("signIn.continue")}
          </Button>
        </form>
        <OrDivider label={t("common.or")} />
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="w-full"
          disabled={signIn.isPending}
          onClick={handleDemoAdmin}
        >
          {t("signIn.demoSso")}
        </Button>
      </div>
    </SignInShell>
  )
}

export default function SignInPage() {
  return (
    <Suspense fallback={<FullPageSpinner />}>
      <SignInForm />
    </Suspense>
  )
}
