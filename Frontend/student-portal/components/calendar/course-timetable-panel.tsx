"use client"

import * as React from "react"
import type {
  DateSelectArg,
  EventClickArg,
  EventDropArg,
  EventInput,
} from "@fullcalendar/core"
import { toast } from "sonner"

import { AppFullCalendar } from "@/components/calendar/full-calendar"
import {
  createTimetableSlot,
  deleteTimetableSlot,
  fetchCourseTimetable,
  updateTimetableSlot,
  type TimetableSlot,
} from "@/components/calendar/calendar-api"
import { fetchModules, type Module } from "@/components/modules/modules"
import { Button } from "@/components/ui/Button/button"
import { Input } from "@/components/ui/Input/input"

type Draft = {
  id?: string
  moduleId: string
  dayOfWeek: number
  startsAt: string
  endsAt: string
  title: string
  location: string
  color: string
  emoji: string
  imageUrl: string
}

function pad(n: number) {
  return String(n).padStart(2, "0")
}

function weekAnchor(date = new Date()) {
  const d = new Date(date)
  const day = d.getDay()
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() - day)
  return d
}

function slotToEvent(slot: TimetableSlot, anchor: Date): EventInput {
  const start = new Date(anchor)
  start.setDate(anchor.getDate() + slot.dayOfWeek)
  const [sh, sm] = slot.startsAt.split(":").map(Number)
  start.setHours(sh, sm, 0, 0)
  const end = new Date(anchor)
  end.setDate(anchor.getDate() + slot.dayOfWeek)
  const [eh, em] = slot.endsAt.split(":").map(Number)
  end.setHours(eh, em, 0, 0)
  const label = slot.title || slot.moduleName || "Class"
  const title = slot.emoji ? `${slot.emoji} ${label}` : label
  return {
    id: slot.id,
    title,
    start,
    end,
    backgroundColor: slot.color || "#22c55e",
    borderColor: slot.color || "#22c55e",
    extendedProps: {
      imageUrl: slot.imageUrl,
      raw: slot,
    },
  }
}

function emptyDraft(moduleId = ""): Draft {
  return {
    moduleId,
    dayOfWeek: 1,
    startsAt: "09:00",
    endsAt: "10:00",
    title: "",
    location: "",
    color: "#22c55e",
    emoji: "",
    imageUrl: "",
  }
}

export function CourseTimetablePanel({
  courseId,
  institutionId,
  editable,
}: {
  courseId: string
  institutionId: string
  editable: boolean
}) {
  const [slots, setSlots] = React.useState<TimetableSlot[]>([])
  const [modules, setModules] = React.useState<Module[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [draft, setDraft] = React.useState<Draft | null>(null)
  const [saving, setSaving] = React.useState(false)
  const [anchor, setAnchor] = React.useState(() => weekAnchor())

  const reload = React.useCallback(async () => {
    const [slotRows, moduleRows] = await Promise.all([
      fetchCourseTimetable(courseId),
      fetchModules(institutionId, undefined, courseId),
    ])
    setSlots(slotRows)
    setModules(moduleRows)
  }, [courseId, institutionId])

  React.useEffect(() => {
    let cancelled = false
    setLoading(true)
    reload()
      .then(() => {
        if (!cancelled) setError(null)
      })
      .catch((err: unknown) => {
        if (cancelled) return
        setError(err instanceof Error ? err.message : "Failed to load timetable")
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [reload])

  function openCreate(select?: DateSelectArg) {
    if (!editable) return
    const next = emptyDraft(modules[0]?.id || "")
    if (select?.start) {
      next.dayOfWeek = select.start.getDay()
      next.startsAt = `${pad(select.start.getHours())}:${pad(select.start.getMinutes())}`
      if (select.end) {
        next.endsAt = `${pad(select.end.getHours())}:${pad(select.end.getMinutes())}`
      }
    }
    setDraft(next)
  }

  function openEdit(click: EventClickArg) {
    const raw = click.event.extendedProps?.raw as TimetableSlot | undefined
    if (!raw) return
    setDraft({
      id: raw.id,
      moduleId: raw.moduleId,
      dayOfWeek: raw.dayOfWeek,
      startsAt: raw.startsAt,
      endsAt: raw.endsAt,
      title: raw.title || "",
      location: raw.location || "",
      color: raw.color || "#22c55e",
      emoji: raw.emoji || "",
      imageUrl: raw.imageUrl || "",
    })
  }

  async function saveDraft(event: React.FormEvent) {
    event.preventDefault()
    if (!draft || !editable) return
    if (!draft.moduleId) {
      toast.error("Select a module")
      return
    }
    setSaving(true)
    try {
      const payload = {
        moduleId: draft.moduleId,
        dayOfWeek: draft.dayOfWeek,
        startsAt: draft.startsAt,
        endsAt: draft.endsAt,
        title: draft.title.trim() || null,
        location: draft.location.trim() || null,
        color: draft.color || null,
        emoji: draft.emoji.trim() || null,
        imageUrl: draft.imageUrl.trim() || null,
      }
      if (draft.id) {
        await updateTimetableSlot(draft.id, payload)
        toast.success("Slot updated")
      } else {
        await createTimetableSlot(courseId, payload)
        toast.success("Slot created")
      }
      setDraft(null)
      await reload()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save slot")
    } finally {
      setSaving(false)
    }
  }

  async function removeDraft() {
    if (!draft?.id || !editable) return
    setSaving(true)
    try {
      await deleteTimetableSlot(draft.id)
      setDraft(null)
      await reload()
      toast.success("Slot deleted")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not delete slot")
    } finally {
      setSaving(false)
    }
  }

  async function onDropOrResize(arg: EventDropArg | { event: EventDropArg["event"]; revert: () => void }) {
    if (!editable) {
      arg.revert()
      return
    }
    const raw = arg.event.extendedProps?.raw as TimetableSlot | undefined
    if (!raw || !arg.event.start || !arg.event.end) {
      arg.revert()
      return
    }
    try {
      await updateTimetableSlot(raw.id, {
        dayOfWeek: arg.event.start.getDay(),
        startsAt: `${pad(arg.event.start.getHours())}:${pad(arg.event.start.getMinutes())}`,
        endsAt: `${pad(arg.event.end.getHours())}:${pad(arg.event.end.getMinutes())}`,
      })
      await reload()
    } catch (err) {
      arg.revert()
      toast.error(err instanceof Error ? err.message : "Could not move slot")
    }
  }

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading timetable…</p>
  }
  if (error) {
    return <p className="text-sm text-destructive">{error}</p>
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-medium">Weekly timetable</h2>
          <p className="text-xs text-muted-foreground">
            Module class slots for this course
          </p>
        </div>
        {editable ? (
          <Button type="button" onClick={() => openCreate()} disabled={!modules.length}>
            Add slot
          </Button>
        ) : null}
      </div>

      {!modules.length ? (
        <p className="text-sm text-muted-foreground">
          Add modules to this course before building a timetable.
        </p>
      ) : (
        <AppFullCalendar
          events={slots.map((slot) => slotToEvent(slot, anchor))}
          initialView="timeGridWeek"
          editable={editable}
          weekends
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "timeGridWeek,listWeek",
          }}
          onSelect={editable ? openCreate : undefined}
          onEventClick={openEdit}
          onEventDrop={editable ? onDropOrResize : undefined}
          onEventResize={editable ? onDropOrResize : undefined}
          onDatesSet={(arg) => setAnchor(weekAnchor(arg.start))}
        />
      )}

      {draft ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <form
            onSubmit={saveDraft}
            className="flex w-full max-w-lg flex-col gap-3 rounded-xl border bg-background p-4 shadow-lg"
          >
            <h3 className="text-sm font-semibold">
              {draft.id ? "Edit slot" : "New slot"}
            </h3>
            <select
              className="h-9 rounded-md border bg-background px-2 text-sm"
              value={draft.moduleId}
              onChange={(e) => setDraft({ ...draft, moduleId: e.target.value })}
              required
              disabled={!editable}
            >
              <option value="">Select module</option>
              {modules.map((module) => (
                <option key={module.id} value={module.id}>
                  {module.name}
                </option>
              ))}
            </select>
            <select
              className="h-9 rounded-md border bg-background px-2 text-sm"
              value={draft.dayOfWeek}
              onChange={(e) =>
                setDraft({ ...draft, dayOfWeek: Number(e.target.value) })
              }
              disabled={!editable}
            >
              {["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map(
                (label, index) => (
                  <option key={label} value={index}>
                    {label}
                  </option>
                )
              )}
            </select>
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="time"
                value={draft.startsAt}
                onChange={(e) => setDraft({ ...draft, startsAt: e.target.value })}
                required
                disabled={!editable}
              />
              <Input
                type="time"
                value={draft.endsAt}
                onChange={(e) => setDraft({ ...draft, endsAt: e.target.value })}
                required
                disabled={!editable}
              />
            </div>
            <Input
              placeholder="Title override (optional)"
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              disabled={!editable}
            />
            <Input
              placeholder="Location (optional)"
              value={draft.location}
              onChange={(e) => setDraft({ ...draft, location: e.target.value })}
              disabled={!editable}
            />
            <Input
              type="color"
              value={draft.color}
              onChange={(e) => setDraft({ ...draft, color: e.target.value })}
              disabled={!editable}
            />
            <Input
              placeholder="Emoji (optional)"
              value={draft.emoji}
              onChange={(e) => setDraft({ ...draft, emoji: e.target.value })}
              disabled={!editable}
            />
            <Input
              placeholder="Image URL (optional)"
              value={draft.imageUrl}
              onChange={(e) => setDraft({ ...draft, imageUrl: e.target.value })}
              disabled={!editable}
            />
            <div className="flex flex-wrap justify-end gap-2">
              {editable && draft.id ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={removeDraft}
                  disabled={saving}
                >
                  Delete
                </Button>
              ) : null}
              <Button type="button" variant="outline" onClick={() => setDraft(null)}>
                {editable ? "Cancel" : "Close"}
              </Button>
              {editable ? (
                <Button type="submit" disabled={saving}>
                  {saving ? "Saving…" : "Save"}
                </Button>
              ) : null}
            </div>
          </form>
        </div>
      ) : null}
    </div>
  )
}
