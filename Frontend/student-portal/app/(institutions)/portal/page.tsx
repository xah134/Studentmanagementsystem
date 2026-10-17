"use client"

import * as React from "react"
import { useRouter } from "next/navigation"

import {
  fetchInstitutions,
  institutionTypeLabels,
  type Institution,
} from "@/components/institutions/institutions"
import { PageTitle } from "@/components/page-title"

export default function InstitutionPortalPage() {
  const router = useRouter()
  const [institution, setInstitution] = React.useState<Institution | null>(null)

  React.useEffect(() => {
    const id = sessionStorage.getItem("portal.institutionId")
    if (!id) {
      router.replace("/institutions")
      return
    }

    let cancelled = false
    fetchInstitutions()
      .then((institutions) => {
        if (cancelled) return
        const match = institutions.find((item) => item.id === id)
        if (!match) {
          sessionStorage.removeItem("portal.institutionId")
          router.replace("/institutions")
          return
        }
        setInstitution(match)
      })
      .catch(() => {
        if (cancelled) return
        sessionStorage.removeItem("portal.institutionId")
        router.replace("/institutions")
      })

    return () => {
      cancelled = true
    }
  }, [router])

  if (!institution) {
    return null
  }

  const details = [
    institutionTypeLabels[institution.institutionType],
    institution.city,
  ].filter(Boolean)

  return (
    <div className="flex flex-col gap-2">
      <PageTitle>{institution.name}</PageTitle>
      {details.length ? (
        <p className="text-muted-foreground">{details.join(" · ")}</p>
      ) : null}
    </div>
  )
}
