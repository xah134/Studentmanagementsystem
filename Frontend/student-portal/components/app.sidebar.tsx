"use client"

import type * as React from "react"

import { NavMain, type AppNavSection } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/Sidebar/sidebar"

export type SidebarBrand = {
  name: string
  logoUrl?: string | null
  subtitle?: string | null
}

export function AppSidebar({
  nav,
  user,
  brand,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  nav: AppNavSection[]
  user: {
    name: string
    email: string
    avatar?: string
  }
  brand?: SidebarBrand
}) {
  const initials = brand
    ? brand.name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0])
        .join("")
        .toUpperCase() || brand.name.slice(0, 2).toUpperCase()
    : ""

  return (
    <Sidebar collapsible="icon" variant="floating" {...props}>
      {brand ? (
        <SidebarHeader className="border-b border-sidebar-border">
          <div className="flex flex-col items-center gap-3 px-2 py-4 text-center group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:py-2">
            {brand.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={brand.logoUrl}
                alt=""
                className="size-14 shrink-0 rounded-[1.15rem] object-cover shadow-sm group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:rounded-lg"
              />
            ) : (
              <div className="flex size-14 shrink-0 items-center justify-center rounded-[1.15rem] bg-teal-700 text-xl font-semibold tracking-tight text-white shadow-sm group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:rounded-lg group-data-[collapsible=icon]:text-xs">
                {initials.slice(0, 1)}
              </div>
            )}
            <div className="min-w-0 w-full group-data-[collapsible=icon]:hidden">
              <p className="truncate text-sm font-semibold leading-snug text-sidebar-foreground">
                {brand.name}
              </p>
              {brand.subtitle ? (
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  {brand.subtitle}
                </p>
              ) : null}
            </div>
          </div>
        </SidebarHeader>
      ) : null}
      <SidebarContent>
        <NavMain sections={nav} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
