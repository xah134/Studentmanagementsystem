"use client"

import * as React from "react"
import { toast } from "sonner"

import {
  fetchAttendanceRoster,
  saveAttendance,
  type AttendanceRosterItem,
  type AttendanceStatus,
} from "@/components/attendance/attendance-api"
import {
  fetchCourseTimetable,
  type TimetableSlot,
} from "@/components/calendar/calendar-api"
import { fetchCourses, type Course } from "@/components/courses/courses"
import { Button } from "@/components/ui/Button/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card/card"
import { Input } from "@/components/ui/Input/input"

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

function todayIso() {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

function weekdayFromIso(iso: string) {
  const [y, m, d] = iso.split("-").map(Number)
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay()
}

function studentLabel(row: AttendanceRosterItem) {
  const name = [row.firstName, row.lastName].filter(Boolean).join(" ")
  return name || row.idNumber || row.phone || "Student"
}

export function CampusAttendancePanel({
  institutionId,
  siteId,
}: {
  institutionId: string
  siteId: string
}) {
  const [date, setDate] = React.useState(todayIso)
  const [courses, setCourses] = React.useState<Course[]>([])
  const [courseId, setCourseId] = React.useState("")
  const [slots, setSlots] = React.useState<TimetableSlot[]>([])
  const [slotId, setSlotId] = React.useState("")
  const [roster, setRoster] = React.useState<AttendanceRosterItem[]>([])
  const [marks, setMarks] = React.useState<Record<string, AttendanceStatus>>({})
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const dayOfWeek = weekdayFromIso(date)
  const daySlots = slots.filter((s) => s.dayOfWeek === dayOfWeek)

  React.useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetchCourses(institutionId, undefined, siteId)
      .then((courseRows) => {
        if (cancelled) return
        setCourses(courseRows)
        setCourseId((current) => current || courseRows[0]?.id || "")
        setError(null)
      })
      .catch((err: unknown) => {
        if (cancelled) return
        setError(err instanceof Error ? err.message : "Failed to load")
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [institutionId, siteId])

  React.useEffect(() => {
    if (!courseId) {
      setSlots([])
      setSlotId("")
      return
    }
    let cancelled = false
    fetchCourseTimetable(courseId)
      .then((rows) => {
        if (cancelled) return
        setSlots(rows)
      })
      .catch((err: unknown) => {
        if (cancelled) return
        toast.error(err instanceof Error ? err.message : "Failed to load timetable")
        setSlots([])
      })
    return () => {
      cancelled = true
    }
  }, [courseId])

  React.useEffect(() => {
    if (!daySlots.some((s) => s.id === slotId)) {
      setSlotId(daySlots[0]?.id || "")
    }
  }, [daySlots, slotId])

  const loadRoster = React.useCallback(async () => {
    if (!slotId || !date) {
      setRoster([])
      setMarks({})
      return
    }
    const data = await fetchAttendanceRoster({
      timetableSlotId: slotId,
      date,
      siteId,
    })
    setRoster(data.roster)
    const next: Record<string, AttendanceStatus> = {}
    for (const row of data.roster) {
      if (row.status) next[row.studentId] = row.status
    }
    setMarks(next)
  }, [slotId, date, siteId])

  React.useEffect(() => {
    if (!slotId) {
      setRoster([])
      setMarks({})
      return
    }
    let cancelled = false
    loadRoster().catch((err: unknown) => {
      if (cancelled) return
      toast.error(err instanceof Error ? err.message : "Failed to load roster")
      setRoster([])
      setMarks({})
    })
    return () => {
      cancelled = true
    }
  }, [loadRoster, slotId])

  async function onSave() {
    if (!slotId) return
    const payload = Object.entries(marks).map(([studentId, status]) => ({
      studentId,
      status,
    }))
    if (!payload.length) {
      toast.error("Mark at least one student")
      return
    }
    setSaving(true)
    try {
      const data = await saveAttendance({
        timetableSlotId: slotId,
        date,
        siteId,
        marks: payload,
      })
      setRoster(data.roster)
      const next: Record<string, AttendanceStatus> = {}
      for (const row of data.roster) {
        if (row.status) next[row.studentId] = row.status
      }
      setMarks(next)
      toast.success("Attendance saved")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save")
    } finally {
      setSaving(false)
    }
  }

  function setAll(status: AttendanceStatus) {
    const next: Record<string, AttendanceStatus> = {}
    for (const row of roster) next[row.studentId] = status
    setMarks(next)
  }

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading attendance…</p>
  }
  if (error) {
    return <p className="text-sm text-destructive">{error}</p>
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-muted-foreground">Date</span>
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-muted-foreground">Course</span>
          <select
            className="h-9 rounded-md border bg-background px-2"
            value={courseId}
            onChange={(e) => setCourseId(e.target.value)}
          >
            <option value="">Select course</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-muted-foreground">
            Class slot ({DAY_NAMES[dayOfWeek]})
          </span>
          <select
            className="h-9 rounded-md border bg-background px-2"
            value={slotId}
            onChange={(e) => setSlotId(e.target.value)}
            disabled={!daySlots.length}
          >
            {!daySlots.length ? (
              <option value="">No slots this day</option>
            ) : (
              daySlots.map((slot) => (
                <option key={slot.id} value={slot.id}>
                  {(slot.moduleName || "Module") +
                    ` · ${slot.startsAt}–${slot.endsAt}` +
                    (slot.location ? ` · ${slot.location}` : "")}
                </option>
              ))
            )}
          </select>
        </label>
      </div>

      {!courseId ? (
        <p className="text-sm text-muted-foreground">Choose a course to continue.</p>
      ) : !daySlots.length ? (
        <p className="text-sm text-muted-foreground">
          No timetable slots for {DAY_NAMES[dayOfWeek]}. Pick another date or add
          slots on the course timetable.
        </p>
      ) : !slotId ? null : !roster.length ? (
        <p className="text-sm text-muted-foreground">
          No students enrolled in this course yet. Enroll them when creating a
          student (department, course, and academic year).
        </p>
      ) : (
        <Card>
          <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3 space-y-0">
            <div>
              <CardTitle className="text-base">Roll call</CardTitle>
              <CardDescription>
                Mark Present or Absent, then save.
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setAll("PRESENT")}
              >
                All present
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setAll("ABSENT")}
              >
                All absent
              </Button>
              <Button type="button" size="sm" onClick={onSave} disabled={saving}>
                {saving ? "Saving…" : "Save attendance"}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="py-2 pr-3 font-medium">Student</th>
                    <th className="py-2 pr-3 font-medium">Present</th>
                    <th className="py-2 font-medium">Absent</th>
                  </tr>
                </thead>
                <tbody>
                  {roster.map((row) => (
                    <tr key={row.studentId} className="border-b last:border-0">
                      <td className="py-2.5 pr-3">
                        <div className="font-medium">{studentLabel(row)}</div>
                        {row.phone ? (
                          <div className="text-xs text-muted-foreground">
                            {row.phone}
                          </div>
                        ) : null}
                      </td>
                      <td className="py-2.5 pr-3">
                        <input
                          type="radio"
                          name={`att-${row.studentId}`}
                          checked={marks[row.studentId] === "PRESENT"}
                          onChange={() =>
                            setMarks((prev) => ({
                              ...prev,
                              [row.studentId]: "PRESENT",
                            }))
                          }
                        />
                      </td>
                      <td className="py-2.5">
                        <input
                          type="radio"
                          name={`att-${row.studentId}`}
                          checked={marks[row.studentId] === "ABSENT"}
                          onChange={() =>
                            setMarks((prev) => ({
                              ...prev,
                              [row.studentId]: "ABSENT",
                            }))
                          }
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
