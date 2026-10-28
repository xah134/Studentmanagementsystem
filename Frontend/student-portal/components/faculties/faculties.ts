import { apiUrl } from "@/lib/api"

export type Faculty = {
  id: string
  name: string
  code: string | null
  description: string | null
  campusId: string | null
  campusName: string | null
  createdAt: string
}

export type FacultyDetail = {
  id: string
  name: string
  code: string | null
  description: string | null
  campusId: string | null
  institutionId: string
  createdAt: string
}

export type FacultyInput = {
  institutionId: string
  name: string
  code: string
  description: string
  campusId: string | null
}

export async function fetchFaculties(
  institutionId: string,
  signal?: AbortSignal,
  siteId?: string
): Promise<Faculty[]> {
  const params = new URLSearchParams({
    institutionId,
    page: "1",
    pageSize: "50",
  })
  if (siteId) params.set("siteId", siteId)
  const response = await fetch(`${apiUrl()}/faculties?${params}`, {
    cache: "no-store",
    signal,
  })
  const payload = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(payload?.message || "Failed to load faculties")
  }
  if (!Array.isArray(payload?.data)) {
    throw new Error("Invalid response structure")
  }

  return payload.data as Faculty[]
}

export async function getFaculty(id: string): Promise<FacultyDetail> {
  const response = await fetch(`${apiUrl()}/faculties/${id}`, {
    cache: "no-store",
  })
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(payload?.message || "Failed to load faculty")
  }
  if (!payload?.data?.id) {
    throw new Error("Invalid response structure")
  }
  return payload.data as FacultyDetail
}

export async function createFaculty(
  input: FacultyInput
): Promise<FacultyDetail> {
  const response = await fetch(`${apiUrl()}/faculties`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  })
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(payload?.message || "Could not create faculty")
  }
  return payload.data as FacultyDetail
}

export async function updateFaculty(
  id: string,
  input: FacultyInput
): Promise<FacultyDetail> {
  const response = await fetch(`${apiUrl()}/faculties/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  })
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(payload?.message || "Could not update faculty")
  }
  return payload.data as FacultyDetail
}

export async function deleteFaculty(id: string): Promise<void> {
  const response = await fetch(`${apiUrl()}/faculties/${id}`, {
    method: "DELETE",
  })
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(payload?.message || "Could not remove faculty")
  }
}
