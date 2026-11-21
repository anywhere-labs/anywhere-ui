# Anywhere UI — Agent Working Guide

This repository is the **single source of truth** for the Anywhere Labs web visual design system, shadcn Source Registry, and Next.js console starter template (`templates/console-next/`).

## Repository Layout

| Path | Role |
| --- | --- |
| `templates/console-next/` | **Canonical source of truth** for tokens, UI primitives, Console components, starter pages, and guardrails. Always edit here first. |
| `skills/anywhere-ui/SKILL.md` | Canonical reusable AI Agent Skill describing the design system. Copied to `templates/console-next/.agents/skills/anywhere-ui/SKILL.md` and `registry/bundles/files/` by `scripts/sync-registry.mjs`. |
| `registry.json` & `registry/*/registry.json` | shadcn Source Registry manifests (`npx shadcn@latest add anywhere-labs/anywhere-ui/<item>`). |
| `registry/*/files/` | Synced copies of canonical files for shadcn Registry builds. Never hand-edit without running `node scripts/sync-registry.mjs`. |
| `packages/create-anywhere-app/` | Zero-dependency Node ESM scaffold CLI (`npx github:anywhere-labs/anywhere-ui <dir>`). |
| `scripts/sync-registry.mjs` | Syncs canonical files from `templates/console-next/` and `skills/` into `registry/` (`--check` fails CI on drift). |

## Core Design System Invariants (Do Not Regress)

Read [`skills/anywhere-ui/SKILL.md`](./skills/anywhere-ui/SKILL.md) before making UI changes. Key invariants enforced by `templates/console-next/tests/design-discipline.test.ts`:

1. **Semantic tokens only**: zero hard-coded hex colors in `.tsx` files (except `viewport.themeColor` in `app/layout.tsx`).
2. **Pure monochrome dark-first palette**: `#000000` canvas, `#141414` borderless cards, `#ffffff` light canvas, `#f3f3f3` light cards, `oklch(0.92 0 0)` light sidebar active pill.
3. **Typography**: `"HarmonyOS Sans SC"` (CJK-only variable WOFF2 subsets from `@luzixu/harmonyos-sans`, omitting ASCII/Latin) ahead of `"SF Pro Text"` / `"SF Pro Display"`, `-apple-system`, `BlinkMacSystemFont`, `"Segoe UI"`. English remains native SF Pro / Segoe UI; Chinese renders in HarmonyOS Sans across macOS, Windows, and Linux.
4. **Two-tier corner geometry**:
   - Multi-line rounded rectangles (`rounded-xl`..`rounded-card`): `corner-shape: superellipse(1.35)` with `--radius: 0.75rem`, `--radius-card-max: 32px` (`rounded-card`).
   - Circles & pills (`[class*="rounded-full"]`, buttons, inputs, badges, switches, sidebar pills, pill tabs, avatars, radios): strictly `corner-shape: round`. Never use `[class*="-full"]` (matches `w-full` / `h-full`).
5. **Controls & chrome**:
   - Pill buttons (`default` emphasized filled pill, `outline` non-emphasized wireframe pill, optical pill padding `px-4` / `px-5`).
   - `base-luma` pill-in-pill `Switch` (`h-5 w-11` track, `h-4 w-6` pill thumb, readable dark/light contrast).
   - Borderless cards, borderless avatars, borderless standalone icons (no gray circle box behind single icons), borderless `ghost` icon-only buttons.
   - Top sidebar wordmark (`SectionSwitcher`) has **no hover/selected background** (interactive on click only).
   - Mobile `CollapsedNavBar` keeps the expand-sidebar button as a standalone ghost icon button separate from the hover-free wordmark.
6. **ViewTransition motion**: `<ViewTransition>` via `PageTransition` + `useRevealInTransition` (`console-enter`, `page-rise`, `nav-forward`, `nav-back`).

## Verification Before Pushing

1. Never commit lockfiles (`yarn.lock`, `package-lock.json`, `pnpm-lock.yaml`).
2. After editing `templates/console-next/` or `skills/anywhere-ui/SKILL.md`:
   - `node scripts/sync-registry.mjs`
   - `node scripts/sync-registry.mjs --check`
   - `npx --yes shadcn@latest registry validate ./registry.json`
   - `node --test packages/create-anywhere-app/test/cli.test.mjs`
   - Inside `templates/console-next/` (or a scaffolded temp directory): `corepack yarn typecheck && corepack yarn lint && corepack yarn test && corepack yarn build`.
3. Keep `README.md` (中文) and `README.en.md` (English) in sync.
