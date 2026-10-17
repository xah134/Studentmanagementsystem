"use client"

import { ArrowLeft, UserRound, Users } from "lucide-react"

import { AppSidebar } from "@/components/app.sidebar"
import { AppHeader, PageTitleProvider } from "@/components/page-title"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/Sidebar/sidebar"
import { TooltipProvider } from "@/components/ui/Tooltip/tooltip"

const settingsNav = [
  {
    label: "Portal",
    items: [{ title: "Back", url: "/dashboard", icon: ArrowLeft }],
  },
  {
    label: "Settings",
    items: [
      { title: "Account", url: "/settings/account", icon: UserRound },
      { title: "Team", url: "/settings/team", icon: Users },
    ],
  },
]

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <TooltipProvider>
      <SidebarProvider>
        <AppSidebar
          nav={settingsNav}
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
