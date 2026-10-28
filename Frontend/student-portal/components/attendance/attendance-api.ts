import { apiUrl, authHeaders } from "@/lib/api"

export type AttendanceStatus = "PRESENT" | "ABSENT"

export type Enrollment = {
  id: string
  studentId: string
  courseId: string
  academicYearId: string
  institutionId: string
  studentPhone: string | null
  studentIdNumber: string | null
  courseName: string | null
  academicYearName: string | null
  createdAt: string
}

export type AttendanceRosterItem = {
  enrollmentId: string
  studentId: string
  firstName: string | null
  lastName: string | null
  phone: string | null
  idNumber: string | null
  verificationStatus: string
  status: AttendanceStatus | null
  attendanceRecordId: string | null
}

export type AttendanceRoster = {
  slot: {
    id: string
    courseId: string
    courseName: string
    moduleId: string
    moduleName: string | null
    moduleCode: string | null
    dayOfWeek: number
    startsAt: string
    endsAt: string
    location: string | null
    title: string | null
  }
  date: string
  academicYearId: string | null
  academicYearName: string | null
  roster: AttendanceRosterItem[]
}

async function parseJson(response: Response) {
  return response.json().catch(() => ({}))
}

export async function fetchEnrollments(params: {
  institutionId: string
  siteId: string
  courseId: string
  academicYearId?: string
  signal?: AbortSignal
}): Promise<Enrollment[]> {
  const query = new URLSearchParams({
    institutionId: params.institutionId,
    siteId: params.siteId,
    courseId: params.courseId,
  })
  if (params.academicYearId) query.set("academicYearId", params.academicYearId)
  const response = await fetch(`${apiUrl()}/enrollments?${query}`, {
    cache: "no-store",
    signal: params.signal,
    headers: authHeaders(),
  })
  const payload = await parseJson(response)
  if (!response.ok) {
    throw new Error(payload?.message || "Failed to load enrollments")
  }
  return (payload.data ?? []) as Enrollment[]
}

export async function createEnrollment(input: {
  studentId: string
  courseId: string
  academicYearId: string
  siteId: string
}): Promise<Enrollment> {
  const response = await fetch(`${apiUrl()}/enrollments`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(input),
  })
  const payload = await parseJson(response)
  if (!response.ok) {
    throw new Error(payload?.message || "Could not enroll student")
  }
  return payload.data as Enrollment
}

export async function deleteEnrollment(
  id: string,
  siteId: string
): Promise<void> {
  const params = new URLSearchParams({ siteId })
  const response = await fetch(`${apiUrl()}/enrollments/${id}?${params}`, {
    method: "DELETE",
    headers: authHeaders(),
  })
  const payload = await parseJson(response)
  if (!response.ok) {
    throw new Error(payload?.message || "Could not remove enrollment")
  }
}

export async function fetchAttendanceRoster(params: {
  timetableSlotId: string
  date: string
  siteId: string
  signal?: AbortSignal
}): Promise<AttendanceRoster> {
  const query = new URLSearchParams({
    timetableSlotId: params.timetableSlotId,
    date: params.date,
    siteId: params.siteId,
  })
  const response = await fetch(`${apiUrl()}/attendance?${query}`, {
    cache: "no-store",
    signal: params.signal,
    headers: authHeaders(),
  })
  const payload = await parseJson(response)
  if (!response.ok) {
    throw new Error(payload?.message || "Failed to load attendance")
  }
  return payload.data as AttendanceRoster
}

export async function saveAttendance(input: {
  timetableSlotId: string
  date: string
  siteId: string
  marks: { studentId: string; status: AttendanceStatus }[]
}): Promise<AttendanceRoster> {
  const response = await fetch(`${apiUrl()}/attendance`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(input),
  })
  const payload = await parseJson(response)
  if (!response.ok) {
    throw new Error(payload?.message || "Could not save attendance")
  }
  return payload.data as AttendanceRoster
}
