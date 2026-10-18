"use client"

import { useEffect, useState } from "react"
import { notFound, useParams } from "next/navigation"

import {
  getInstitution,
  type Institution,
} from "@/components/institutions/institutions"
import { PageTitle } from "@/components/page-title"

export default function EditInstitutionPage() {
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

  return <PageTitle>{`Edit ${institution.name}`}</PageTitle>
}
