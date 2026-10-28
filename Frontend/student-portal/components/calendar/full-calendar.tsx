"use client"

import * as React from "react"
import FullCalendar from "@fullcalendar/react"
import dayGridPlugin from "@fullcalendar/daygrid"
import timeGridPlugin from "@fullcalendar/timegrid"
import interactionPlugin from "@fullcalendar/interaction"
import listPlugin from "@fullcalendar/list"
import type {
  DateSelectArg,
  EventClickArg,
  EventContentArg,
  EventDropArg,
  EventInput,
} from "@fullcalendar/core"

type FullCalendarViewProps = {
  events: EventInput[]
  initialView?: "dayGridMonth" | "timeGridWeek" | "listWeek"
  editable?: boolean
  headerToolbar?: {
    left?: string
    center?: string
    right?: string
  }
  /** Pixel height, or omit for a viewport-capped default */
  height?: number
  slotMinTime?: string
  slotMaxTime?: string
  weekends?: boolean
  dayMaxEvents?: number | boolean
  onSelect?: (arg: DateSelectArg) => void
  onEventClick?: (arg: EventClickArg) => void
  onEventDrop?: (arg: EventDropArg) => void
  onEventResize?: (arg: {
    event: EventDropArg["event"]
    revert: () => void
  }) => void
  onDatesSet?: (arg: { start: Date }) => void
}

function useCalendarHeight(override?: number) {
  const [height, setHeight] = React.useState(override ?? 440)

  React.useEffect(() => {
    if (typeof override === "number") {
      setHeight(override)
      return
    }
    const update = () => {
      const next = Math.min(440, Math.max(320, window.innerHeight - 260))
      setHeight(next)
    }
    update()
    window.addEventListener("resize", update)
    return () => window.removeEventListener("resize", update)
  }, [override])

  return height
}

function renderEventContent(arg: EventContentArg) {
  const imageUrl = arg.event.extendedProps?.imageUrl as string | undefined
  return (
    <div className="flex items-center gap-0.5 overflow-hidden px-0.5 leading-tight">
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl}
          alt=""
          className="size-3 shrink-0 rounded object-cover"
        />
      ) : null}
      <div className="min-w-0 truncate text-[11px] font-medium">
        {arg.timeText ? (
          <span className="mr-1 opacity-70">{arg.timeText}</span>
        ) : null}
        {arg.event.title}
      </div>
    </div>
  )
}

export function AppFullCalendar({
  events,
  initialView = "dayGridMonth",
  editable = false,
  headerToolbar = {
    left: "prev,next today",
    center: "title",
    right: "dayGridMonth,timeGridWeek,listWeek",
  },
  height: heightProp,
  slotMinTime = "07:00:00",
  slotMaxTime = "21:00:00",
  weekends = true,
  dayMaxEvents = 3,
  onSelect,
  onEventClick,
  onEventDrop,
  onEventResize,
  onDatesSet,
}: FullCalendarViewProps) {
  const height = useCalendarHeight(heightProp)

  return (
    <div
      className={[
        "rounded-xl border bg-background p-2 sm:p-3",
        "[&_.fc]:text-xs",
        "[&_.fc-toolbar]:mb-2 [&_.fc-toolbar]:flex-wrap [&_.fc-toolbar]:gap-2",
        "[&_.fc-toolbar-title]:text-base [&_.fc-toolbar-title]:font-semibold",
        "[&_.fc-button]:!px-2 [&_.fc-button]:!py-1 [&_.fc-button]:!text-xs",
        "[&_.fc-col-header-cell]:py-1 [&_.fc-col-header-cell]:text-[11px]",
        "[&_.fc-daygrid-day-number]:p-1 [&_.fc-daygrid-day-number]:text-[11px]",
        "[&_.fc-daygrid-event]:mb-0.5 [&_.fc-daygrid-event]:rounded-sm [&_.fc-daygrid-event]:px-0.5 [&_.fc-daygrid-event]:py-0",
        "[&_.fc-daygrid-more-link]:text-[10px]",
        "[&_.fc-timegrid-slot]:h-7 [&_.fc-timegrid-slot-label]:text-[10px]",
        "[&_.fc-event]:border-0 [&_.fc-event]:shadow-none",
        "[&_.fc-list-event-title]:text-xs",
      ].join(" ")}
    >
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
        initialView={initialView}
        headerToolbar={headerToolbar}
        height={height}
        events={events}
        editable={editable}
        selectable={editable}
        selectMirror={editable}
        weekends={weekends}
        slotMinTime={slotMinTime}
        slotMaxTime={slotMaxTime}
        allDaySlot={initialView !== "timeGridWeek"}
        dayMaxEvents={dayMaxEvents}
        moreLinkClick="popover"
        nowIndicator
        eventContent={renderEventContent}
        select={onSelect}
        eventClick={onEventClick}
        eventDrop={onEventDrop}
        eventResize={onEventResize}
        datesSet={onDatesSet}
      />
    </div>
  )
}
