import { apiUrl } from "@/lib/api"

export type Campus = {
  id: string
  name: string
  city: string | null
  state: string | null
  address: string | null
  description: string | null
  latitude: number | null
  longitude: number | null
  createdAt: string
}

export type CampusDetail = {
  id: string
  name: string
  address: string | null
  city: string | null
  state: string | null
  zip: string | null
  latitude: number | null
  longitude: number | null
  description: string | null
  institutionId: string
  createdAt: string
}

export type CampusInput = {
  institutionId: string
  name: string
  description: string
  address: string
  city: string
  state: string
  zip: string
  latitude: number | string | null
  longitude: number | string | null
}

export async function fetchCampuses(
  institutionId: string,
  signal?: AbortSignal
): Promise<Campus[]> {
  const params = new URLSearchParams({
    institutionId,
    page: "1",
    pageSize: "50",
  })
  const response = await fetch(`${apiUrl()}/sites?${params}`, {
    cache: "no-store",
    signal,
  })
  const payload = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(payload?.message || "Failed to load campuses")
  }
  if (!Array.isArray(payload?.data)) {
    throw new Error("Invalid response structure")
  }

  return payload.data as Campus[]
}

export async function getCampus(id: string): Promise<CampusDetail> {
  const response = await fetch(`${apiUrl()}/sites/${id}`, { cache: "no-store" })
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(payload?.message || "Failed to load campus")
  }
  if (!payload?.data?.id) {
    throw new Error("Invalid response structure")
  }
  return payload.data as CampusDetail
}

export async function createCampus(input: CampusInput): Promise<CampusDetail> {
  const response = await fetch(`${apiUrl()}/sites`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  })
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(payload?.message || "Could not create campus")
  }
  return payload.data as CampusDetail
}

export async function updateCampus(
  id: string,
  input: CampusInput
): Promise<CampusDetail> {
  const response = await fetch(`${apiUrl()}/sites/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  })
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(payload?.message || "Could not update campus")
  }
  return payload.data as CampusDetail
}

export async function deleteCampus(id: string): Promise<void> {
  const response = await fetch(`${apiUrl()}/sites/${id}`, { method: "DELETE" })
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(payload?.message || "Could not remove campus")
  }
}
