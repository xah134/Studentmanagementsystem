"use client"

import * as React from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/Button/button"
import {
  fetchWhatsappQr,
  startWhatsappSession,
} from "@/components/support/support"

function qrImageSrc(data: unknown): string | null {
  if (!data) return null
  if (typeof data === "string") {
    if (data.startsWith("data:")) return data
    return `data:image/png;base64,${data}`
  }
  if (typeof data === "object") {
    const record = data as Record<string, unknown>
    const candidate =
      record.qr || record.data || record.value || record.base64 || record.image
    if (typeof candidate === "string") {
      return candidate.startsWith("data:")
        ? candidate
        : `data:image/png;base64,${candidate}`
    }
  }
  return null
}

export function WhatsappSessionSettings({ siteId }: { siteId: string }) {
  const [sessionPending, setSessionPending] = React.useState(false)
  const [qrPending, setQrPending] = React.useState(false)
  const [qrSrc, setQrSrc] = React.useState<string | null>(null)
  const [qrMessage, setQrMessage] = React.useState<string | null>(null)

  async function onLoadQr(options?: { retries?: number; delayMs?: number }) {
    const retries = options?.retries ?? 0
    const delayMs = options?.delayMs ?? 1500
    setQrPending(true)
    try {
      for (let attempt = 0; attempt <= retries; attempt++) {
        try {
          const data = await fetchWhatsappQr(siteId)
          if (
            data &&
            typeof data === "object" &&
            (data as { connected?: boolean }).connected
          ) {
            setQrSrc(null)
            setQrMessage("WhatsApp is already connected for this campus.")
            return
          }
          const src =
            qrImageSrc(data) || qrImageSrc((data as { qr?: unknown })?.qr)
          if (src) {
            setQrSrc(src)
            setQrMessage(null)
            return
          }
          setQrSrc(null)
          setQrMessage(
            "Session is running, but no QR was returned. It may already be connected."
          )
          return
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Could not load QR code"
          const stillStarting = /still starting|try refresh qr/i.test(message)
          if (stillStarting && attempt < retries) {
            setQrMessage("Waiting for WhatsApp QR…")
            await new Promise((resolve) => setTimeout(resolve, delayMs))
            continue
          }
          setQrSrc(null)
          setQrMessage(message)
          return
        }
      }
    } finally {
      setQrPending(false)
    }
  }

  async function onStartSession() {
    setSessionPending(true)
    try {
      await startWhatsappSession(siteId)
      toast.success("WhatsApp session started")
      setQrMessage(null)
      await onLoadQr({ retries: 8, delayMs: 1500 })
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not start session"
      )
    } finally {
      setSessionPending(false)
    }
  }

  return (
    <section className="flex max-w-xl flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-sm font-medium">WhatsApp session</h2>
        <p className="text-sm text-muted-foreground">
          Connect a WhatsApp number for student support on this campus. Pairing
          lives here; conversations appear under Support.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          disabled={sessionPending}
          onClick={onStartSession}
        >
          {sessionPending ? "Starting..." : "Start session"}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={qrPending}
          onClick={() => onLoadQr()}
        >
          {qrPending ? "Loading QR..." : "Refresh QR"}
        </Button>
      </div>
      {qrMessage ? (
        <p className="text-sm text-muted-foreground">{qrMessage}</p>
      ) : null}
      {qrSrc ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={qrSrc}
          alt="WhatsApp pairing QR"
          className="h-56 w-56 rounded-lg border bg-white p-2"
        />
      ) : null}
    </section>
  )
}
