#!/usr/bin/env node
import { spawnSync } from "node:child_process"
import {
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs"
import path from "node:path"
import { createInterface } from "node:readline/promises"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.resolve(__dirname, "../../..")
const TEMPLATE_DIR = path.join(REPO_ROOT, "templates/console-next")
const PKG = JSON.parse(readFileSync(path.join(REPO_ROOT, "package.json"), "utf8"))

const EXCLUDED_NAMES = new Set([
  "node_modules",
  ".next",
  "out",
  "dist",
  "build",
  ".turbo",
  ".yarn",
  "yarn.lock",
  "package-lock.json",
  "pnpm-lock.yaml",
  ".DS_Store",
])

function printHelp() {
  console.log(`create-anywhere-app v${PKG.version}

Scaffold a complete Anywhere UI console & admin application (Next.js 16,
Tailwind CSS v4, Base UI, shadcn, TanStack Query, HarmonyOS Sans SC + SF Pro,
ViewTransition motion, bilingual i18n, and built-in AI design guardrails).

Usage:
  npx github:anywhere-labs/anywhere-ui [target-dir] [options]
  create-anywhere-app [target-dir] [options]

Options:
  --brand <name>        Brand wordmark & title (default: "Agents Anywhere")
  --slug <name>         package.json name (default: directory basename)
  --locale <en|zh-CN>   Fallback locale (default: "en"; browser auto-detects zh-CN)
  --no-admin            Omit the /admin console section (account console only)
  --no-install          Skip running \`corepack yarn install\`
  --no-git              Skip initializing a git repository
  --force               Allow writing into a non-empty target directory
  -y, --yes             Skip interactive prompts and use defaults / flags
  -v, --version         Print version
  -h, --help            Show this help message
`)
}

function slugify(value) {
  return (
    value
      .toLowerCase()
      .replace(/[^a-z0-9._-]+/g, "-")
      .replace(/^[._-]+|[._-]+$/g, "") || "anywhere-console-app"
  )
}

function parseArgs(argv) {
  const opts = {
    dir: "",
    brand: "",
    slug: "",
    locale: "en",
    admin: true,
    install: true,
    git: true,
    force: false,
    yes: false,
    help: false,
    version: false,
  }

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    if (arg === "-h" || arg === "--help") {
      opts.help = true
    } else if (arg === "-v" || arg === "--version") {
      opts.version = true
    } else if (arg === "-y" || arg === "--yes") {
      opts.yes = true
    } else if (arg === "--no-admin") {
      opts.admin = false
    } else if (arg === "--no-install") {
      opts.install = false
    } else if (arg === "--no-git") {
      opts.git = false
    } else if (arg === "--force") {
      opts.force = true
    } else if (arg === "--brand" && argv[i + 1]) {
      opts.brand = argv[++i]
    } else if (arg.startsWith("--brand=")) {
      opts.brand = arg.slice("--brand=".length)
    } else if (arg === "--slug" && argv[i + 1]) {
      opts.slug = argv[++i]
    } else if (arg.startsWith("--slug=")) {
      opts.slug = arg.slice("--slug=".length)
    } else if (arg === "--locale" && argv[i + 1]) {
      opts.locale = argv[++i]
    } else if (arg.startsWith("--locale=")) {
      opts.locale = arg.slice("--locale=".length)
    } else if (arg.startsWith("-")) {
      throw new Error(`Unknown option: ${arg}`)
    } else if (!opts.dir) {
      opts.dir = arg
    } else {
      throw new Error(`Unexpected argument: ${arg}`)
    }
  }

  if (opts.locale !== "en" && opts.locale !== "zh-CN") {
    throw new Error(`Invalid --locale "${opts.locale}". Expected "en" or "zh-CN".`)
  }

  return opts
}

async function promptMissing(opts) {
  const interactive = !opts.yes && process.stdin.isTTY && process.stdout.isTTY
  if (!interactive) {
    return {
      ...opts,
      dir: opts.dir || "my-anywhere-console",
      brand: opts.brand || "Agents Anywhere",
    }
  }

  const rl = createInterface({ input: process.stdin, output: process.stdout })
  try {
    const dirAnswer = opts.dir
      ? opts.dir
      : (await rl.question("Project directory (my-anywhere-console): ")).trim() ||
        "my-anywhere-console"
    const brandAnswer = opts.brand
      ? opts.brand
      : (await rl.question("Brand name (Agents Anywhere): ")).trim() ||
        "Agents Anywhere"
    return { ...opts, dir: dirAnswer, brand: brandAnswer }
  } finally {
    rl.close()
  }
}

function escapeTsString(value) {
  return JSON.stringify(value)
}

function scaffold(opts) {
  const targetDir = path.resolve(process.cwd(), opts.dir)
  if (existsSync(targetDir)) {
    const entries = readdirSync(targetDir).filter((name) => name !== ".DS_Store")
    if (entries.length > 0 && !opts.force) {
      throw new Error(
        `Target directory "${opts.dir}" is not empty. Choose another directory or pass --force.`
      )
    }
  } else {
    mkdirSync(targetDir, { recursive: true })
  }

  cpSync(TEMPLATE_DIR, targetDir, {
    recursive: true,
    filter: (src) => !EXCLUDED_NAMES.has(path.basename(src)),
  })

  const packageName = slugify(opts.slug || path.basename(targetDir))
  const pkgPath = path.join(targetDir, "package.json")
  const templatePkg = JSON.parse(readFileSync(pkgPath, "utf8"))
  templatePkg.name = packageName
  writeFileSync(pkgPath, JSON.stringify(templatePkg, null, 2) + "\n", "utf8")

  // Update lib/config.ts with chosen brand, defaultLocale, and admin toggle.
  const configPath = path.join(targetDir, "lib/config.ts")
  const configContent = `/**
 * Business Swap #1: Application identity and feature flags.
 *
 * Update these values (or wire them to environment variables) to rebrand the
 * entire console — wordmark, page titles, default locale, and enabled sections.
 */
export const APP_CONFIG = {
  /** Displayed in the sidebar wordmark, sign-in header, and browser tab title. */
  brandName: ${escapeTsString(opts.brand)},
  /** Meta description for the application. */
  description: ${escapeTsString(`${opts.brand} console and admin workspace.`)},
  /** Fallback locale before client browser detection runs. */
  defaultLocale: ${escapeTsString(opts.locale)} as "en" | "zh-CN",
  /** Show the Admin console switcher destination for users with role === "admin". */
  enableAdminConsole: ${opts.admin ? "true" : "false"},
} as const
`
  writeFileSync(configPath, configContent, "utf8")

  if (!opts.admin) {
    rmSync(path.join(targetDir, "app/admin"), { recursive: true, force: true })
  }

  // Personalize generated README title
  const readmePath = path.join(targetDir, "README.md")
  if (existsSync(readmePath)) {
    const readme = readFileSync(readmePath, "utf8").replace(
      /^# .+$/m,
      `# ${opts.brand}`
    )
    writeFileSync(readmePath, readme, "utf8")
  }

  let gitInitialized = false
  if (opts.git && !existsSync(path.join(targetDir, ".git"))) {
    const res = spawnSync("git", ["init", "-b", "main"], {
      cwd: targetDir,
      stdio: "ignore",
    })
    gitInitialized = res.status === 0
  }

  let installed = false
  if (opts.install) {
    console.log("\nInstalling dependencies with `corepack yarn install`...")
    const res = spawnSync("corepack", ["yarn", "install"], {
      cwd: targetDir,
      stdio: "inherit",
    })
    installed = res.status === 0
    if (!installed) {
      console.warn(
        "\nWarning: `corepack yarn install` failed. Run `corepack yarn install` manually inside the project directory."
      )
    }
  }

  const displayDir = path.isAbsolute(opts.dir)
    ? targetDir
    : path.relative(process.cwd(), targetDir) || "."
  console.log(`\nCreated Anywhere UI console in ${displayDir}`)
  console.log(`  Brand:        ${opts.brand}`)
  console.log(`  Package name: ${packageName}`)
  console.log(`  Admin module: ${opts.admin ? "enabled (/admin)" : "disabled"}`)
  if (gitInitialized) console.log("  Git:          initialized on branch main")

  console.log("\nNext steps:")
  if (displayDir !== ".") console.log(`  cd ${displayDir}`)
  if (!installed) console.log("  corepack yarn install")
  console.log("  corepack yarn dev")
  console.log("\nConnect your real backend by replacing just 3 files:")
  console.log("  1. lib/config.ts       — brand name, locale & feature flags")
  console.log("  2. lib/session.ts      — AuthAdapter (OIDC / cookie session / API)")
  console.log("  3. lib/items-store.ts  — domain queries & mutations")
}

async function main() {
  const parsed = parseArgs(process.argv.slice(2))
  if (parsed.help) {
    printHelp()
    return
  }
  if (parsed.version) {
    console.log(PKG.version)
    return
  }
  const opts = await promptMissing(parsed)
  scaffold(opts)
}

main().catch((error) => {
  console.error(`Error: ${error instanceof Error ? error.message : String(error)}`)
  process.exit(1)
})
