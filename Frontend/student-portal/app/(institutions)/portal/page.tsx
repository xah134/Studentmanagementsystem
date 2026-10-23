"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { BookOpen, GraduationCap, MapPin, UserRound } from "lucide-react"

import {
  fetchInstitutions,
  institutionTypeLabels,
  type Institution,
} from "@/components/institutions/institutions"
import { CampusOverviewMap } from "@/components/campuses/campus-map"
import { KpiWidget } from "@/components/kpi/kpi-widget"
import { PageTitle } from "@/components/page-title"
import { apiUrl } from "@/lib/api"

function FacultyCountKpi({ institutionId }: { institutionId: string }) {
  const [value, setValue] = React.useState<number | null>(null)
  const [description, setDescription] = React.useState("Registered faculties")

  React.useEffect(() => {
    const params = new URLSearchParams({
      institutionId,
      page: "1",
      pageSize: "1",
    })

    fetch(`${apiUrl()}/faculties?${params}`)
      .then(async (response) => {
        const payload = await response.json().catch(() => ({}))
        if (!response.ok) {
          throw new Error(payload.message || "Failed to load faculties count")
        }
        return payload
      })
      .then((payload) => {
        if (typeof payload?.summary?.totalCount !== "number") {
          throw new Error("Invalid response structure")
        }
        setValue(payload.summary.totalCount)
        setDescription("Registered faculties")
      })
      .catch((error: unknown) => {
        setValue(null)
        setDescription(
          error instanceof Error ? error.message : "Error loading count"
        )
      })
  }, [institutionId])

  return (
    <KpiWidget
      label="Faculties"
      value={value}
      description={description}
      icon={GraduationCap}
    />
  )
}

function CourseCountKpi({ institutionId }: { institutionId: string }) {
  const [value, setValue] = React.useState<number | null>(null)
  const [description, setDescription] = React.useState("Registered courses")

  React.useEffect(() => {
    const params = new URLSearchParams({
      institutionId,
      page: "1",
      pageSize: "1",
    })

    fetch(`${apiUrl()}/courses?${params}`)
      .then(async (response) => {
        const payload = await response.json().catch(() => ({}))
        if (!response.ok) {
          throw new Error(payload.message || "Failed to load courses count")
        }
        return payload
      })
      .then((payload) => {
        if (typeof payload?.summary?.totalCount !== "number") {
          throw new Error("Invalid response structure")
        }
        setValue(payload.summary.totalCount)
        setDescription("Registered courses")
      })
      .catch((error: unknown) => {
        setValue(null)
        setDescription(
          error instanceof Error ? error.message : "Error loading count"
        )
      })
  }, [institutionId])

  return (
    <KpiWidget
      label="Courses"
      value={value}
      description={description}
      icon={BookOpen}
    />
  )
}

function CampusCountKpi({ institutionId }: { institutionId: string }) {
  const [value, setValue] = React.useState<number | null>(null)
  const [description, setDescription] = React.useState("Registered campuses")

  React.useEffect(() => {
    const params = new URLSearchParams({
      institutionId,
      page: "1",
      pageSize: "1",
    })

    fetch(`${apiUrl()}/sites?${params}`)
      .then(async (response) => {
        const payload = await response.json().catch(() => ({}))
        if (!response.ok) {
          throw new Error(payload.message || "Failed to load campuses count")
        }
        return payload
      })
      .then((payload) => {
        if (typeof payload?.summary?.totalCount !== "number") {
          throw new Error("Invalid response structure")
        }
        setValue(payload.summary.totalCount)
        setDescription("Registered campuses")
      })
      .catch((error: unknown) => {
        setValue(null)
        setDescription(
          error instanceof Error ? error.message : "Error loading count"
        )
      })
  }, [institutionId])

  return (
    <KpiWidget
      label="Campuses"
      value={value}
      description={description}
      icon={MapPin}
    />
  )
}

function LecturerCountKpi({ institutionId }: { institutionId: string }) {
  const [value, setValue] = React.useState<number | null>(null)
  const [description, setDescription] = React.useState("Registered lecturers")

  React.useEffect(() => {
    const params = new URLSearchParams({
      institutionId,
      page: "1",
      pageSize: "1",
    })

    fetch(`${apiUrl()}/lecturers?${params}`)
      .then(async (response) => {
        const payload = await response.json().catch(() => ({}))
        if (!response.ok) {
          throw new Error(payload.message || "Failed to load lecturers count")
        }
        return payload
      })
      .then((payload) => {
        if (typeof payload?.summary?.totalCount !== "number") {
          throw new Error("Invalid response structure")
        }
        setValue(payload.summary.totalCount)
        setDescription("Registered lecturers")
      })
      .catch((error: unknown) => {
        setValue(null)
        setDescription(
          error instanceof Error ? error.message : "Error loading count"
        )
      })
  }, [institutionId])

  return (
    <KpiWidget
      label="Lecturers"
      value={value}
      description={description}
      icon={UserRound}
    />
  )
}

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
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <PageTitle>{institution.name}</PageTitle>
        {details.length ? (
          <p className="text-muted-foreground">{details.join(" · ")}</p>
        ) : null}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <CampusCountKpi institutionId={institution.id} />
        <FacultyCountKpi institutionId={institution.id} />
        <CourseCountKpi institutionId={institution.id} />
        <LecturerCountKpi institutionId={institution.id} />
      </div>
      <CampusOverviewMap institutionId={institution.id} />
    </div>
  )
}
