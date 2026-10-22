"use client"

import { GraduationCap, LayoutDashboard, MapPin, UserRound } from "lucide-react"

import { AppSidebar } from "@/components/app.sidebar"
import { AppHeader, PageTitleProvider } from "@/components/page-title"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/Sidebar/sidebar"
import { TooltipProvider } from "@/components/ui/Tooltip/tooltip"

const institutionNav = [
  {
    label: "Institution",
    items: [
      { title: "Overview", url: "/portal", icon: LayoutDashboard },
      { title: "Campuses", url: "/portal/campuses", icon: MapPin },
      { title: "Faculties", url: "/portal/faculties", icon: GraduationCap },
      { title: "Lecturers", url: "/portal/lecturers", icon: UserRound },
    ],
  },
]

export default function InstitutionLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <TooltipProvider>
      <SidebarProvider>
        <AppSidebar
          nav={institutionNav}
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
