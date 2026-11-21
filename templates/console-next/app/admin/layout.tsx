"use client"

import { AppConsole } from "@/components/console/app-console"
import { SessionGate } from "@/components/session-gate"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SessionGate requireAdmin>
      <AppConsole section="admin">{children}</AppConsole>
    </SessionGate>
  )
}
