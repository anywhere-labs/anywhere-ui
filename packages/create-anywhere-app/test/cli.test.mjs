import assert from "node:assert/strict"
import { spawnSync } from "node:child_process"
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import path from "node:path"
import { test } from "node:test"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const CLI = path.resolve(__dirname, "../bin/create-anywhere-app.mjs")

function runCli(args, cwd) {
  return spawnSync(process.execPath, [CLI, ...args], {
    cwd,
    encoding: "utf8",
  })
}

test("--help prints usage", () => {
  const res = runCli(["--help"], process.cwd())
  assert.equal(res.status, 0)
  assert.match(res.stdout, /create-anywhere-app/)
  assert.match(res.stdout, /--brand/)
})

test("scaffolds a complete console project with custom brand and locale", () => {
  const sandbox = mkdtempSync(path.join(tmpdir(), "anywhere-ui-cli-"))
  try {
    const res = runCli(
      [
        "acme-console",
        "--brand",
        "Acme Cloud",
        "--locale",
        "zh-CN",
        "--no-install",
        "--no-git",
        "--yes",
      ],
      sandbox
    )
    assert.equal(res.status, 0, res.stderr)

    const project = path.join(sandbox, "acme-console")
    const pkg = JSON.parse(readFileSync(path.join(project, "package.json"), "utf8"))
    assert.equal(pkg.name, "acme-console")

    const config = readFileSync(path.join(project, "lib/config.ts"), "utf8")
    assert.match(config, /brandName: "Acme Cloud"/)
    assert.match(config, /defaultLocale: "zh-CN"/)
    assert.match(config, /enableAdminConsole: true/)

    assert.ok(existsSync(path.join(project, "app/globals.css")))
    assert.ok(existsSync(path.join(project, "app/harmonyos-sans-sc.css")))
    assert.ok(existsSync(path.join(project, "app/account/page.tsx")))
    assert.ok(existsSync(path.join(project, "app/admin/items/page.tsx")))
    assert.ok(existsSync(path.join(project, ".agents/skills/anywhere-ui/SKILL.md")))
    assert.ok(existsSync(path.join(project, "tests/design-discipline.test.ts")))
    assert.ok(!existsSync(path.join(project, "yarn.lock")))
  } finally {
    rmSync(sandbox, { recursive: true, force: true })
  }
})

test("--no-admin omits /admin routes and disables enableAdminConsole", () => {
  const sandbox = mkdtempSync(path.join(tmpdir(), "anywhere-ui-noadmin-"))
  try {
    const res = runCli(
      ["account-only", "--no-admin", "--no-install", "--no-git", "--yes"],
      sandbox
    )
    assert.equal(res.status, 0, res.stderr)

    const project = path.join(sandbox, "account-only")
    assert.ok(!existsSync(path.join(project, "app/admin")))
    const config = readFileSync(path.join(project, "lib/config.ts"), "utf8")
    assert.match(config, /enableAdminConsole: false/)
  } finally {
    rmSync(sandbox, { recursive: true, force: true })
  }
})

test("refuses non-empty target directory without --force", () => {
  const sandbox = mkdtempSync(path.join(tmpdir(), "anywhere-ui-nonempty-"))
  try {
    writeFileSync(path.join(sandbox, "existing.txt"), "keep", "utf8")
    const res = runCli([".", "--no-install", "--no-git", "--yes"], sandbox)
    assert.notEqual(res.status, 0)
    assert.match(res.stderr, /not empty/)
  } finally {
    rmSync(sandbox, { recursive: true, force: true })
  }
})
