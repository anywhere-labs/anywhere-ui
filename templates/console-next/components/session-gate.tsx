"use client"

import { usePathname, useRouter } from "next/navigation"
import { useEffect } from "react"

import { useRevealInTransition } from "@/components/console/use-reveal-in-transition"
import { FullPageSpinner } from "@/components/spinner"
import { useSession } from "@/lib/session"

/**
 * Guards a console section behind an active session. Reveals children via
 * `useRevealInTransition` so the console shell's `<ViewTransition>`
 * (`console-enter`) plays smoothly on initial arrival and reload.
 */
export function SessionGate({
  requireAdmin = false,
  children,
}: {
  requireAdmin?: boolean
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const session = useSession()
  const user = session.data?.user

  const ready = Boolean(user && (!requireAdmin || user.role === "admin"))
  const revealed = useRevealInTransition(ready)

  useEffect(() => {
    if (session.isPending) return
    if (!user) {
      const next = pathname && pathname !== "/" ? `?next=${encodeURIComponent(pathname)}` : ""
      router.replace(`/sign-in${next}`)
    } else if (requireAdmin && user.role !== "admin") {
      router.replace("/account")
    }
  }, [session.isPending, user, requireAdmin, pathname, router])

  if (!revealed) return <FullPageSpinner />
  return <>{children}</>
}
