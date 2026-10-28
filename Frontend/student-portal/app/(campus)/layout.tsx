"use client"

import * as React from "react"
import {
  ArrowLeft,
  Backpack,
  BookOpen,
  CalendarDays,
  ClipboardCheck,
  GraduationCap,
  LayoutDashboard,
  MessageCircle,
  Settings,
  UserRound,
} from "lucide-react"
import { usePathname, useRouter } from "next/navigation"

import { AppSidebar } from "@/components/app.sidebar"
import { WhatsAppIcon } from "@/components/icons/whatsapp"
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
import {
  CampusPortalProvider,
  leaveCampusPortal,
  useCampusPortal,
} from "@/lib/campus-portal"

const campusNav = [
  {
    label: "Campus",
    items: [
      { title: "Overview", url: "/campus", icon: LayoutDashboard },
    ],
  },
  {
    label: "Academic",
    items: [
      { title: "Departments", url: "/campus/departments", icon: GraduationCap },
      { title: "Courses", url: "/campus/courses", icon: BookOpen },
      { title: "Calendar", url: "/campus/calendar", icon: CalendarDays },
      { title: "Attendance", url: "/campus/attendance", icon: ClipboardCheck },
    ],
  },
  {
    label: "People",
    items: [
      { title: "Students", url: "/campus/students", icon: Backpack },
      { title: "Lecturers", url: "/campus/lecturers", icon: UserRound },
    ],
  },
  {
    label: "Support",
    items: [
      {
        title: "Support",
        icon: MessageCircle,
        children: [
          { title: "WhatsApp", url: "/campus/support", icon: WhatsAppIcon },
          { title: "Settings", url: "/campus/settings", icon: Settings },
        ],
      },
    ],
  },
]

function CampusShell({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const isSupportInbox = pathname === "/campus/support"
  const { campus, institutionId } = useCampusPortal()
  const [institution, setInstitution] = React.useState<Institution | null>(null)

  React.useEffect(() => {
    let cancelled = false
    fetchInstitutions()
      .then((items) => {
        if (cancelled) return
        setInstitution(items.find((item) => item.id === institutionId) ?? null)
      })
      .catch(() => {
        if (!cancelled) setInstitution(null)
      })
    return () => {
      cancelled = true
    }
  }, [institutionId])

  function backToInstitution() {
    leaveCampusPortal()
    router.push("/portal/campuses")
  }

  return (
    <TooltipProvider>
      <SidebarProvider>
        <AppSidebar
          nav={campusNav}
          brand={{
            name: campus.name,
            subtitle: institution?.name ?? null,
            logoUrl: institution?.logo ?? null,
          }}
          user={{ name: campus.name, email: "Campus portal" }}
        />
        <SidebarInset className="min-h-0">
          <PageTitleProvider>
            <AppHeader />
            {isSupportInbox ? (
              <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
                {children}
              </div>
            ) : (
              <div className="flex flex-1 flex-col gap-2 p-6">
                <button
                  type="button"
                  onClick={backToInstitution}
                  className="inline-flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="size-3.5" />
                  Institution campuses
                </button>
                {children}
              </div>
            )}
          </PageTitleProvider>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  )
}

export default function CampusLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <CampusPortalProvider>
      <CampusShell>{children}</CampusShell>
    </CampusPortalProvider>
  )
}
