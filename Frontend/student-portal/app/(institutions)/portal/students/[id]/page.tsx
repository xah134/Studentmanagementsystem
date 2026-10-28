"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"

import {
  genderLabels,
  getStudent,
  verificationStatusLabels,
  type StudentDetail,
} from "@/components/students/students"
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
      {children}
    </section>
  )
}

export default function StudentPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const id = params.id
  const [student, setStudent] = React.useState<StudentDetail | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    const institutionId = sessionStorage.getItem("portal.institutionId")
    if (!institutionId) {
      router.replace("/institutions")
      return
    }

    let cancelled = false
    getStudent(id)
      .then((detail) => {
        if (cancelled) return
        if (detail.institutionId !== institutionId) {
          router.replace("/portal/students")
          return
        }
        setStudent(detail)
      })
      .catch((err: unknown) => {
        if (cancelled) return
        setError(err instanceof Error ? err.message : "Failed to load student")
      })

    return () => {
      cancelled = true
    }
  }, [id, router])

  if (error) {
    return (
      <div className="flex flex-col gap-6">
        <PageTitle>Student</PageTitle>
        <p className="text-sm text-destructive">{error}</p>
      </div>
    )
  }

  if (!student) {
    return null
  }

  const place = [student.city, student.state].filter(Boolean).join(", ")

  return (
    <div className="flex flex-col gap-8">
      <PageTitle>
        {[student.firstName, student.lastName].filter(Boolean).join(" ") ||
          "Student"}
      </PageTitle>
      <Section title="Profile">
        <dl className="grid gap-4 sm:grid-cols-2">
          <Detail label="First name" value={student.firstName} />
          <Detail label="Last name" value={student.lastName} />
          <Detail label="Phone" value={student.phone} />
          <Detail
            label="Gender"
            value={student.gender ? genderLabels[student.gender] : null}
          />
          <Detail label="Date of birth" value={student.dateOfBirth} />
          <Detail label="Nationality" value={student.nationality} />
          <Detail
            label="Foreign national"
            value={student.foreignNational ? "Yes" : "No"}
          />
          <Detail
            label="Verification status"
            value={verificationStatusLabels[student.verificationStatus]}
          />
        </dl>
      </Section>
      <Section title="Identity">
        <dl className="grid gap-4 sm:grid-cols-2">
          <Detail label="ID number" value={student.idNumber} />
          <Detail label="Passport number" value={student.passportNumber} />
        </dl>
      </Section>
      <Section title="Address">
        <dl className="grid gap-4 sm:grid-cols-2">
          <Detail label="Address" value={student.address} />
          <Detail label="City and state" value={place} />
          <Detail label="Zip" value={student.zip} />
          <Detail label="Country" value={student.country} />
        </dl>
      </Section>
      <Section title="Campus">
        <dl className="grid gap-4 sm:grid-cols-2">
          <Detail label="Campus" value={student.siteName} />
        </dl>
      </Section>
      <Section title="Guardians">
        {student.guardians.length === 0 ? (
          <p className="text-sm text-muted-foreground">No guardians added.</p>
        ) : (
          <ul className="flex flex-col gap-4">
            {student.guardians.map((guardian) => (
              <li key={guardian.id} className="rounded-lg border p-4">
                <dl className="grid gap-4 sm:grid-cols-2">
                  <Detail label="Name" value={guardian.name} />
                  <Detail label="Relationship" value={guardian.relationship} />
                  <Detail label="Phone" value={guardian.phone} />
                  <Detail label="Email" value={guardian.email} />
                </dl>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </div>
  )
}
