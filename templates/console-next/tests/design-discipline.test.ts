import { readdirSync, readFileSync, statSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

import { describe, expect, it } from "vitest"

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")

function walk(dir: string, extensions: readonly string[]): string[] {
  const out: string[] = []
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry)
    if (statSync(full).isDirectory()) out.push(...walk(full, extensions))
    else if (extensions.some((ext) => full.endsWith(ext))) out.push(full)
  }
  return out
}

const componentFiles = [
  ...walk(path.join(root, "app"), [".tsx"]),
  ...walk(path.join(root, "components"), [".tsx"]),
]

describe("Anywhere UI design discipline", () => {
  it("uses semantic color tokens only: no hard-coded hex colors in TSX", () => {
    const offenders: string[] = []
    const hex = /(?<![\w&])#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\b/
    for (const file of componentFiles) {
      readFileSync(file, "utf8")
        .split("\n")
        .forEach((line, index) => {
          const themeColorMeta =
            file.endsWith(path.join("app", "layout.tsx")) && /color: "#/.test(line)
          if (hex.test(line) && !themeColorMeta) {
            offenders.push(`${path.relative(root, file)}:${index + 1}`)
          }
        })
    }
    expect(offenders).toEqual([])
  })

  it("preserves two-tier G2 corner geometry (superellipse(1.35) + round pills) and card scale", () => {
    const css = readFileSync(path.join(root, "app/globals.css"), "utf8")
    expect(css).toContain("@supports (corner-shape: superellipse(1.35))")
    expect(css).toContain("corner-shape: superellipse(1.35)")
    expect(css).toContain("corner-shape: round")
    expect(css).not.toContain('[class*="-full"]')
    expect(css).toContain("--radius: 0.75rem;")
    expect(css).toContain("--radius-card-max: 32px;")
    expect(css).toContain("--radius-card: min(var(--radius-4xl), var(--radius-card-max));")
    expect(css).toContain('"HarmonyOS Sans SC", "SF Pro Text"')
  })

  it("loads HarmonyOS Sans SC for CJK only without overriding Latin/ASCII", () => {
    const fontCss = readFileSync(path.join(root, "app/harmonyos-sans-sc.css"), "utf8")
    expect(fontCss).toContain('font-family: "HarmonyOS Sans SC";')
    expect(fontCss).not.toContain("font-text-")
    expect(fontCss).not.toMatch(/unicode-range:[^\n]*U\+20-7E/i)
  })

  it("keeps the sidebar wordmark hover-free and the mobile sidebar trigger standalone", () => {
    const switcher = readFileSync(
      path.join(root, "components/console/section-switcher.tsx"),
      "utf8"
    )
    expect(switcher).not.toContain("hover:bg-sidebar-accent")

    const navBar = readFileSync(
      path.join(root, "components/console/collapsed-nav-bar.tsx"),
      "utf8"
    )
    expect(navBar).not.toMatch(/<Button[\s\S]*?<BrandWordmark[\s\S]*?<\/Button>/)
  })
})
