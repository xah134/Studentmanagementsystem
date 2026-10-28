import { apiUrl, authHeaders } from "@/lib/api"

export type SupportTicketStatus =
  | "OPEN"
  | "IN_PROGRESS"
  | "WAITING"
  | "DONE"

export type SupportTicket = {
  id: string
  siteId: string
  chatId: string
  code: string
  status: SupportTicketStatus
  preview: string | null
  openedAt: string | null
  createdAt: string
  updatedAt?: string
}

export type SupportMessage = {
  id: string
  direction: "INBOUND" | "OUTBOUND"
  body: string
  wahaMessageId: string | null
  createdAt: string
}

export type SupportTicketDetail = SupportTicket & {
  messages: SupportMessage[]
}

export const supportStatusLabels: Record<SupportTicketStatus, string> = {
  OPEN: "Open",
  IN_PROGRESS: "In progress",
  WAITING: "Waiting",
  DONE: "Closed",
}

export const supportStatusClasses: Record<SupportTicketStatus, string> = {
  OPEN: "bg-sky-100 text-sky-800",
  IN_PROGRESS: "bg-amber-100 text-amber-900",
  WAITING: "bg-violet-100 text-violet-800",
  DONE: "bg-emerald-100 text-emerald-800",
}

async function parseJson(response: Response) {
  return response.json().catch(() => ({}))
}

export async function startWhatsappSession(siteId: string): Promise<void> {
  const response = await fetch(`${apiUrl()}/support/whatsapp/sessions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify({ siteId }),
  })
  const payload = await parseJson(response)
  if (!response.ok) {
    throw new Error(payload?.message || "Could not start WhatsApp session")
  }
}

export async function fetchWhatsappQr(
  siteId: string
): Promise<{ qr?: string; status?: string; data?: unknown }> {
  const response = await fetch(
    `${apiUrl()}/support/whatsapp/sessions/${siteId}/qr`,
    {
      cache: "no-store",
      headers: authHeaders(),
    }
  )
  const payload = await parseJson(response)
  if (!response.ok) {
    throw new Error(payload?.message || "Could not load QR code")
  }
  return payload?.data ?? payload
}

export async function fetchSupportTickets(
  siteId: string,
  signal?: AbortSignal
): Promise<SupportTicket[]> {
  const params = new URLSearchParams({ siteId })
  const response = await fetch(`${apiUrl()}/support/tickets?${params}`, {
    cache: "no-store",
    signal,
    headers: authHeaders(),
  })
  const payload = await parseJson(response)
  if (!response.ok) {
    throw new Error(payload?.message || "Failed to load tickets")
  }
  if (!Array.isArray(payload?.data)) {
    throw new Error("Invalid response structure")
  }
  return payload.data as SupportTicket[]
}

export async function getSupportTicket(
  id: string
): Promise<SupportTicketDetail> {
  const response = await fetch(`${apiUrl()}/support/tickets/${id}`, {
    cache: "no-store",
    headers: authHeaders(),
  })
  const payload = await parseJson(response)
  if (!response.ok) {
    throw new Error(payload?.message || "Failed to load ticket")
  }
  if (!payload?.data?.id) {
    throw new Error("Invalid response structure")
  }
  return payload.data as SupportTicketDetail
}

export async function updateSupportTicketStatus(
  id: string,
  status: "IN_PROGRESS" | "WAITING" | "DONE"
): Promise<SupportTicket> {
  const response = await fetch(`${apiUrl()}/support/tickets/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify({ status }),
  })
  const payload = await parseJson(response)
  if (!response.ok) {
    throw new Error(payload?.message || "Could not update ticket")
  }
  return payload.data as SupportTicket
}

export async function replySupportTicket(
  id: string,
  text: string
): Promise<SupportMessage> {
  const response = await fetch(`${apiUrl()}/support/tickets/${id}/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify({ text }),
  })
  const payload = await parseJson(response)
  if (!response.ok) {
    throw new Error(payload?.message || "Could not send reply")
  }
  return payload.data as SupportMessage
}
