export type UserRole =
  | "SYSTEM_ADMIN"
  | "INSTITUTION_ADMIN"
  | "SITE_ADMIN"
  | "LECTURER"
  | "STUDENT"

export type User = {
  id: string
  firstName: string | null
  lastName: string | null
  email: string
  phone: string | null
  role: UserRole
  createdAt: string
  isActive: boolean
}

export const userRoleLabels: Record<UserRole, string> = {
  SYSTEM_ADMIN: "System admin",
  INSTITUTION_ADMIN: "Institution admin",
  SITE_ADMIN: "Site admin",
  LECTURER: "Lecturer",
  STUDENT: "Student",
}

type UserApiItem = Omit<User, "isActive">

const API_URL =
  process.env.NEXT_PUBLIC_STUDENT_PORTAL_API_URL || "http://localhost:5156/api"

export function getUserName(user: Pick<User, "firstName" | "lastName">) {
  return [user.firstName, user.lastName].filter(Boolean).join(" ")
}

// Loads the first 50 users (the API's maximum page size). Listed users start as active.
export async function fetchUsers(signal?: AbortSignal): Promise<User[]> {
  const response = await fetch(`${API_URL}/users?page=1&pageSize=50`, {
    cache: "no-store",
    signal,
  })
  const payload = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(payload?.message || "Failed to load users")
  }
  if (!Array.isArray(payload?.data)) {
    throw new Error("Invalid response structure")
  }

  return (payload.data as UserApiItem[]).map((item) => ({
    ...item,
    isActive: true,
  }))
}

export async function getUser(id: string) {
  const list = await fetchUsers()
  return list.find((user) => user.id === id)
}
