"use client"

import * as React from "react"
import {
  Backpack,
  BookOpen,
  CalendarDays,
  GraduationCap,
  Layers,
  LayoutDashboard,
  MapPin,
  UserRound,
} from "lucide-react"

import { AppSidebar } from "@/components/app.sidebar"
import {
  fetchInstitutions,
  type Institution,
} from "@/components/institutions/institutions"
import { AppHeader, PageTitleProvider } from "@/components/page-title"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/Sidebar/sidebar"
import { TooltipProvider } from "@/components/ui/Tooltip/tooltip"
import { leaveCampusPortal } from "@/lib/campus-portal"

const institutionNav = [
  {
    label: "Institution",
    items: [
      { title: "Overview", url: "/portal", icon: LayoutDashboard },
      { title: "Campuses", url: "/portal/campuses", icon: MapPin },
    ],
  },
  {
    label: "Academic",
    items: [
      { title: "Faculties", url: "/portal/faculties", icon: GraduationCap },
      { title: "Courses", url: "/portal/courses", icon: BookOpen },
      { title: "Modules", url: "/portal/modules", icon: Layers },
      { title: "Calendar", url: "/portal/calendar", icon: CalendarDays },
    ],
  },
  {
    label: "People",
    items: [
      { title: "Students", url: "/portal/students", icon: Backpack },
      { title: "Lecturers", url: "/portal/lecturers", icon: UserRound },
    ],
  },
]

export default function InstitutionLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [institution, setInstitution] = React.useState<Institution | null>(null)

  React.useEffect(() => {
    leaveCampusPortal()
  }, [])

  React.useEffect(() => {
    const id = sessionStorage.getItem("portal.institutionId")
    if (!id) return
    let cancelled = false
    fetchInstitutions()
      .then((items) => {
        if (cancelled) return
        setInstitution(items.find((item) => item.id === id) ?? null)
      })
      .catch(() => {
        if (!cancelled) setInstitution(null)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <TooltipProvider>
      <SidebarProvider>
        <AppSidebar
          nav={institutionNav}
          brand={
            institution
              ? { name: institution.name, logoUrl: institution.logo }
              : undefined
          }
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
