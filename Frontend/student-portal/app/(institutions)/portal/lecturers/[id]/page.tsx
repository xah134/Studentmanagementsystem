"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"

import {
  genderLabels,
  getLecturer,
  verificationStatusLabels,
  type LecturerDetail,
} from "@/components/lecturers/lecturers"
import { PageTitle } from "@/components/page-title"

function Detail({
  label,
  value,
}: {
  label: string
  value: string | null | undefined
}) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd>{value || "—"}</dd>
    </div>
  )
}

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold">{title}</h2>
      <dl className="grid gap-4 sm:grid-cols-2">{children}</dl>
    </section>
  )
}

export default function LecturerPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const id = params.id
  const [lecturer, setLecturer] = React.useState<LecturerDetail | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    const institutionId = sessionStorage.getItem("portal.institutionId")
    if (!institutionId) {
      router.replace("/institutions")
      return
    }

    let cancelled = false
    getLecturer(id)
      .then((detail) => {
        if (cancelled) return
        if (detail.institutionId !== institutionId) {
          router.replace("/portal/lecturers")
          return
        }
        setLecturer(detail)
      })
      .catch((err: unknown) => {
        if (cancelled) return
        setError(err instanceof Error ? err.message : "Failed to load lecturer")
      })

    return () => {
      cancelled = true
    }
  }, [id, router])

  if (error) {
    return (
      <div className="flex flex-col gap-6">
        <PageTitle>Lecturer</PageTitle>
        <p className="text-sm text-destructive">{error}</p>
      </div>
    )
  }

  if (!lecturer) {
    return null
  }

  const dateOfBirth = lecturer.dateOfBirth
  const place = [lecturer.city, lecturer.state].filter(Boolean).join(", ")

  return (
    <div className="flex flex-col gap-8">
      <PageTitle>Lecturer</PageTitle>
      <Section title="Profile">
        <Detail label="Phone" value={lecturer.phone} />
        <Detail
          label="Gender"
          value={lecturer.gender ? genderLabels[lecturer.gender] : null}
        />
        <Detail label="Date of birth" value={dateOfBirth} />
        <Detail label="Nationality" value={lecturer.nationality} />
        <Detail
          label="Foreign national"
          value={lecturer.foreignNational ? "Yes" : "No"}
        />
        <Detail
          label="Verification status"
          value={verificationStatusLabels[lecturer.verificationStatus]}
        />
      </Section>
      <Section title="Identity">
        <Detail label="ID number" value={lecturer.idNumber} />
        <Detail label="Passport number" value={lecturer.passportNumber} />
      </Section>
      <Section title="Address">
        <Detail label="Address" value={lecturer.address} />
        <Detail label="City and state" value={place} />
        <Detail label="Zip" value={lecturer.zip} />
        <Detail label="Country" value={lecturer.country} />
      </Section>
      <Section title="Campus">
        <Detail label="Campus" value={lecturer.siteName ?? "Unassigned"} />
      </Section>
    </div>
  )
}
