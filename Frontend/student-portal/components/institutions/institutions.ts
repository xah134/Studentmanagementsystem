import { apiUrl, authHeaders } from "@/lib/api"

export type InstitutionType =
  | "UNIVERSITY"
  | "COLLEGE"
  | "HIGH_SCHOOL"
  | "PRIMARY_SCHOOL"
  | "KINDERGARTEN"
  | "OTHER"

export type Institution = {
  id: string
  name: string
  email: string
  institutionType: InstitutionType
  city: string | null
  isActive: boolean
}

export const institutionTypeLabels: Record<InstitutionType, string> = {
  UNIVERSITY: "University",
  COLLEGE: "College",
  HIGH_SCHOOL: "High school",
  PRIMARY_SCHOOL: "Primary school",
  KINDERGARTEN: "Kindergarten",
  OTHER: "Other",
}

type InstitutionApiItem = {
  id: string
  name: string
  email: string
  institutionType: InstitutionType
  city: string | null
}

// Loads the first 50 registered institutions (the API's maximum page size).
// Rows from this endpoint are registered, so they start as active.
export async function fetchInstitutions(
  signal?: AbortSignal,
  headers?: HeadersInit
): Promise<Institution[]> {
  const response = await fetch(`${apiUrl()}/institutions?page=1&pageSize=50`, {
    cache: "no-store",
    signal,
    headers:
      headers ?? (typeof window === "undefined" ? undefined : authHeaders()),
  })
  const payload = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(payload?.message || "Failed to load institutions")
  }
  if (!Array.isArray(payload?.data)) {
    throw new Error("Invalid response structure")
  }

  return (payload.data as InstitutionApiItem[]).map((item) => ({
    id: item.id,
    name: item.name,
    email: item.email,
    institutionType: item.institutionType,
    city: item.city ?? null,
    isActive: true,
  }))
}

export async function getInstitution(id: string) {
  const list = await fetchInstitutions()
  return list.find((institution) => institution.id === id)
}
