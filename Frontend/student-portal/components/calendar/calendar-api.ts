import { apiUrl, authHeaders } from "@/lib/api"

export type AcademicYear = {
  id: string
  institutionId: string
  name: string
  startsOn: string
  endsOn: string
  createdAt: string
}

export type CalendarEventType =
  | "EXAM"
  | "BREAK"
  | "HOLIDAY"
  | "SPECIAL"
  | "OTHER"

export type CalendarEvent = {
  id: string
  institutionId: string
  academicYearId: string
  siteId: string | null
  title: string
  description: string | null
  eventType: CalendarEventType
  startsAt: string
  endsAt: string
  allDay: boolean
  color: string | null
  emoji: string | null
  imageUrl: string | null
  createdAt: string
  updatedAt: string
}

export type CalendarEventInput = {
  institutionId: string
  academicYearId: string
  siteId?: string | null
  title: string
  description?: string
  eventType: CalendarEventType
  startsAt: string
  endsAt: string
  allDay?: boolean
  color?: string | null
  emoji?: string | null
  imageUrl?: string | null
}

export type TimetableSlot = {
  id: string
  institutionId: string
  courseId: string
  moduleId: string
  moduleName: string | null
  siteId: string | null
  dayOfWeek: number
  startsAt: string
  endsAt: string
  title: string | null
  location: string | null
  color: string | null
  emoji: string | null
  imageUrl: string | null
  createdAt: string
  updatedAt: string
}

export type TimetableSlotInput = {
  moduleId: string
  dayOfWeek: number
  startsAt: string
  endsAt: string
  title?: string | null
  location?: string | null
  color?: string | null
  emoji?: string | null
  imageUrl?: string | null
  siteId?: string | null
}

async function parseJson(response: Response) {
  return response.json().catch(() => ({}))
}

export async function fetchAcademicYears(
  institutionId: string,
  signal?: AbortSignal
): Promise<AcademicYear[]> {
  const params = new URLSearchParams({ institutionId })
  const response = await fetch(`${apiUrl()}/academic-years?${params}`, {
    cache: "no-store",
    signal,
    headers: authHeaders(),
  })
  const payload = await parseJson(response)
  if (!response.ok) {
    throw new Error(payload?.message || "Failed to load academic years")
  }
  return (payload.data ?? []) as AcademicYear[]
}

export async function createAcademicYear(input: {
  institutionId: string
  name: string
  startsOn: string
  endsOn: string
}): Promise<AcademicYear> {
  const response = await fetch(`${apiUrl()}/academic-years`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(input),
  })
  const payload = await parseJson(response)
  if (!response.ok) {
    throw new Error(payload?.message || "Could not create academic year")
  }
  return payload.data as AcademicYear
}

export async function deleteAcademicYear(id: string): Promise<void> {
  const response = await fetch(`${apiUrl()}/academic-years/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  })
  const payload = await parseJson(response)
  if (!response.ok) {
    throw new Error(payload?.message || "Could not delete academic year")
  }
}

export async function fetchCalendarEvents(options: {
  institutionId: string
  academicYearId?: string
  siteId?: string
  signal?: AbortSignal
}): Promise<CalendarEvent[]> {
  const params = new URLSearchParams({
    institutionId: options.institutionId,
  })
  if (options.academicYearId) {
    params.set("academicYearId", options.academicYearId)
  }
  if (options.siteId) params.set("siteId", options.siteId)
  const response = await fetch(`${apiUrl()}/calendar-events?${params}`, {
    cache: "no-store",
    signal: options.signal,
    headers: authHeaders(),
  })
  const payload = await parseJson(response)
  if (!response.ok) {
    throw new Error(payload?.message || "Failed to load calendar events")
  }
  return (payload.data ?? []) as CalendarEvent[]
}

export async function createCalendarEvent(
  input: CalendarEventInput
): Promise<CalendarEvent> {
  const response = await fetch(`${apiUrl()}/calendar-events`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(input),
  })
  const payload = await parseJson(response)
  if (!response.ok) {
    throw new Error(payload?.message || "Could not create event")
  }
  return payload.data as CalendarEvent
}

export async function updateCalendarEvent(
  id: string,
  input: Partial<CalendarEventInput>
): Promise<CalendarEvent> {
  const response = await fetch(`${apiUrl()}/calendar-events/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(input),
  })
  const payload = await parseJson(response)
  if (!response.ok) {
    throw new Error(payload?.message || "Could not update event")
  }
  return payload.data as CalendarEvent
}

export async function deleteCalendarEvent(id: string): Promise<void> {
  const response = await fetch(`${apiUrl()}/calendar-events/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  })
  const payload = await parseJson(response)
  if (!response.ok) {
    throw new Error(payload?.message || "Could not delete event")
  }
}

export async function fetchCourseTimetable(
  courseId: string,
  signal?: AbortSignal
): Promise<TimetableSlot[]> {
  const response = await fetch(`${apiUrl()}/courses/${courseId}/timetable`, {
    cache: "no-store",
    signal,
    headers: authHeaders(),
  })
  const payload = await parseJson(response)
  if (!response.ok) {
    throw new Error(payload?.message || "Failed to load timetable")
  }
  return (payload.data ?? []) as TimetableSlot[]
}

export async function createTimetableSlot(
  courseId: string,
  input: TimetableSlotInput
): Promise<TimetableSlot> {
  const response = await fetch(`${apiUrl()}/courses/${courseId}/timetable`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(input),
  })
  const payload = await parseJson(response)
  if (!response.ok) {
    throw new Error(payload?.message || "Could not create slot")
  }
  return payload.data as TimetableSlot
}

export async function updateTimetableSlot(
  id: string,
  input: Partial<TimetableSlotInput>
): Promise<TimetableSlot> {
  const response = await fetch(`${apiUrl()}/timetable-slots/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(input),
  })
  const payload = await parseJson(response)
  if (!response.ok) {
    throw new Error(payload?.message || "Could not update slot")
  }
  return payload.data as TimetableSlot
}

export async function deleteTimetableSlot(id: string): Promise<void> {
  const response = await fetch(`${apiUrl()}/timetable-slots/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  })
  const payload = await parseJson(response)
  if (!response.ok) {
    throw new Error(payload?.message || "Could not delete slot")
  }
}

export const calendarEventTypeLabels: Record<CalendarEventType, string> = {
  EXAM: "Exam",
  BREAK: "Break",
  HOLIDAY: "Holiday",
  SPECIAL: "Special",
  OTHER: "Other",
}
