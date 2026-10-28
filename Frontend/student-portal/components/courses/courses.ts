import { apiUrl } from "@/lib/api"

export type Course = {
  id: string
  name: string
  code: string | null
  description: string | null
  facultyId: string
  facultyName: string | null
  campusId: string | null
  campusName: string | null
  createdAt: string
}

export type CourseDetail = {
  id: string
  name: string
  code: string | null
  description: string | null
  facultyId: string
  campusId: string | null
  institutionId: string
  createdAt: string
}

export type CourseInput = {
  institutionId: string
  facultyId: string
  name: string
  code: string
  description: string
  campusId: string | null
}

export async function fetchCourses(
  institutionId: string,
  signal?: AbortSignal,
  siteId?: string
): Promise<Course[]> {
  const params = new URLSearchParams({
    institutionId,
    page: "1",
    pageSize: "50",
  })
  if (siteId) params.set("siteId", siteId)
  const response = await fetch(`${apiUrl()}/courses?${params}`, {
    cache: "no-store",
    signal,
  })
  const payload = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(payload?.message || "Failed to load courses")
  }
  if (!Array.isArray(payload?.data)) {
    throw new Error("Invalid response structure")
  }

  return payload.data as Course[]
}

export async function getCourse(id: string): Promise<CourseDetail> {
  const response = await fetch(`${apiUrl()}/courses/${id}`, {
    cache: "no-store",
  })
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(payload?.message || "Failed to load course")
  }
  if (!payload?.data?.id) {
    throw new Error("Invalid response structure")
  }
  return payload.data as CourseDetail
}

export async function createCourse(input: CourseInput): Promise<CourseDetail> {
  const response = await fetch(`${apiUrl()}/courses`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  })
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(payload?.message || "Could not create course")
  }
  return payload.data as CourseDetail
}

export async function updateCourse(
  id: string,
  input: CourseInput
): Promise<CourseDetail> {
  const response = await fetch(`${apiUrl()}/courses/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  })
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(payload?.message || "Could not update course")
  }
  return payload.data as CourseDetail
}

export async function deleteCourse(id: string): Promise<void> {
  const response = await fetch(`${apiUrl()}/courses/${id}`, {
    method: "DELETE",
  })
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(payload?.message || "Could not remove course")
  }
}
