import { apiUrl } from "@/lib/api"

export type Module = {
  id: string
  name: string
  code: string | null
  description: string | null
  credits: number | null
  courseId: string
  courseName: string | null
  createdAt: string
}

export type ModuleDetail = {
  id: string
  name: string
  code: string | null
  description: string | null
  credits: number | null
  courseId: string
  institutionId: string
  createdAt: string
}

export type ModuleInput = {
  institutionId: string
  courseId: string
  name: string
  code: string
  description: string
  credits: number | null
}

export async function fetchModules(
  institutionId: string,
  signal?: AbortSignal,
  courseId?: string
): Promise<Module[]> {
  const params = new URLSearchParams({
    institutionId,
    page: "1",
    pageSize: "50",
  })
  if (courseId) params.set("courseId", courseId)
  const response = await fetch(`${apiUrl()}/modules?${params}`, {
    cache: "no-store",
    signal,
  })
  const payload = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(payload?.message || "Failed to load modules")
  }
  if (!Array.isArray(payload?.data)) {
    throw new Error("Invalid response structure")
  }

  return payload.data as Module[]
}

export async function getModule(id: string): Promise<ModuleDetail> {
  const response = await fetch(`${apiUrl()}/modules/${id}`, {
    cache: "no-store",
  })
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(payload?.message || "Failed to load module")
  }
  if (!payload?.data?.id) {
    throw new Error("Invalid response structure")
  }
  return payload.data as ModuleDetail
}

export async function createModule(input: ModuleInput): Promise<ModuleDetail> {
  const response = await fetch(`${apiUrl()}/modules`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  })
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(payload?.message || "Could not create module")
  }
  return payload.data as ModuleDetail
}

export async function updateModule(
  id: string,
  input: ModuleInput
): Promise<ModuleDetail> {
  const response = await fetch(`${apiUrl()}/modules/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  })
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(payload?.message || "Could not update module")
  }
  return payload.data as ModuleDetail
}

export async function deleteModule(id: string): Promise<void> {
  const response = await fetch(`${apiUrl()}/modules/${id}`, {
    method: "DELETE",
  })
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(payload?.message || "Could not remove module")
  }
}
