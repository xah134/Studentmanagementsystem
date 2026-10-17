"use client"

import { Building2, LayoutDashboard } from "lucide-react"

import { AppSidebar } from "@/components/app.sidebar"
import { AppHeader, PageTitleProvider } from "@/components/page-title"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/Sidebar/sidebar"
import { TooltipProvider } from "@/components/ui/Tooltip/tooltip"

const sysadminNav = [
  {
    label: "Overview",
    items: [{ title: "Dashboard", url: "/dashboard", icon: LayoutDashboard }],
  },
  {
    label: "Management",
    items: [{ title: "Institutions", url: "/institutions", icon: Building2 }],
  },
]

export default function SystemAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <TooltipProvider>
      <SidebarProvider>
        <AppSidebar
          nav={sysadminNav}
          user={{ name: "System admin", email: "" }}
        />
        <SidebarInset>
          <PageTitleProvider>
            <AppHeader />
            <div className="flex flex-1 flex-col p-6">{children}</div>
          </PageTitleProvider>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  )
}
