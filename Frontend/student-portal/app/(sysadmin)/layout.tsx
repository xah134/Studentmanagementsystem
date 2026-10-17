"use client"

import { Building2, LayoutDashboard } from "lucide-react"

import { AppSidebar } from "@/components/app.sidebar"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
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
          <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger />
          </header>
          <div className="flex flex-1 flex-col p-6">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  )
}
