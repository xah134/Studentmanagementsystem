"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"

import { CourseTimetablePanel } from "@/components/calendar/course-timetable-panel"
import { getCourse, type CourseDetail } from "@/components/courses/courses"
import { PageTitle } from "@/components/page-title"
import { useCampusPortal } from "@/lib/campus-portal"

function text(value: string | null | undefined) {
  if (value === null || value === undefined) return ""
  return value
}

export default function CampusCoursePage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const { institutionId, siteId } = useCampusPortal()
  const [course, setCourse] = React.useState<CourseDetail | null>(null)

  React.useEffect(() => {
    let cancelled = false
    getCourse(params.id)
      .then((item) => {
        if (cancelled) return
        if (item.institutionId !== institutionId) {
          router.replace("/campus/courses")
          return
        }
        if (item.campusId && item.campusId !== siteId) {
          router.replace("/campus/courses")
          return
        }
        setCourse(item)
      })
      .catch(() => {
        if (!cancelled) router.replace("/campus/courses")
      })
    return () => {
      cancelled = true
    }
  }, [params.id, institutionId, siteId, router])

  if (!course) {
    return <p className="text-sm text-muted-foreground">Loading course…</p>
  }

  return (
    <div className="flex flex-col gap-6">
      <PageTitle>{course.name}</PageTitle>
      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-medium">Details</h2>
        <dl className="grid gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <dt className="text-sm text-muted-foreground">Code</dt>
            <dd>{text(course.code)}</dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt className="text-sm text-muted-foreground">Description</dt>
            <dd>{text(course.description)}</dd>
          </div>
        </dl>
      </section>
      <CourseTimetablePanel
        courseId={course.id}
        institutionId={course.institutionId}
        editable={false}
      />
    </div>
  )
}
