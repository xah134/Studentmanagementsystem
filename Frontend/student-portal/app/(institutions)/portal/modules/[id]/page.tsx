"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"

import { fetchCourses } from "@/components/courses/courses"
import { getModule, type ModuleDetail } from "@/components/modules/modules"
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

export default function ModulePage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const [moduleRow, setModuleRow] = React.useState<ModuleDetail | null>(null)
  const [courseName, setCourseName] = React.useState("")
  const [ready, setReady] = React.useState(false)

  React.useEffect(() => {
    const institutionId = sessionStorage.getItem("portal.institutionId")
    if (!institutionId) {
      router.replace("/institutions")
      return
    }

    let cancelled = false
    getModule(params.id)
      .then(async (item) => {
        if (cancelled) return
        if (item.institutionId !== institutionId) {
          router.replace("/portal/modules")
          return
        }
        const courses = await fetchCourses(institutionId)
        if (cancelled) return
        setCourseName(
          courses.find((row) => row.id === item.courseId)?.name ?? ""
        )
        setModuleRow(item)
        setReady(true)
      })
      .catch(() => {
        if (cancelled) return
        router.replace("/portal/modules")
      })

    return () => {
      cancelled = true
    }
  }, [params.id, router])

  if (!ready || !moduleRow) {
    return <p className="text-sm text-muted-foreground">Loading module...</p>
  }

  return (
    <div className="flex flex-col gap-6">
      <PageTitle>{moduleRow.name}</PageTitle>
      <Section
        title="Details"
        rows={[
          { label: "Name", value: moduleRow.name },
          { label: "Code", value: text(moduleRow.code) },
          { label: "Description", value: text(moduleRow.description) },
          { label: "Credits", value: text(moduleRow.credits) },
        ]}
      />
      <Section
        title="Course"
        rows={[{ label: "Course", value: courseName }]}
      />
    </div>
  )
}
