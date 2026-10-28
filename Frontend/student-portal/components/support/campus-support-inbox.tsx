"use client"

import * as React from "react"
import { CheckCheck, MoreVertical, Search } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/Button/button"
import { Input } from "@/components/ui/Input/input"
import {
  fetchSupportTickets,
  getSupportTicket,
  replySupportTicket,
  supportStatusClasses,
  supportStatusLabels,
  updateSupportTicketStatus,
  type SupportTicket,
  type SupportTicketDetail,
  type SupportTicketStatus,
} from "@/components/support/support"
import { cn } from "@/lib/utils"

function StatusBadge({ status }: { status: SupportTicketStatus }) {
  return (
    <span
      className={cn(
        "shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
        supportStatusClasses[status] || "bg-muted text-muted-foreground"
      )}
    >
      {supportStatusLabels[status] || status}
    </span>
  )
}

function isGroupChat(chatId: string) {
  return /@g\.us$/i.test(chatId)
}

function formatChatContact(chatId: string) {
  if (isGroupChat(chatId)) {
    return "Group chat"
  }
  const bare = chatId.replace(/@(c\.us|lid|s\.whatsapp\.net)$/i, "")
  if (/^\d{8,15}$/.test(bare)) {
    return `+${bare}`
  }
  if (bare.length > 14) {
    return `Contact · ${bare.slice(0, 6)}…${bare.slice(-4)}`
  }
  return bare || chatId
}

function contactInitials(chatId: string) {
  const label = formatChatContact(chatId).replace(/^\+/, "")
  return label.slice(0, 2).toUpperCase()
}

function formatListTime(value: string | null) {
  if (!value) return ""
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""
  const now = new Date()
  const sameDay =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  if (sameDay) {
    return date.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    })
  }
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  })
}

function formatBubbleTime(value: string | null) {
  if (!value) return ""
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""
  return date.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function CampusSupportInbox({ siteId }: { siteId: string }) {
  const [tickets, setTickets] = React.useState<SupportTicket[]>([])
  const [loadingTickets, setLoadingTickets] = React.useState(true)
  const [ticketError, setTicketError] = React.useState<string | null>(null)
  const [query, setQuery] = React.useState("")
  const [selectedId, setSelectedId] = React.useState<string | null>(null)
  const [selected, setSelected] = React.useState<SupportTicketDetail | null>(
    null
  )
  const [loadingThread, setLoadingThread] = React.useState(false)
  const [reply, setReply] = React.useState("")
  const [replyPending, setReplyPending] = React.useState(false)
  const threadEndRef = React.useRef<HTMLDivElement | null>(null)

  const conversations = React.useMemo(() => {
    const open = tickets.filter(
      (ticket) => ticket.status !== "DONE" && !isGroupChat(ticket.chatId)
    )
    const q = query.trim().toLowerCase()
    if (!q) return open
    return open.filter((ticket) => {
      const haystack =
        `${ticket.code} ${ticket.chatId} ${ticket.preview ?? ""}`.toLowerCase()
      return (
        haystack.includes(q) ||
        formatChatContact(ticket.chatId).toLowerCase().includes(q)
      )
    })
  }, [tickets, query])

  const loadTickets = React.useCallback(
    (signal?: AbortSignal) => {
      fetchSupportTickets(siteId, signal)
        .then((items) => {
          if (signal?.aborted) return
          setTickets(items)
          setTicketError(null)
        })
        .catch((error: unknown) => {
          if (signal?.aborted) return
          setTickets([])
          setTicketError(
            error instanceof Error ? error.message : "Failed to load tickets"
          )
        })
        .finally(() => {
          if (!signal?.aborted) setLoadingTickets(false)
        })
    },
    [siteId]
  )

  React.useEffect(() => {
    const controller = new AbortController()
    setLoadingTickets(true)
    loadTickets(controller.signal)
    const interval = window.setInterval(() => loadTickets(), 5000)
    return () => {
      controller.abort()
      window.clearInterval(interval)
    }
  }, [loadTickets])

  React.useEffect(() => {
    if (!selectedId) {
      setSelected(null)
      return
    }
    let cancelled = false
    setLoadingThread(true)
    getSupportTicket(selectedId)
      .then((detail) => {
        if (!cancelled) setSelected(detail)
      })
      .catch((error: unknown) => {
        if (cancelled) return
        toast.error(
          error instanceof Error ? error.message : "Failed to open chat"
        )
        setSelected(null)
        setSelectedId(null)
      })
      .finally(() => {
        if (!cancelled) setLoadingThread(false)
      })
    return () => {
      cancelled = true
    }
  }, [selectedId])

  React.useEffect(() => {
    if (!selectedId) return
    const interval = window.setInterval(() => {
      getSupportTicket(selectedId)
        .then((detail) => setSelected(detail))
        .catch(() => undefined)
    }, 4000)
    return () => window.clearInterval(interval)
  }, [selectedId])

  React.useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [selected?.messages.length, selectedId])

  async function refreshSelected() {
    if (!selectedId) return
    const detail = await getSupportTicket(selectedId)
    setSelected(detail)
    loadTickets()
  }

  async function onReply(event: React.FormEvent) {
    event.preventDefault()
    if (!selected || !reply.trim()) return
    setReplyPending(true)
    try {
      await replySupportTicket(selected.id, reply.trim())
      setReply("")
      await refreshSelected()
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not send reply"
      )
    } finally {
      setReplyPending(false)
    }
  }

  async function onStatus(status: "IN_PROGRESS" | "WAITING" | "DONE") {
    if (!selected) return
    try {
      await updateSupportTicketStatus(selected.id, status)
      if (status === "DONE") {
        setSelectedId(null)
        setSelected(null)
      } else {
        await refreshSelected()
      }
      loadTickets()
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not update ticket"
      )
    }
  }

  return (
    <div className="flex h-[calc(100vh-3.5rem)] min-h-0 w-full overflow-hidden bg-[#efeae2]">
      <aside className="flex w-full max-w-[380px] shrink-0 flex-col border-r border-black/10 bg-[#ffffff] md:w-[380px]">
        <div className="flex items-center gap-3 bg-[#f0f2f5] px-4 py-3">
          <div className="flex size-10 items-center justify-center rounded-full bg-[#dfe5e7] text-xs font-semibold text-[#54656f]">
            WA
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-[#111b21]">
              Support chats
            </p>
            <p className="truncate text-xs text-[#667781]">
              One thread per number
            </p>
          </div>
        </div>

        <div className="bg-[#f0f2f5] px-3 pb-2">
          <label className="flex items-center gap-2 rounded-lg bg-white px-3 py-1.5">
            <Search className="size-4 text-[#54656f]" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search or start from a number"
              className="w-full bg-transparent text-sm text-[#111b21] outline-none placeholder:text-[#667781]"
            />
          </label>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loadingTickets ? (
            <p className="px-4 py-8 text-sm text-[#667781]">Loading chats…</p>
          ) : null}
          {ticketError ? (
            <p className="px-4 py-8 text-sm text-red-600">{ticketError}</p>
          ) : null}
          {!loadingTickets && !ticketError && conversations.length === 0 ? (
            <p className="px-4 py-8 text-sm text-[#667781]">
              No open chats yet. When a student messages the campus WhatsApp
              number, their chat appears here.
            </p>
          ) : null}

          <ul>
            {conversations.map((ticket) => {
              const active = ticket.id === selectedId
              return (
                <li key={ticket.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(ticket.id)}
                    className={cn(
                      "flex w-full items-center gap-3 border-b border-black/5 px-3 py-3 text-left transition-colors",
                      active ? "bg-[#f0f2f5]" : "hover:bg-[#f5f6f6]"
                    )}
                  >
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[#dfe5e7] text-sm font-semibold text-[#54656f]">
                      {contactInitials(ticket.chatId)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="truncate text-[15px] font-medium text-[#111b21]">
                          {formatChatContact(ticket.chatId)}
                        </span>
                        <span className="shrink-0 text-[11px] text-[#667781]">
                          {formatListTime(ticket.updatedAt || ticket.createdAt)}
                        </span>
                      </div>
                      <div className="mt-0.5 flex items-center gap-2">
                        <span className="font-mono text-[11px] font-medium text-[#54656f]">
                          {ticket.code}
                        </span>
                        <StatusBadge
                          status={ticket.status as SupportTicketStatus}
                        />
                      </div>
                      <span className="mt-0.5 line-clamp-1 text-[13px] text-[#667781]">
                        {ticket.preview || "No messages yet"}
                      </span>
                    </div>
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      </aside>

      <section className="flex min-w-0 flex-1 flex-col">
        {!selectedId ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 border-b border-black/10 bg-[#f0f2f5] px-8 text-center">
            <p className="text-2xl font-light text-[#41525d]">Campus Support</p>
            <p className="max-w-md text-sm text-[#667781]">
              Select a number on the left to open that chat — same idea as
              WhatsApp on desktop.
            </p>
          </div>
        ) : loadingThread && !selected ? (
          <div className="flex flex-1 items-center justify-center bg-[#efeae2]">
            <p className="text-sm text-[#667781]">Opening chat…</p>
          </div>
        ) : selected ? (
          <>
            <header className="flex items-center gap-3 border-b border-black/10 bg-[#f0f2f5] px-4 py-2.5">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#dfe5e7] text-xs font-semibold text-[#54656f]">
                {contactInitials(selected.chatId)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate text-[15px] font-medium text-[#111b21]">
                    {formatChatContact(selected.chatId)}
                  </p>
                  <span className="font-mono text-xs font-semibold text-[#54656f]">
                    {selected.code}
                  </span>
                  <StatusBadge status={selected.status} />
                </div>
                <p className="truncate text-xs text-[#667781]">
                  {selected.chatId.includes("@c.us")
                    ? formatChatContact(selected.chatId)
                    : selected.chatId}
                </p>
              </div>
              <div className="hidden items-center gap-1 sm:flex">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-[#54656f]"
                  onClick={() => onStatus("WAITING")}
                >
                  Waiting
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-[#54656f]"
                  onClick={() => onStatus("DONE")}
                >
                  Close
                </Button>
                <MoreVertical className="size-5 text-[#54656f]" />
              </div>
            </header>

            <div
              className="flex flex-1 flex-col gap-1 overflow-y-auto px-4 py-3 sm:px-12"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 20% 20%, rgba(0,0,0,0.03) 0, transparent 45%), radial-gradient(circle at 80% 0%, rgba(0,0,0,0.04) 0, transparent 40%)",
              }}
            >
              {selected.messages.map((message) => {
                const outbound = message.direction === "OUTBOUND"
                return (
                  <div
                    key={message.id}
                    className={cn(
                      "flex w-full",
                      outbound ? "justify-end" : "justify-start"
                    )}
                  >
                    <div
                      className={cn(
                        "relative max-w-[85%] rounded-lg px-2.5 py-1.5 text-[14.2px] leading-5 shadow-sm sm:max-w-[65%]",
                        outbound
                          ? "rounded-tr-none bg-[#d9fdd3] text-[#111b21]"
                          : "rounded-tl-none bg-white text-[#111b21]"
                      )}
                    >
                      <p className="whitespace-pre-wrap break-words">
                        {message.body}
                      </p>
                      <span className="mt-1 flex items-center justify-end gap-1 text-[11px] text-[#667781]">
                        {formatBubbleTime(message.createdAt)}
                        {outbound ? (
                          <CheckCheck className="size-3.5 text-[#53bdeb]" />
                        ) : null}
                      </span>
                    </div>
                  </div>
                )
              })}
              <div ref={threadEndRef} />
            </div>

            <form
              onSubmit={onReply}
              className="flex items-center gap-2 bg-[#f0f2f5] px-3 py-2"
            >
              <Input
                value={reply}
                onChange={(event) => setReply(event.target.value)}
                placeholder="Type a message"
                className="h-11 flex-1 rounded-lg border-0 bg-white shadow-none focus-visible:ring-0"
              />
              <Button
                type="submit"
                disabled={replyPending || !reply.trim()}
                className="h-11 rounded-lg bg-[#00a884] px-5 hover:bg-[#008f72]"
              >
                {replyPending ? "…" : "Send"}
              </Button>
            </form>
          </>
        ) : null}
      </section>
    </div>
  )
}
