#!/usr/bin/env node
import { mkdirSync, readFileSync, existsSync, writeFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const template = path.join(root, "templates/console-next")
const checkOnly = process.argv.includes("--check")

/**
 * Canonical source -> synced target mappings.
 * `templates/console-next/` and `skills/anywhere-ui/SKILL.md` are the single
 * sources of truth; running this script keeps `registry/` and the template's
 * embedded `.agents/skills/` copy 100% synchronized.
 */
const UI_COMPONENTS = [
  "alert-dialog.tsx",
  "avatar.tsx",
  "badge.tsx",
  "button.tsx",
  "checkbox.tsx",
  "dialog.tsx",
  "dropdown-menu.tsx",
  "input-group.tsx",
  "input.tsx",
  "label.tsx",
  "popover.tsx",
  "radio-group.tsx",
  "scroll-area.tsx",
  "separator.tsx",
  "sheet.tsx",
  "sidebar.tsx",
  "skeleton.tsx",
  "sonner.tsx",
  "switch.tsx",
  "table.tsx",
  "tabs.tsx",
  "textarea.tsx",
  "tooltip.tsx",
]

const CONSOLE_COMPONENTS = [
  "components/brand-wordmark-path.ts",
  "components/brand-wordmark.tsx",
  "components/copy-button.tsx",
  "components/dropdown-select.tsx",
  "components/field.tsx",
  "components/spinner.tsx",
  "components/auth/password-input.tsx",
  "components/sign-in/or-divider.tsx",
  "components/sign-in/sign-in-shell.tsx",
  "components/console/action-list.tsx",
  "components/console/collapsed-nav-bar.tsx",
  "components/console/confirm-dialog.tsx",
  "components/console/console-shell.tsx",
  "components/console/console-sidebar.tsx",
  "components/console/copyable-value.tsx",
  "components/console/data-table.tsx",
  "components/console/form-layout.tsx",
  "components/console/nav.ts",
  "components/console/page-header.tsx",
  "components/console/page-transition.tsx",
  "components/console/pagination.tsx",
  "components/console/search-input.tsx",
  "components/console/section-switcher.tsx",
  "components/console/use-reveal-in-transition.ts",
  "components/console/user-avatar.tsx",
]

const copies = [
  // Skill into starter template
  [
    path.join(root, "skills/anywhere-ui/SKILL.md"),
    path.join(template, ".agents/skills/anywhere-ui/SKILL.md"),
  ],
  // Theme & core utilities
  [
    path.join(template, "app/globals.css"),
    path.join(root, "registry/theme/files/globals.css"),
  ],
  [
    path.join(template, "app/harmonyos-sans-sc.css"),
    path.join(root, "registry/theme/files/harmonyos-sans-sc.css"),
  ],
  [
    path.join(template, "lib/utils.ts"),
    path.join(root, "registry/theme/files/utils.ts"),
  ],
  [
    path.join(template, "hooks/use-mobile.ts"),
    path.join(root, "registry/theme/files/use-mobile.ts"),
  ],
  // UI primitives
  ...UI_COMPONENTS.map((file) => [
    path.join(template, "components/ui", file),
    path.join(root, "registry/ui/files", file),
  ]),
  // Console & auth kit components
  ...CONSOLE_COMPONENTS.map((rel) => [
    path.join(template, rel),
    path.join(root, "registry/console/files", rel.replace(/^components\//, "")),
  ]),
  // AI guardrail bundle
  [
    path.join(template, "AGENTS.md"),
    path.join(root, "registry/bundles/files/AGENTS.md"),
  ],
  [
    path.join(root, "skills/anywhere-ui/SKILL.md"),
    path.join(root, "registry/bundles/files/SKILL.md"),
  ],
  [
    path.join(template, "tests/design-discipline.test.ts"),
    path.join(root, "registry/bundles/files/design-discipline.test.ts"),
  ],
]

const drifted = []
let updated = 0

for (const [src, dst] of copies) {
  const expected = readFileSync(src, "utf8")
  const actual = existsSync(dst) ? readFileSync(dst, "utf8") : null
  if (actual !== expected) {
    if (checkOnly) {
      drifted.push(`${path.relative(root, dst)} (from ${path.relative(root, src)})`)
    } else {
      mkdirSync(path.dirname(dst), { recursive: true })
      writeFileSync(dst, expected, "utf8")
      updated++
    }
  }
}

if (checkOnly) {
  if (drifted.length > 0) {
    console.error("Registry sync drift detected:\n" + drifted.map((d) => `  - ${d}`).join("\n"))
    console.error("\nRun `node scripts/sync-registry.mjs` to update synced files.")
    process.exit(1)
  }
  console.log(`All ${copies.length} synced registry files match canonical sources.`)
} else {
  console.log(`Synced ${copies.length} files (${updated} updated).`)
}
