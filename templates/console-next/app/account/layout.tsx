"use client"

import { AppConsole } from "@/components/console/app-console"
import { SessionGate } from "@/components/session-gate"

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SessionGate>
      <AppConsole section="account">{children}</AppConsole>
    </SessionGate>
  )
}
