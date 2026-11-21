# Anywhere UI Console — Agent Guidelines

This project was scaffolded with **Anywhere UI** (Next.js 16 + Tailwind CSS v4 + Base UI + shadcn + TanStack Query).

Read [`.agents/skills/anywhere-ui/SKILL.md`](./.agents/skills/anywhere-ui/SKILL.md) before adding or modifying UI components.

## Business Integration Points (Only 3 Files to Replace)

1. `lib/config.ts`: Set `brandName`, `description`, `defaultLocale`, and `enableAdminConsole`.
2. `lib/session.ts`: Implement `AuthAdapter` against your backend auth API / OIDC BFF and replace `export const authAdapter`.
3. `lib/items-store.ts`: Replace demo queries/mutations with your real API client (and add your domain routes under `app/admin/` or `app/account/`).

## Design Guardrails (Verified by `tests/design-discipline.test.ts`)

- **Semantic color tokens only**: no hard-coded hex colors in `.tsx` files (except `viewport.themeColor` in `app/layout.tsx`).
- **Typography**: `"HarmonyOS Sans SC"` (CJK-only variable subsets from `@luzixu/harmonyos-sans`) precedes `"SF Pro Text"` / `"SF Pro Display"` / `"Segoe UI"` so Chinese uses HarmonyOS Sans while English stays on native SF Pro / Segoe UI.
- **Two-tier corners**: multi-line rectangles use `corner-shape: superellipse(1.35)` with `--radius-card` (~31px); circles and pills (`[class*="rounded-full"]`, buttons, inputs, badges, switches, sidebar pills, pill tabs, avatars) stay strictly `corner-shape: round`. Never use `[class*="-full"]`.
- **Borderless discipline**: cards (`rounded-card bg-card`), theme tiles, avatars, standalone icons (no gray circle box behind lone icons), and icon-only buttons (`variant="ghost"`).
- **Wordmark & mobile top bar**: sidebar wordmark (`SectionSwitcher`) never paints a hover background; mobile `CollapsedNavBar` keeps the sidebar trigger as a standalone ghost icon button beside the hover-free wordmark.
- **Bilingual parity**: update both `lib/locales/en.ts` and `lib/locales/zh-CN.ts` together (`tests/i18n.test.ts` verifies exact key and placeholder parity).

## Adding More Anywhere UI Components

```bash
npx shadcn@latest add anywhere-labs/anywhere-ui/<component>
```

## Verification

```bash
corepack yarn typecheck && corepack yarn lint && corepack yarn test && corepack yarn build
```
