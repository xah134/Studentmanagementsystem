"use client"

import * as React from "react"
import { useRouter } from "next/navigation"

import { getCampus, type CampusDetail } from "@/components/campuses/campuses"

export function openCampusPortal(campusId: string) {
  sessionStorage.setItem("portal.siteId", campusId)
}

export function leaveCampusPortal() {
  sessionStorage.removeItem("portal.siteId")
}

type CampusPortalValue = {
  institutionId: string
  siteId: string
  campus: CampusDetail
}

const CampusPortalContext = React.createContext<CampusPortalValue | null>(null)

export function CampusPortalProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [value, setValue] = React.useState<CampusPortalValue | null>(null)

  React.useEffect(() => {
    const nextInstitutionId = sessionStorage.getItem("portal.institutionId")
    const nextSiteId = sessionStorage.getItem("portal.siteId")

    if (!nextInstitutionId) {
      router.replace("/institutions")
      return
    }
    if (!nextSiteId) {
      router.replace("/portal/campuses")
      return
    }

    let cancelled = false
    getCampus(nextSiteId)
      .then((detail) => {
        if (cancelled) return
        if (detail.institutionId !== nextInstitutionId) {
          leaveCampusPortal()
          router.replace("/portal/campuses")
          return
        }
        setValue({
          institutionId: nextInstitutionId,
          siteId: nextSiteId,
          campus: detail,
        })
      })
      .catch(() => {
        if (cancelled) return
        leaveCampusPortal()
        router.replace("/portal/campuses")
      })

    return () => {
      cancelled = true
    }
  }, [router])

  if (!value) {
    return null
  }

  return (
    <CampusPortalContext.Provider value={value}>
      {children}
    </CampusPortalContext.Provider>
  )
}

export function useCampusPortal() {
  const value = React.useContext(CampusPortalContext)
  if (!value) {
    throw new Error("useCampusPortal must be used within CampusPortalProvider")
  }
  return { ...value, ready: true as const }
}
