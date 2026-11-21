"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { isActivePath, type NavGroup } from "@/components/console/nav"
import {
  ForwardIndicator,
  NAV_FORWARD,
  NAV_STILL,
  PageTransition,
  sectionTransitionTypes,
} from "@/components/console/page-transition"
import {
  SectionSwitcher,
  type SectionDestination,
} from "@/components/console/section-switcher"
import { UserAvatar } from "@/components/console/user-avatar"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

export interface ConsoleAccountLink {
  href: string
  user:
    | { display_name?: string | null; email?: string | null; avatar?: string | null }
    | null
    | undefined
}

/**
 * Reusable console sidebar: top wordmark switcher, optional clickable account
 * row (leading to profile directly), grouped pill navigation with
 * `<ViewTransition>` section keys, and a customizable footer slot.
 */
export function ConsoleSidebar({
  sectionKey,
  brandName,
  badge,
  home,
  homeLabel,
  switchLabel,
  destinations,
  account,
  nav,
  footer,
}: {
  sectionKey: string
  brandName?: string
  badge?: string
  home: string
  homeLabel?: string
  switchLabel?: string
  destinations?: readonly SectionDestination[]
  account?: ConsoleAccountLink
  nav: readonly NavGroup[]
  footer?: React.ReactNode
}) {
  const pathname = usePathname()
  const { isMobile, setOpenMobile } = useSidebar()

  const closeDrawerOnLink = (event: React.MouseEvent) => {
    if (isMobile && (event.target as Element).closest("a")) {
      setOpenMobile(false)
    }
  }

  return (
    <Sidebar>
      <div className="contents" onClickCapture={closeDrawerOnLink}>
        <SidebarHeader className="gap-3 px-3 pt-4">
          <SectionSwitcher
            homeHref={home}
            homeLabel={homeLabel}
            brandName={brandName}
            badge={badge}
            destinations={destinations}
            switchLabel={switchLabel}
          />
          {account && <AccountLink href={account.href} user={account.user} />}
        </SidebarHeader>

        <SidebarContent className="px-1">
          <PageTransition key={sectionKey}>
            <div className="flex flex-col">
              {nav.map((group, index) => (
                <SidebarGroup key={group.label ?? index}>
                  {group.label && (
                    <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
                  )}
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {group.items.map((item) => (
                        <SidebarMenuItem key={item.href}>
                          <SidebarMenuButton
                            render={<Link href={item.href} />}
                            isActive={isActivePath(pathname, item.href, home)}
                          >
                            <item.icon />
                            <span>{item.title}</span>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              ))}
            </div>
          </PageTransition>
        </SidebarContent>

        {footer && <SidebarFooter className="px-3 pb-4">{footer}</SidebarFooter>}
      </div>
    </Sidebar>
  )
}

/**
 * Signed-in user row in the sidebar header, linking directly to the user's
 * profile page (so Profile does not need to be duplicated in the nav list).
 */
export function AccountLink({ href, user }: ConsoleAccountLink) {
  const pathname = usePathname()
  const { isMobile } = useSidebar()
  const motion = sectionTransitionTypes(pathname, href)

  return (
    <Link
      href={href}
      transitionTypes={isMobile ? [NAV_STILL] : motion}
      aria-current={pathname === href ? "page" : undefined}
      className="flex h-9 w-full items-center gap-2 rounded-full px-3 text-sm transition-colors outline-none hover:bg-sidebar-accent focus-visible:ring-2 focus-visible:ring-sidebar-ring aria-[current=page]:bg-sidebar-accent aria-[current=page]:font-medium [&_svg]:size-4"
    >
      <UserAvatar user={user} className="size-5 text-[10px]" />
      <span className="min-w-0 truncate">{user?.display_name || user?.email}</span>
      {motion[0] === NAV_FORWARD && <ForwardIndicator />}
    </Link>
  )
}
