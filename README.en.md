# Anywhere UI

**English** · [简体中文](./README.md)

**Anywhere UI** is Anywhere Labs' monochrome, dark-first web design system, public shadcn GitHub Source Registry, and one-click Next.js console starter — distilled from `Agents Anywhere`, `Tokens Anywhere`, and our unified identity console.

## One-Click Console & Admin Scaffold

Run directly with zero global installation:

```bash
npx github:anywhere-labs/anywhere-ui my-console
```

Or pass flags non-interactively:

```bash
npx github:anywhere-labs/anywhere-ui my-console \
  --brand "My Workspace" \
  --locale en \
  --yes
```

Available flags:

| Flag | Description |
| --- | --- |
| `--brand <name>` | Brand wordmark & page title (default: `"Agents Anywhere"`) |
| `--slug <name>` | `package.json` name (defaults to directory basename) |
| `--locale <en\|zh-CN>` | Fallback locale (browser still auto-detects `zh-CN` / `en`) |
| `--no-admin` | Omit `/admin` routes for an account-only console |
| `--no-install` | Skip running `corepack yarn install` |
| `--no-git` | Skip running `git init` |
| `-y, --yes` | Skip interactive prompts |

### Connect Your Real Backend in 3 Files

The generated project runs out of the box (`corepack yarn dev`) with a built-in demo session and sample CRUD store. To wire real business logic, replace only:

1. **`lib/config.ts`** — brand name, description, default locale, and feature flags.
2. **`lib/session.ts`** — implement `AuthAdapter` against your own backend (cookie session, OIDC BFF, FastAPI, NextAuth, etc.) while keeping `SessionGate` and `<ViewTransition>` motion intact.
3. **`lib/items-store.ts`** — replace the demo CRUD/settings hooks with your API client and add domain routes under `app/admin/` and `app/account/`.

---

## Install Into an Existing Next.js App (shadcn GitHub Registry)

This repository works natively as a public shadcn GitHub Source Registry:

```bash
# Full console kit (theme tokens + CJK HarmonyOS Sans SC + all 23 UI primitives + ConsoleShell / DataTable / FormLayout / SignInShell)
npx shadcn@latest add anywhere-labs/anywhere-ui/anywhere-console

# Base theme + core pill/G2 UI primitives only
npx shadcn@latest add anywhere-labs/anywhere-ui/anywhere-base

# AI guardrails (AGENTS.md + .agents/skills/anywhere-ui/SKILL.md + tests/design-discipline.test.ts)
npx shadcn@latest add anywhere-labs/anywhere-ui/anywhere-ai-kit

# Individual primitives or console modules
npx shadcn@latest add anywhere-labs/anywhere-ui/button
npx shadcn@latest add anywhere-labs/anywhere-ui/switch
npx shadcn@latest add anywhere-labs/anywhere-ui/data-table
npx shadcn@latest add anywhere-labs/anywhere-ui/console-shell
```

Browse all available items:

```bash
npx shadcn@latest list anywhere-labs/anywhere-ui
```

---

## Design System Highlights

Full rules live in [`skills/anywhere-ui/SKILL.md`](./skills/anywhere-ui/SKILL.md):

- **Monochrome semantic tokens**: pure `#000000` dark canvas (default) with borderless `#141414` cards; `#ffffff` light canvas with `#f3f3f3` cards and clear `oklch(0.92 0 0)` sidebar active contrast. Zero hard-coded hex colors in `.tsx`.
- **Mixed Latin + CJK typography**: self-hosted variable **HarmonyOS Sans SC** (`@luzixu/harmonyos-sans`, CJK/punctuation subsets only) ahead of native **SF Pro / Segoe UI** — Chinese renders in HarmonyOS Sans across macOS/Windows/Linux while English remains native SF Pro / Segoe UI with zero CJK font download on pure English pages.
- **Two-tier corner geometry (`corner-shape`)**:
  - Cards, dialogs, popovers, textareas, tiles, and card skeletons use subtle G2 `superellipse(1.35)` (`--radius: 0.75rem`, `rounded-card` ≈ `31.2px`).
  - Pills and circles (`rounded-full`, buttons, single-line inputs, badges, switches, sidebar items, avatars) stay strictly `corner-shape: round`.
- **Restrained controls & chrome**:
  - Two pill button hierarchies: emphasized filled `default` and calm wireframe `outline`, with optical pill padding (`px-4` / `px-5`).
  - `base-luma` pill-in-pill `Switch` (`44×20` track + `24×16` pill thumb).
  - Borderless cards, theme tiles, avatars, standalone icons, and `ghost` icon-only buttons.
  - Hover-free sidebar wordmark (`SectionSwitcher`, interactive on click only), standalone top `Home` group, footer `AccountSwitcher` (switch accounts / add account / sign out), language consolidated into `Appearance` (no duplicate sidebar footer language row), and a standalone mobile sidebar trigger separate from the wordmark in `CollapsedNavBar`.
- **React `<ViewTransition>` motion**: `console-enter`, `page-rise`, `nav-forward` / `nav-back`, and calm sign-in entrance.

## Repository Layout & Local Checks

| Path | Purpose |
| --- | --- |
| `templates/console-next/` | Canonical Next.js 16 console starter template |
| `registry.json` & `registry/` | shadcn Source Registry manifests and synced source files |
| `packages/create-anywhere-app/` | Zero-dependency Node ESM scaffold CLI and test suite |
| `skills/anywhere-ui/SKILL.md` | Reusable AI Agent design system skill |
| `scripts/sync-registry.mjs` | Synchronizes canonical template & skill files into `registry/` (`--check` in CI) |

```bash
node scripts/sync-registry.mjs --check
npx --yes shadcn@latest registry validate ./registry.json
node --test packages/create-anywhere-app/test/cli.test.mjs
```
