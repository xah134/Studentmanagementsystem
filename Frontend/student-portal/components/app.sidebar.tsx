"use client"

import type * as React from "react"

import { NavMain, type AppNavSection } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarRail,
} from "@/components/ui/Sidebar/sidebar"

export function AppSidebar({
  nav,
  user,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  nav: AppNavSection[]
  user: {
    name: string
    email: string
    avatar?: string
  }
}) {
  return (
    <Sidebar collapsible="icon" variant="floating" {...props}>
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
