import { apiUrl } from "@/lib/api"

export type Gender = "MALE" | "FEMALE"
export type VerificationStatus = "PENDING" | "VERIFIED" | "REJECTED"

export type Lecturer = {
  id: string
  firstName: string | null
  lastName: string | null
  phone: string | null
  nationality: string | null
  idNumber: string | null
  institutionId: string
  siteId: string | null
  siteName: string | null
  verificationStatus: VerificationStatus
  createdAt: string
}

export type LecturerDetail = {
  id: string
  firstName: string | null
  lastName: string | null
  phone: string | null
  foreignNational: boolean
  passportNumber: string | null
  idNumber: string | null
  dateOfBirth: string | null
  gender: Gender | null
  nationality: string | null
  address: string | null
  city: string | null
  state: string | null
  zip: string | null
  country: string | null
  institutionId: string
  siteId: string | null
  siteName: string | null
  verificationStatus: VerificationStatus
  createdAt: string
}

export type LecturerInput = {
  institutionId: string
  firstName: string
  lastName: string
  phone: string
  gender: Gender | ""
  dateOfBirth: string
  nationality: string
  foreignNational: boolean
  verificationStatus: VerificationStatus
  idNumber: string
  passportNumber: string
  address: string
  city: string
  state: string
  zip: string
  country: string
  siteId: string
}

export const verificationStatusLabels: Record<VerificationStatus, string> = {
  PENDING: "Pending",
  VERIFIED: "Verified",
  REJECTED: "Rejected",
}

export const genderLabels: Record<Gender, string> = {
  MALE: "Male",
  FEMALE: "Female",
}

export async function fetchLecturers(
  institutionId: string,
  signal?: AbortSignal,
  siteId?: string
): Promise<Lecturer[]> {
  const params = new URLSearchParams({
    institutionId,
    page: "1",
    pageSize: "50",
  })
  if (siteId) params.set("siteId", siteId)
  const response = await fetch(`${apiUrl()}/lecturers?${params}`, {
    cache: "no-store",
    signal,
  })
  const payload = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(payload?.message || "Failed to load lecturers")
  }
  if (!Array.isArray(payload?.data)) {
    throw new Error("Invalid response structure")
  }

  return payload.data as Lecturer[]
}

export async function getLecturer(id: string): Promise<LecturerDetail> {
  const response = await fetch(`${apiUrl()}/lecturers/${id}`, {
    cache: "no-store",
  })
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(payload?.message || "Failed to load lecturer")
  }
  if (!payload?.data?.id) {
    throw new Error("Invalid response structure")
  }
  return payload.data as LecturerDetail
}

export async function createLecturer(
  input: LecturerInput
): Promise<LecturerDetail> {
  const response = await fetch(`${apiUrl()}/lecturers`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  })
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(payload?.message || "Could not create lecturer")
  }
  return payload.data as LecturerDetail
}

export async function updateLecturer(
  id: string,
  input: LecturerInput
): Promise<LecturerDetail> {
  const response = await fetch(`${apiUrl()}/lecturers/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  })
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(payload?.message || "Could not update lecturer")
  }
  return payload.data as LecturerDetail
}

export async function deleteLecturer(id: string): Promise<void> {
  const response = await fetch(`${apiUrl()}/lecturers/${id}`, {
    method: "DELETE",
  })
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(payload?.message || "Could not remove lecturer")
  }
}
