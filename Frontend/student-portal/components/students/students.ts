import { apiUrl } from "@/lib/api"

export type Gender = "MALE" | "FEMALE"
export type VerificationStatus = "PENDING" | "VERIFIED" | "REJECTED"

export type Guardian = {
  id: string
  name: string
  relationship: string
  phone: string | null
  email: string | null
}

export type Student = {
  id: string
  firstName: string | null
  lastName: string | null
  phone: string | null
  nationality: string | null
  idNumber: string | null
  siteId: string
  siteName: string | null
  verificationStatus: VerificationStatus
  guardianCount: number
  createdAt: string
}

export type StudentDetail = {
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
  siteId: string
  siteName: string | null
  verificationStatus: VerificationStatus
  guardians: Guardian[]
  createdAt: string
}

export type GuardianInput = {
  name: string
  relationship: string
  phone: string
  email: string
}

export type StudentInput = {
  institutionId: string
  siteId: string
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
  facultyId?: string
  courseId?: string
  academicYearId?: string
  guardians: GuardianInput[]
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

export async function fetchStudents(
  institutionId: string,
  signal?: AbortSignal,
  siteId?: string
): Promise<Student[]> {
  const params = new URLSearchParams({
    institutionId,
    page: "1",
    pageSize: "50",
  })
  if (siteId) params.set("siteId", siteId)
  const response = await fetch(`${apiUrl()}/students?${params}`, {
    cache: "no-store",
    signal,
  })
  const payload = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(payload?.message || "Failed to load students")
  }
  if (!Array.isArray(payload?.data)) {
    throw new Error("Invalid response structure")
  }

  return payload.data as Student[]
}

export async function getStudent(id: string): Promise<StudentDetail> {
  const response = await fetch(`${apiUrl()}/students/${id}`, {
    cache: "no-store",
  })
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(payload?.message || "Failed to load student")
  }
  if (!payload?.data?.id) {
    throw new Error("Invalid response structure")
  }
  return payload.data as StudentDetail
}

export async function createStudent(input: StudentInput): Promise<StudentDetail> {
  const response = await fetch(`${apiUrl()}/students`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  })
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(payload?.message || "Could not create student")
  }
  return payload.data as StudentDetail
}

export async function updateStudent(
  id: string,
  input: StudentInput
): Promise<StudentDetail> {
  const response = await fetch(`${apiUrl()}/students/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  })
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(payload?.message || "Could not update student")
  }
  return payload.data as StudentDetail
}

export async function deleteStudent(id: string): Promise<void> {
  const response = await fetch(`${apiUrl()}/students/${id}`, {
    method: "DELETE",
  })
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(payload?.message || "Could not remove student")
  }
}
