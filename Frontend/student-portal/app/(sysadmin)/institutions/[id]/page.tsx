"use client"

import { useEffect, useState } from "react"
import { notFound, useParams } from "next/navigation"

import {
  getInstitution,
  institutionTypeLabels,
  type Institution,
} from "@/components/institutions/institutions"
import { PageTitle } from "@/components/page-title"

export default function InstitutionPage() {
  const params = useParams<{ id: string }>()
  const [institution, setInstitution] = useState<Institution | null | undefined>(
    undefined
  )

  useEffect(() => {
    let cancelled = false
    getInstitution(params.id)
      .then((item) => {
        if (!cancelled) setInstitution(item ?? null)
      })
      .catch(() => {
        if (!cancelled) setInstitution(null)
      })
    return () => {
      cancelled = true
    }
  }, [params.id])

  if (institution === undefined) {
    return <p className="text-sm text-muted-foreground">Loading institution...</p>
  }
  if (!institution) {
    notFound()
  }

  return (
    <div className="flex flex-col gap-2">
      <PageTitle>{institution.name}</PageTitle>
      <p className="text-muted-foreground">
        {[institutionTypeLabels[institution.institutionType], institution.city]
          .filter(Boolean)
          .join(" · ")}
      </p>
      <p>{institution.email}</p>
    </div>
  )
}
