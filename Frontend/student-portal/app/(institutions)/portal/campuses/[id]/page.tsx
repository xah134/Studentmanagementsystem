"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"

import { getCampus, type CampusDetail } from "@/components/campuses/campuses"
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

function text(value: string | number | null | undefined) {
  if (value === null || value === undefined) return ""
  return String(value)
}

export default function CampusPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const [campus, setCampus] = React.useState<CampusDetail | null>(null)
  const [ready, setReady] = React.useState(false)

  React.useEffect(() => {
    const institutionId = sessionStorage.getItem("portal.institutionId")
    if (!institutionId) {
      router.replace("/institutions")
      return
    }

    let cancelled = false
    getCampus(params.id)
      .then((item) => {
        if (cancelled) return
        if (item.institutionId !== institutionId) {
          router.replace("/portal/campuses")
          return
        }
        setCampus(item)
        setReady(true)
      })
      .catch(() => {
        if (cancelled) return
        router.replace("/portal/campuses")
      })

    return () => {
      cancelled = true
    }
  }, [params.id, router])

  if (!ready || !campus) {
    return <p className="text-sm text-muted-foreground">Loading campus...</p>
  }

  return (
    <div className="flex flex-col gap-6">
      <PageTitle>{campus.name}</PageTitle>
      <Section
        title="Details"
        rows={[
          { label: "Name", value: campus.name },
          { label: "Description", value: text(campus.description) },
        ]}
      />
      <Section
        title="Address"
        rows={[
          { label: "Address", value: text(campus.address) },
          { label: "City", value: text(campus.city) },
          { label: "State", value: text(campus.state) },
          { label: "Zip", value: text(campus.zip) },
        ]}
      />
      <Section
        title="Location"
        rows={[
          { label: "Latitude", value: text(campus.latitude) },
          { label: "Longitude", value: text(campus.longitude) },
        ]}
      />
    </div>
  )
}
