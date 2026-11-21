/**
 * Business Swap #1: Application identity and feature flags.
 *
 * Update these values (or wire them to environment variables) to rebrand the
 * entire console — wordmark, page titles, default locale, and enabled sections.
 */
export const APP_CONFIG = {
  /** Displayed in the sidebar wordmark, sign-in header, and browser tab title. */
  brandName: "Agents Anywhere",
  /** Meta description for the application. */
  description: "Anywhere UI console and admin starter.",
  /** Fallback locale before client browser detection runs. */
  defaultLocale: "en" as "en" | "zh-CN",
  /** Show the Admin console switcher destination for users with role === "admin". */
  enableAdminConsole: true,
} as const
