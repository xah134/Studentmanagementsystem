"use client"

import { PageTitle } from "@/components/page-title"
import { useCampusPortal } from "@/lib/campus-portal"

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

export default function CampusDetailsPage() {
  const { campus } = useCampusPortal()

  return (
    <div className="flex flex-col gap-6">
      <PageTitle>Campus details</PageTitle>
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
