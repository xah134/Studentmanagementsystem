"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"

import { fetchCampuses } from "@/components/campuses/campuses"
import { getFaculty, type FacultyDetail } from "@/components/faculties/faculties"
import { PageTitle } from "@/components/page-title"

function Section({
  title,
  rows,
}: {
  title: string
  rows: { label: string; value: string }[]
}) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-sm font-medium">{title}</h2>
      <dl className="grid gap-3 sm:grid-cols-2">
        {rows.map((row) => (
          <div key={row.label} className="flex flex-col gap-1">
            <dt className="text-sm text-muted-foreground">{row.label}</dt>
            <dd>{row.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}

function text(value: string | null | undefined) {
  if (value === null || value === undefined) return ""
  return value
}

export default function FacultyPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const [faculty, setFaculty] = React.useState<FacultyDetail | null>(null)
  const [campusName, setCampusName] = React.useState("Whole institution")
  const [ready, setReady] = React.useState(false)

  React.useEffect(() => {
    const institutionId = sessionStorage.getItem("portal.institutionId")
    if (!institutionId) {
      router.replace("/institutions")
      return
    }

    let cancelled = false
    getFaculty(params.id)
      .then(async (item) => {
        if (cancelled) return
        if (item.institutionId !== institutionId) {
          router.replace("/portal/faculties")
          return
        }
        if (item.campusId) {
          const campuses = await fetchCampuses(institutionId)
          if (cancelled) return
          const campus = campuses.find((row) => row.id === item.campusId)
          setCampusName(campus?.name ?? "Whole institution")
        } else {
          setCampusName("Whole institution")
        }
        setFaculty(item)
        setReady(true)
      })
      .catch(() => {
        if (cancelled) return
        router.replace("/portal/faculties")
      })

    return () => {
      cancelled = true
    }
  }, [params.id, router])

  if (!ready || !faculty) {
    return <p className="text-sm text-muted-foreground">Loading faculty...</p>
  }

  return (
    <div className="flex flex-col gap-6">
      <PageTitle>{faculty.name}</PageTitle>
      <Section
        title="Details"
        rows={[
          { label: "Name", value: faculty.name },
          { label: "Code", value: text(faculty.code) },
          { label: "Description", value: text(faculty.description) },
        ]}
      />
      <Section
        title="Campus"
        rows={[{ label: "Campus", value: campusName }]}
      />
    </div>
  )
}
