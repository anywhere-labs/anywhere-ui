# Anywhere UI Design System Specification

[简体中文](./design-system.md) · **English**

**Anywhere UI** is Anywhere Labs' unified visual and interaction design system for web consoles, account centers, and admin dashboards — distilled from `Agents Anywhere`, `Tokens Anywhere`, and our unified identity console. This repository serves as the single source of truth, distributed via a public shadcn GitHub Source Registry and a zero-dependency project scaffold CLI.

---

## 1. Design Philosophy & Core Principles

Anywhere UI pursues a **calm, monochrome, high-signal** console aesthetic built on five principles:

1. **Dark-first, dual-theme equal**: Pure obsidian black (`#000000`) is the default brand theme; pure white (`#ffffff`) light mode is a first-class sibling with independently calibrated surface contrast and WCAG AA readability.
2. **Tonal hierarchy over heavy borders**: Surface steps (`Canvas → Card → Raised → Hover / Secondary`) establish visual depth. Cards, theme tiles, avatars, and nested surfaces are **borderless**; subtle `10%` translucent hairlines appear only as list dividers or structural seams.
3. **Clear two-tier geometry**: Multi-line containers use subtle G2 continuous corners (`superellipse(1.35)`), while pills, buttons, single-line inputs, switches, badges, sidebar items, and avatars stay strictly circular (`corner-shape: round`).
4. **Human-first copy over technical schemas**: End-user screens display clear, accurate, localized language — **never** leaking internal field keys (`aa.drive_quota_mb`) or raw slugs (`free`). Technical identifiers live strictly inside administrator configuration screens.
5. **Restrained chrome & single responsibility**: Avoid duplicated controls or overlapping pages; every route, surface, and icon serves one crisp purpose.

---

## 2. Color & Surface Token System

> **Invariant**: Zero hard-coded hex colors in `.tsx` files (except `viewport.themeColor` in `app/layout.tsx`). Always consume semantic Tailwind utilities (`bg-background`, `bg-card`, `text-muted-foreground`, etc.). Statically enforced by `tests/design-discipline.test.ts`.

### 2.1 Surface & Text Ladder

| Semantic Token | Dark Mode (Default `.dark`) | Light Mode (`:root`) | Role |
| --- | --- | --- | --- |
| `--background` | `#000000` | `oklch(1 0 0)` (`#ffffff`) | Primary page canvas |
| `--card` | `#141414` | `#f3f3f3` | Borderless content cards, theme tiles, stat cards |
| `--surface-raised` / `--muted` | `#191919` | `#ececec` | Raised container fill, muted inset panels, unchecked switch track |
| `--popover` | `#191919` | `oklch(1 0 0)` | Dropdown menus, popovers, tooltips |
| `--surface-hover` / `--accent` | `#252525` | `#e4e4e4` | Row, button, and menu hover fill |
| `--secondary` | `#262626` | `#e4e4e4` | Secondary pill badges and active tiles inside cards |
| `--primary` | `#ffffff` | `oklch(0.205 0 0)` | High-contrast primary button fill |
| `--primary-foreground` | `#000000` | `oklch(0.985 0 0)` | Primary button label |
| `--foreground` | `#ffffff` | `oklch(0.145 0 0)` | Primary headings and body text |
| `--foreground-secondary` | `#b5b5b5` | `oklch(0.4 0 0)` | Secondary body text |
| `--muted-foreground` | `#929292` | `#666666` | Supporting copy, timestamps, muted icons (≥ 4.5:1 on every surface) |
| `--border` | `rgb(255 255 255 / 10%)` | `rgb(0 0 0 / 10%)` | Translucent hairlines (dividers, table rows, card seams) |
| `--input` | `rgb(255 255 255 / 12%)` | `rgb(0 0 0 / 12%)` | Input field outlines |
| `--border-strong` | `#303030` | `#d0d0d0` | Wireframe pill button (`variant="outline"`) stroke |

### 2.2 Sidebar & Semantic Status Tokens

| Semantic Token | Dark Mode | Light Mode | Role |
| --- | --- | --- | --- |
| `--sidebar` | `#000000` | `oklch(0.985 0 0)` | Sidebar background |
| `--sidebar-accent` | `#191919` | `oklch(0.92 0 0)` | Active/hovered sidebar pill (darkened in light mode for crisp contrast on `#fafafa`) |
| `--sidebar-border` | `rgb(255 255 255 / 10%)` | `oklch(0.922 0 0)` | Sidebar edge hairline |
| `--destructive` | `oklch(0.704 0.191 22.216)` | `oklch(0.55 0.245 27.325)` | Destructive actions, errors, deletion confirmations |
| `--success` | `oklch(0.76 0.16 152)` | `oklch(0.51 0.15 150)` | Verified states, enabled indicators, success notices |
| `--warning` | `oklch(0.8 0.15 80)` | `oklch(0.54 0.15 70)` | Policy notices (e.g., 2FA required) and caution states |

### 2.3 Data Visualization Palette

Charts consume `--series-1` through `--series-8` plus `--series-other` in fixed order (contrast-validated against both `#141414` and `#f3f3f3`); never cycle hues within a chart.

---

## 3. Mixed Latin + CJK Typography

### 3.1 Font Stack Architecture

```css
--font-sans:
  "HarmonyOS Sans SC", "SF Pro Text", -apple-system, BlinkMacSystemFont,
  "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif;

--font-display:
  "HarmonyOS Sans SC", "SF Pro Display", -apple-system, BlinkMacSystemFont,
  "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif;

--font-script: "Caveat", "Segoe Script", cursive;
```

- **English, Latin, and digits**: Preserve native platform system type (`SF Pro Text` / `SF Pro Display` on Apple, `Segoe UI` on Windows).
- **Simplified Chinese & CJK punctuation**: Use self-hosted variable **HarmonyOS Sans SC** (`@luzixu/harmonyos-sans`, weight axis `40 900`) uniformly across macOS, Windows, and Linux.
- **CJK-only subsetting**: `app/harmonyos-sans-sc.css` includes **only** the CJK/punctuation WOFF2 slices (`sc-*`) and omits the Latin `font-text-*` slice. Placing `"HarmonyOS Sans SC"` before `-apple-system` ensures:
  1. Chinese characters match HarmonyOS Sans SC immediately instead of being intercepted by macOS PingFang SC.
  2. ASCII/Latin glyphs miss the CJK `unicode-range` and fall cleanly to native `SF Pro` / `Segoe UI`, downloading **0 bytes** of CJK font data on pure English pages.

### 3.2 Type Hierarchy & Monospace Boundaries

- **Page & section headings**: `PageHeader` title `text-2xl font-semibold tracking-tight`; section heading `text-base font-semibold tracking-tight`; card title `text-lg font-semibold tracking-tight`.
- **Body & descriptions**: Primary row `text-sm font-medium text-foreground`; multi-line copy `text-sm leading-relaxed text-muted-foreground`.
- **Numeric values**: Apply `tabular-nums` to all quotas, counts, pagination indices, and dates for stable vertical alignment.
- **`font-mono` boundary**: Reserved strictly for developer/operator identifiers (admin entitlement claim keys, client IDs, slugs, callback URIs, JSON editors, `CopyableValue`). **Never render raw technical keys in monospace inside end-user plan or feature cards.**

---

## 4. Two-Tier Corner Geometry (`corner-shape`)

Base radius `--radius: 0.75rem` (`12px`) generates:

- Nested panels: `rounded-xl` (`~16.8px`)
- Tiles & table row skeletons: `rounded-2xl` (`~21.6px`)
- Popovers & menus: `rounded-3xl` (`~26.4px`)
- Cards & dialogs: `rounded-card` = `min(var(--radius-4xl), 32px)` (`~31.2px`)

Under `@supports (corner-shape: superellipse(1.35))`:

1. **Multi-line rounded rectangles** (`[class*="rounded-"]`) receive `corner-shape: superellipse(1.35)` — subtle G2 curvature without boxy `squircle` (`superellipse(2)`) corners.
2. **Circles & capsules/pills** (`[class*="rounded-full"]`, `button`, `input`, single-line `input-group`, `badge`, `switch`, `switch-thumb`, `sidebar-menu-button`, pill `tabs-list` / `tabs-trigger`, `user-avatar`, `avatar`, `radio-group-*`) stay strictly `corner-shape: round`, preventing flattened vertical pill end-caps.
3. **Never write `[class*="-full"]`** in CSS — it accidentally matches Tailwind's `w-full` and `h-full`. Always target `[class*="rounded-full"]`.

---

## 5. Borderless Surface & Icon Discipline

1. **Borderless surfaces**: Content cards (`rounded-card bg-card`), theme tiles (`rounded-2xl bg-card`), nested inset blocks (`rounded-xl bg-background`), and avatars (`UserAvatar`) have no outer borders.
2. **Borderless standalone icons**: Never wrap lone empty-state, hero, or status icons inside a gray circle or square container (`rounded-full bg-surface-raised`). Render bare icons at `size-6`–`size-8 stroke-[1.5] text-muted-foreground` (or `text-destructive` / `text-success`).
3. **Borderless icon-only buttons**: Row actions (edit, delete, make default), `CopyButton`, pagination arrows, and mobile sidebar triggers use `Button variant="ghost"` (`size="icon-sm"` / `size="icon-xs"`).

---

## 6. Controls & Core Patterns

### 6.1 Pill Buttons (`Button`)

- **Emphasized primary action**: `variant="default"` (`bg-foreground text-background`) — one clear primary focal CTA per view.
- **Calm secondary wireframe**: `variant="outline"` (`border-border-strong bg-transparent text-foreground hover:bg-surface-raised`) — secondary actions and quick-filter chips.
- **Optical pill padding**: `sm` = `h-8 px-4`, `default` = `h-9 px-4`, `lg` = `h-10 px-5`, matching `Input` (`h-9 px-4`) and `Badge` (`h-5 px-2.5`).
- Always pass `nativeButton={false}` when rendering a link via `render={<Link ... />}` on Base UI `Button`.

### 6.2 Pill-in-Pill Switch (`Switch`)

- Adapted from shadcn `base-luma`: `44×20` track (`h-5 w-11`) housing a `24×16` pill thumb (`h-4 w-6`, checked translation `translate-x-[calc(100%-8px)]`).
- Calibrated dark/light contrast: checked track `bg-foreground`, checked thumb `bg-background dark:bg-secondary`; unchecked track `bg-input dark:bg-surface-raised`, unchecked thumb `bg-secondary dark:bg-muted-foreground`.

### 6.3 Selectors & Confirmations

- Prefer `DropdownSelect` over native `<select>` for consistent pill triggers and floating menus.
- Route destructive or irreversible actions through `ConfirmDialog`.

### 6.4 Detail & Entitlement Cards (`DetailCard` / `DetailList`)

Canonical pattern for plans, quotas, entitlements, and structured account attributes (`components/console/detail-list.tsx`):

- Outer container: borderless `rounded-card bg-card p-6` with a clean title (`text-lg font-semibold tracking-tight`) and description — **no raw monospace slug badge**.
- Below a hairline divider (`border-t border-border pt-5`), a semantic `<dl className="divide-y divide-border">` pairs:
  - Left (`<dt>`): human-readable localized title (`text-sm font-medium`) + rich multi-line explanation (`mt-1 text-sm leading-relaxed text-muted-foreground`).
  - Right (`<dd>`): crisp right-aligned tabular value with localized unit (`text-sm font-semibold tabular-nums`, e.g., `512 MB`, `7 days`, `10 devices`, `Unlimited`).
  - Stacks cleanly on narrow mobile viewports (`< sm`) with zero horizontal table clipping.

---

## 7. Console Information Architecture & Chrome

### 7.1 Sidebar & Mobile Top Bar

- **Top wordmark (`SectionSwitcher`)**: Must **never** paint a hover/selected background (`hover:bg-sidebar-accent` is forbidden). Interactive strictly on click (while preserving `focus-visible` ring).
- **Mobile top bar (`CollapsedNavBar`)**: The drawer trigger (`PanelLeftIcon`) is a standalone ghost icon button (`variant="ghost" size="icon-sm"`) positioned beside a separate, hover-free `BrandWordmark`.
- **Sidebar grouping**:
  1. **Standalone top `Home` group**: No section label, linking to `/account`.
  2. **`Account` group**: Dedicated routes — `Profile`, `Plan`, conditional `Organizations`, and `Appearance`.
  3. **Domain / Security groups**: Non-overlapping responsibilities (e.g., `Security` owns password, passkeys, 2FA, sessions, activity, and account deletion; `Connected accounts` owns OAuth provider linking only).
- **Footer `AccountSwitcher`**:
  - Anchored at the bottom of the sidebar, replacing any standalone Sign Out button.
  - Opens upward (`side="top"`) to switch signed-in accounts, add another account, sign out, or sign out of all accounts.
  - When `Appearance` owns display language, do **not** duplicate a language switcher in the sidebar footer (keep language switching in `SignInShell`'s top-right header for signed-out visitors).
- **Conditional navigation**: Hide empty or inaccessible sections consistently across the sidebar, home quick pills, and home search index.

### 7.2 Account Home & Sign-In

- **Account Home (`/account`)**: Centered editorial hero (borderless avatar with edit button, plan badge, name, email), `/` keyboard-shortcut pill search, wireframe quick pills, a single borderless `rounded-card bg-card` contextual spotlight card, and a quiet privacy footer.
- **Sign-In (`SignInShell`)**: Clean centered heading (`Sign in`, without redundant filler subtitles) with smooth upward reveal (`animate-in duration-700 fade-in slide-in-from-bottom-3`).

---

## 8. Content & Copywriting Discipline

1. **Strict end-user vs. admin separation**:
   - End-user plan and settings pages show human-friendly localized titles, accurate descriptions, and formatted units — never raw dotted field keys (`aa.drive_quota_mb`) or internal slugs.
   - Admin configuration pages (such as `/admin/plans`) surface the technical keys alongside an inline bilingual editor so operators can customize titles, descriptions, and units at runtime.
2. **Bilingual parity**: Maintain identical keys and `{placeholder}` sets across `en` and `zh-CN` dictionaries (enforced by `tests/i18n.test.ts`).
3. **Consistent brand voice**: Always address the product by its configured brand name (default `Agents Anywhere`), never internal repository codenames.

---

## 9. `<ViewTransition>` Motion System

Console transitions use React `<ViewTransition>` (`components/console/page-transition.tsx` + `useRevealInTransition`):

| Transition | Timing & Easing | Usage |
| --- | --- | --- |
| `console-enter` | `420ms cubic-bezier(0.22, 1, 0.36, 1)` | Entering the console shell after sign-in or reload (gated with `useRevealInTransition` inside `startTransition`) |
| `page-rise` | `360ms cubic-bezier(0.22, 1, 0.36, 1)` | Sibling sidebar navigation within a console (`opacity: 0.25 → 1`, `translateY: 10px → 0`) |
| `nav-forward` / `nav-back` | `320ms cubic-bezier(0.22, 1, 0.36, 1)` | Moving between hierarchy levels (`account ↔ org ↔ admin`, `±48px` horizontal slide) |
| `NAV_STILL` | Disabled | Links inside the mobile drawer so snapshots never bleed through the closing sheet |

- Disable default `root` view-transition crossfades so unrelated chrome never flickers.
- Honor `@media (prefers-reduced-motion: reduce)` across all transitions and keyframes.

---

## 10. Automated Guardrails & Quick Reference

### 10.1 Static Discipline Tests (`tests/design-discipline.test.ts`)

Included in both the starter template and `anywhere-ai-kit`:

1. **Zero hard-coded hex colors** across `app/**/*.tsx` and `components/**/*.tsx` (except `viewport.themeColor`).
2. **Two-tier corner geometry** (`superellipse(1.35)`, `corner-shape: round`, `--radius-card`, and forbidding `[class*="-full"]`).
3. **CJK-only HarmonyOS Sans SC** (no Latin `font-text-` slice or `U+20-7E` range).
4. **Hover-free wordmark & standalone mobile trigger** (`SectionSwitcher` and `CollapsedNavBar`).
5. **TanStack Query shared-key shape consistency**: verifies every `useQuery` sharing a `queryKey` returns the exact same payload shape — preventing cross-route cache collisions (`*.map is not a function`). Best practice: **export one canonical hook per shared `queryKey` in `lib/queries.ts`**.
6. **Bilingual i18n parity** (`tests/i18n.test.ts`).

### 10.2 Do / Don't Cheat Sheet

| Area | Do | Don't |
| --- | --- | --- |
| Colors | Use `bg-card`, `text-muted-foreground`, `border-border-strong` | Write `bg-[#141414]` or `text-[#929292]` in `.tsx` |
| Corners | `rounded-card` on cards, `rounded-full` on pills, `[class*="rounded-full"]` in CSS | Apply uniform `squircle` to pills or write `[class*="-full"]` |
| Icons | Bare icons (`size-7 stroke-[1.5]`); `variant="ghost"` for icon-only actions | Wrap lone status icons in gray circles or outline row action buttons |
| Sidebar | Hover-free wordmark; standalone top `Home`; footer `AccountSwitcher` | Add `hover:bg-sidebar-accent` on wordmark; duplicate language/sign-out rows in footer |
| Plans & Quotas | Render localized titles, rich descriptions & units with `DetailCard` / `DetailList` | Expose raw claim keys (`aa.drive_quota_mb`) or raw slugs (`free`) to end users |
| Data Fetching | Share one canonical hook per `queryKey` (`usePasskeys`, `useAdminSettings`) | Return wrapped `{ items }` in one route and unwrapped `items[]` in another under the same key |
