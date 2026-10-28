"use client"

import * as React from "react"
import type { DateSelectArg, EventClickArg, EventInput } from "@fullcalendar/core"
import { toast } from "sonner"

import { AppFullCalendar } from "@/components/calendar/full-calendar"
import {
  calendarEventTypeLabels,
  createAcademicYear,
  createCalendarEvent,
  deleteAcademicYear,
  deleteCalendarEvent,
  fetchAcademicYears,
  fetchCalendarEvents,
  updateCalendarEvent,
  type AcademicYear,
  type CalendarEvent,
  type CalendarEventType,
} from "@/components/calendar/calendar-api"
import { fetchCampuses, type Campus } from "@/components/campuses/campuses"
import { Button } from "@/components/ui/Button/button"
import { Input } from "@/components/ui/Input/input"

const EVENT_TYPES = Object.keys(calendarEventTypeLabels) as CalendarEventType[]

type Draft = {
  id?: string
  title: string
  description: string
  eventType: CalendarEventType
  startsAt: string
  endsAt: string
  allDay: boolean
  color: string
  emoji: string
  imageUrl: string
  siteId: string
}

function toLocalInputValue(iso: string, allDay: boolean) {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ""
  if (allDay) return date.toISOString().slice(0, 10)
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function fromLocalInputValue(value: string, allDay: boolean) {
  if (allDay) return new Date(`${value}T00:00:00`).toISOString()
  return new Date(value).toISOString()
}

function eventToFc(event: CalendarEvent): EventInput {
  const title = event.emoji ? `${event.emoji} ${event.title}` : event.title
  return {
    id: event.id,
    title,
    start: event.startsAt,
    end: event.endsAt,
    allDay: event.allDay,
    backgroundColor: event.color || undefined,
    borderColor: event.color || undefined,
    extendedProps: {
      imageUrl: event.imageUrl,
      raw: event,
    },
  }
}

const emptyDraft = (): Draft => ({
  title: "",
  description: "",
  eventType: "OTHER",
  startsAt: "",
  endsAt: "",
  allDay: true,
  color: "#0ea5e9",
  emoji: "",
  imageUrl: "",
  siteId: "",
})

export function AcademicCalendarPanel({
  institutionId,
  siteId,
  editable,
}: {
  institutionId: string
  siteId?: string
  editable: boolean
}) {
  const [years, setYears] = React.useState<AcademicYear[]>([])
  const [yearId, setYearId] = React.useState("")
  const [events, setEvents] = React.useState<CalendarEvent[]>([])
  const [campuses, setCampuses] = React.useState<Campus[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [draft, setDraft] = React.useState<Draft | null>(null)
  const [saving, setSaving] = React.useState(false)
  const [yearName, setYearName] = React.useState("")
  const [yearStarts, setYearStarts] = React.useState("")
  const [yearEnds, setYearEnds] = React.useState("")

  const loadYears = React.useCallback(async () => {
    const rows = await fetchAcademicYears(institutionId)
    setYears(rows)
    setYearId((current) => current || rows[0]?.id || "")
  }, [institutionId])

  const loadEvents = React.useCallback(async () => {
    if (!yearId) {
      setEvents([])
      return
    }
    const rows = await fetchCalendarEvents({
      institutionId,
      academicYearId: yearId,
      siteId,
    })
    setEvents(rows)
  }, [institutionId, yearId, siteId])

  React.useEffect(() => {
    let cancelled = false
    setLoading(true)
    Promise.all([
      loadYears(),
      editable ? fetchCampuses(institutionId) : Promise.resolve([] as Campus[]),
    ])
      .then(([, campusRows]) => {
        if (cancelled) return
        setCampuses(campusRows)
        setError(null)
      })
      .catch((err: unknown) => {
        if (cancelled) return
        setError(err instanceof Error ? err.message : "Failed to load calendar")
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [institutionId, editable, loadYears])

  React.useEffect(() => {
    let cancelled = false
    loadEvents().catch((err: unknown) => {
      if (cancelled) return
      setError(err instanceof Error ? err.message : "Failed to load events")
    })
    return () => {
      cancelled = true
    }
  }, [loadEvents])

  async function onCreateYear(event: React.FormEvent) {
    event.preventDefault()
    if (!editable) return
    try {
      await createAcademicYear({
        institutionId,
        name: yearName.trim(),
        startsOn: yearStarts,
        endsOn: yearEnds,
      })
      setYearName("")
      setYearStarts("")
      setYearEnds("")
      await loadYears()
      toast.success("Academic year created")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not create year")
    }
  }

  async function onDeleteYear() {
    if (!editable || !yearId) return
    try {
      await deleteAcademicYear(yearId)
      setYearId("")
      await loadYears()
      toast.success("Academic year deleted")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not delete year")
    }
  }

  function openCreate(select?: DateSelectArg) {
    if (!editable || !yearId) return
    const next = emptyDraft()
    if (select) {
      next.allDay = select.allDay
      next.startsAt = toLocalInputValue(select.startStr, select.allDay)
      next.endsAt = toLocalInputValue(
        select.endStr || select.startStr,
        select.allDay
      )
    }
    setDraft(next)
  }

  function openEdit(click: EventClickArg) {
    const raw = click.event.extendedProps?.raw as CalendarEvent | undefined
    if (!raw) return
    setDraft({
      id: raw.id,
      title: raw.title,
      description: raw.description || "",
      eventType: raw.eventType,
      startsAt: toLocalInputValue(raw.startsAt, raw.allDay),
      endsAt: toLocalInputValue(raw.endsAt, raw.allDay),
      allDay: raw.allDay,
      color: raw.color || "#0ea5e9",
      emoji: raw.emoji || "",
      imageUrl: raw.imageUrl || "",
      siteId: raw.siteId || "",
    })
  }

  async function saveDraft(event: React.FormEvent) {
    event.preventDefault()
    if (!draft || !yearId || !editable) return
    setSaving(true)
    try {
      const payload = {
        institutionId,
        academicYearId: yearId,
        title: draft.title.trim(),
        description: draft.description.trim(),
        eventType: draft.eventType,
        startsAt: fromLocalInputValue(draft.startsAt, draft.allDay),
        endsAt: fromLocalInputValue(draft.endsAt, draft.allDay),
        allDay: draft.allDay,
        color: draft.color || null,
        emoji: draft.emoji.trim() || null,
        imageUrl: draft.imageUrl.trim() || null,
        siteId: draft.siteId || null,
      }
      if (draft.id) {
        await updateCalendarEvent(draft.id, payload)
        toast.success("Event updated")
      } else {
        await createCalendarEvent(payload)
        toast.success("Event created")
      }
      setDraft(null)
      await loadEvents()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save event")
    } finally {
      setSaving(false)
    }
  }

  async function removeDraft() {
    if (!draft?.id || !editable) return
    setSaving(true)
    try {
      await deleteCalendarEvent(draft.id)
      setDraft(null)
      await loadEvents()
      toast.success("Event deleted")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not delete event")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading calendar…</p>
  }
  if (error) {
    return <p className="text-sm text-destructive">{error}</p>
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end gap-3">
        <label className="flex min-w-48 flex-col gap-1 text-sm">
          <span className="text-muted-foreground">Academic year</span>
          <select
            className="h-9 rounded-md border bg-background px-2"
            value={yearId}
            onChange={(e) => setYearId(e.target.value)}
          >
            <option value="">Select year</option>
            {years.map((year) => (
              <option key={year.id} value={year.id}>
                {year.name}
              </option>
            ))}
          </select>
        </label>
        {editable && yearId ? (
          <Button type="button" variant="outline" onClick={onDeleteYear}>
            Delete year
          </Button>
        ) : null}
        {editable ? (
          <Button
            type="button"
            disabled={!yearId}
            onClick={() => openCreate()}
          >
            Add event
          </Button>
        ) : null}
      </div>

      {editable ? (
        <form
          onSubmit={onCreateYear}
          className="grid gap-3 rounded-xl border p-4 sm:grid-cols-4"
        >
          <Input
            placeholder="Year name (e.g. 2026)"
            value={yearName}
            onChange={(e) => setYearName(e.target.value)}
            required
          />
          <Input
            type="date"
            value={yearStarts}
            onChange={(e) => setYearStarts(e.target.value)}
            required
          />
          <Input
            type="date"
            value={yearEnds}
            onChange={(e) => setYearEnds(e.target.value)}
            required
          />
          <Button type="submit">Create academic year</Button>
        </form>
      ) : null}

      {yearId ? (
        <AppFullCalendar
          events={events.map(eventToFc)}
          editable={editable}
          onSelect={editable ? openCreate : undefined}
          onEventClick={openEdit}
          dayMaxEvents={2}
        />
      ) : (
        <p className="text-sm text-muted-foreground">
          {editable
            ? "Create an academic year to start adding events."
            : "No academic year is available yet."}
        </p>
      )}

      {draft ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <form
            onSubmit={saveDraft}
            className="flex max-h-[90vh] w-full max-w-lg flex-col gap-3 overflow-y-auto rounded-xl border bg-background p-4 shadow-lg"
          >
            <h3 className="text-sm font-semibold">
              {draft.id ? "Edit event" : "New event"}
            </h3>
            <Input
              placeholder="Title"
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              required
              disabled={!editable}
            />
            <textarea
              className="min-h-20 rounded-md border bg-background px-3 py-2 text-sm"
              placeholder="Description"
              value={draft.description}
              onChange={(e) =>
                setDraft({ ...draft, description: e.target.value })
              }
              disabled={!editable}
            />
            <select
              className="h-9 rounded-md border bg-background px-2 text-sm"
              value={draft.eventType}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  eventType: e.target.value as CalendarEventType,
                })
              }
              disabled={!editable}
            >
              {EVENT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {calendarEventTypeLabels[type]}
                </option>
              ))}
            </select>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={draft.allDay}
                onChange={(e) =>
                  setDraft({ ...draft, allDay: e.target.checked })
                }
                disabled={!editable}
              />
              All day
            </label>
            <Input
              type={draft.allDay ? "date" : "datetime-local"}
              value={draft.startsAt}
              onChange={(e) => setDraft({ ...draft, startsAt: e.target.value })}
              required
              disabled={!editable}
            />
            <Input
              type={draft.allDay ? "date" : "datetime-local"}
              value={draft.endsAt}
              onChange={(e) => setDraft({ ...draft, endsAt: e.target.value })}
              required
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
            {editable ? (
              <select
                className="h-9 rounded-md border bg-background px-2 text-sm"
                value={draft.siteId}
                onChange={(e) => setDraft({ ...draft, siteId: e.target.value })}
              >
                <option value="">Whole institution</option>
                {campuses.map((campus) => (
                  <option key={campus.id} value={campus.id}>
                    {campus.name}
                  </option>
                ))}
              </select>
            ) : null}
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
              <Button
                type="button"
                variant="outline"
                onClick={() => setDraft(null)}
              >
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
