"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"

import { CourseTimetablePanel } from "@/components/calendar/course-timetable-panel"
import { fetchCampuses } from "@/components/campuses/campuses"
import { getCourse, type CourseDetail } from "@/components/courses/courses"
import { fetchFaculties } from "@/components/faculties/faculties"
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

export default function CoursePage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const [course, setCourse] = React.useState<CourseDetail | null>(null)
  const [facultyName, setFacultyName] = React.useState("")
  const [campusName, setCampusName] = React.useState("Whole institution")
  const [ready, setReady] = React.useState(false)

  React.useEffect(() => {
    const institutionId = sessionStorage.getItem("portal.institutionId")
    if (!institutionId) {
      router.replace("/institutions")
      return
    }

    let cancelled = false
    getCourse(params.id)
      .then(async (item) => {
        if (cancelled) return
        if (item.institutionId !== institutionId) {
          router.replace("/portal/courses")
          return
        }
        const faculties = await fetchFaculties(institutionId)
        if (cancelled) return
        setFacultyName(
          faculties.find((row) => row.id === item.facultyId)?.name ?? ""
        )
        if (item.campusId) {
          const campuses = await fetchCampuses(institutionId)
          if (cancelled) return
          const campus = campuses.find((row) => row.id === item.campusId)
          setCampusName(campus?.name ?? "Whole institution")
        } else {
          setCampusName("Whole institution")
        }
        setCourse(item)
        setReady(true)
      })
      .catch(() => {
        if (cancelled) return
        router.replace("/portal/courses")
      })

    return () => {
      cancelled = true
    }
  }, [params.id, router])

  if (!ready || !course) {
    return <p className="text-sm text-muted-foreground">Loading course...</p>
  }

  return (
    <div className="flex flex-col gap-6">
      <PageTitle>{course.name}</PageTitle>
      <Section
        title="Details"
        rows={[
          { label: "Name", value: course.name },
          { label: "Code", value: text(course.code) },
          { label: "Description", value: text(course.description) },
        ]}
      />
      <Section
        title="Placement"
        rows={[
          { label: "Faculty", value: facultyName },
          { label: "Campus", value: campusName },
        ]}
      />
      <CourseTimetablePanel
        courseId={course.id}
        institutionId={course.institutionId}
        editable
      />
    </div>
  )
}
