"use client"

import * as React from "react"
import dynamic from "next/dynamic"
import { useRouter } from "next/navigation"
import type { SearchBoxRetrieveResponse } from "@mapbox/search-js-core"
import type mapboxgl from "mapbox-gl"

import { fetchCampuses, type Campus } from "./campuses"

export const MAP_UNAVAILABLE_MESSAGE = "The map is unavailable."

const CAPE_TOWN: [number, number] = [18.4241, -33.9249]
const STREET_ZOOM = 15

const SearchBox = dynamic(
  () => import("@mapbox/search-js-react").then((mod) => mod.SearchBox),
  { ssr: false }
)

export function mapboxAccessToken() {
  return process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN?.trim() ?? ""
}

export type LocationSelection = {
  address?: string
  city?: string
  state?: string
  zip?: string
  latitude: string
  longitude: string
}

function coordinate(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return null
  const number = Number(trimmed)
  return Number.isFinite(number) ? number : null
}

function roundCoordinate(value: number) {
  return value.toFixed(6)
}

function contextName(entry: { name?: string } | undefined) {
  const name = entry?.name?.trim()
  return name || undefined
}

export function selectionFromRetrieve(
  response: SearchBoxRetrieveResponse
): LocationSelection | null {
  const feature = response.features[0]
  if (!feature) return null

  const latitude = feature.properties.coordinates?.latitude
  const longitude = feature.properties.coordinates?.longitude
  const [geometryLongitude, geometryLatitude] = feature.geometry.coordinates
  const resolvedLatitude = latitude ?? geometryLatitude
  const resolvedLongitude = longitude ?? geometryLongitude
  if (
    !Number.isFinite(resolvedLatitude) ||
    !Number.isFinite(resolvedLongitude)
  ) {
    return null
  }

  const context = feature.properties.context
  const numberedStreet = [
    contextName(context?.address_number),
    contextName(context?.street),
  ]
    .filter(Boolean)
    .join(" ")
  const address =
    contextName(context?.address) ||
    feature.properties.address?.trim() ||
    numberedStreet ||
    undefined
  const city = contextName(context?.place) || contextName(context?.locality)
  const state = contextName(context?.region)
  const zip = contextName(context?.postcode)

  return {
    ...(address ? { address } : {}),
    ...(city ? { city } : {}),
    ...(state ? { state } : {}),
    ...(zip ? { zip } : {}),
    latitude: roundCoordinate(resolvedLatitude),
    longitude: roundCoordinate(resolvedLongitude),
  }
}

function labelMarker(marker: mapboxgl.Marker) {
  const element = marker.getElement()
  element.setAttribute("role", "button")
  element.setAttribute("aria-label", "Campus location")
}

function MapUnavailable() {
  return (
    <div className="flex h-64 items-center justify-center rounded-lg bg-muted/40 px-4 text-center text-sm text-muted-foreground ring-1 ring-foreground/10">
      {MAP_UNAVAILABLE_MESSAGE}
    </div>
  )
}

export function CampusAddressSearch({
  onSelect,
}: {
  onSelect: (selection: LocationSelection) => void
}) {
  const token = mapboxAccessToken()
  if (!token) return null

  return (
    <div className="[&_mapbox-search-box]:block [&_mapbox-search-box]:w-full">
      <SearchBox
        accessToken={token}
        placeholder="Search for an address"
        onRetrieve={(response) => {
          const selection = selectionFromRetrieve(response)
          if (selection) onSelect(selection)
        }}
      />
    </div>
  )
}

export function CampusLocationMap({
  latitude,
  longitude,
  onChange,
}: {
  latitude: string
  longitude: string
  onChange: (latitude: string, longitude: string) => void
}) {
  const token = mapboxAccessToken()
  const containerRef = React.useRef<HTMLDivElement>(null)
  const mapRef = React.useRef<mapboxgl.Map | null>(null)
  const markerRef = React.useRef<mapboxgl.Marker | null>(null)
  const onChangeRef = React.useRef(onChange)
  const [ready, setReady] = React.useState(false)

  onChangeRef.current = onChange

  const lat = coordinate(latitude)
  const lng = coordinate(longitude)
  const hasPoint = lat !== null && lng !== null

  React.useEffect(() => {
    if (!token || !containerRef.current) return
    const container = containerRef.current
    let cancelled = false
    let map: mapboxgl.Map | undefined

    ;(async () => {
      const mapbox = (await import("mapbox-gl")).default
      await import("mapbox-gl/dist/mapbox-gl.css")
      if (cancelled) return
      mapbox.accessToken = token
      map = new mapbox.Map({
        container,
        style: "mapbox://styles/mapbox/streets-v12",
        center: CAPE_TOWN,
        zoom: 11,
      })
      map.addControl(
        new mapbox.NavigationControl({ showCompass: false }),
        "top-right"
      )
      mapRef.current = map
      map.on("load", () => {
        map?.resize()
        if (!cancelled) setReady(true)
      })
    })()

    return () => {
      cancelled = true
      setReady(false)
      markerRef.current?.remove()
      markerRef.current = null
      map?.remove()
      mapRef.current = null
    }
  }, [token])

  React.useEffect(() => {
    const map = mapRef.current
    if (!ready || !map || !hasPoint || lat === null || lng === null) return
    let cancelled = false

    ;(async () => {
      const mapbox = (await import("mapbox-gl")).default
      if (cancelled || mapRef.current !== map) return

      const marker = markerRef.current
      if (marker) {
        const current = marker.getLngLat()
        if (
          Math.abs(current.lng - lng) > 0.0000005 ||
          Math.abs(current.lat - lat) > 0.0000005
        ) {
          marker.setLngLat([lng, lat])
        }
        labelMarker(marker)
      } else {
        const created = new mapbox.Marker({ draggable: true })
          .setLngLat([lng, lat])
          .addTo(map)
        labelMarker(created)
        created.on("dragend", () => {
          const position = created.getLngLat()
          onChangeRef.current(
            roundCoordinate(position.lat),
            roundCoordinate(position.lng)
          )
        })
        markerRef.current = created
      }

      map.easeTo({
        center: [lng, lat],
        zoom: Math.max(map.getZoom(), STREET_ZOOM),
      })
    })()

    return () => {
      cancelled = true
    }
  }, [ready, hasPoint, lat, lng])

  if (!token) return <MapUnavailable />

  return (
    <div
      ref={containerRef}
      className="h-64 w-full overflow-hidden rounded-lg ring-1 ring-foreground/10"
    />
  )
}

type PlottedCampus = Campus & { latitude: number; longitude: number }

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
}

function popupHtml(campus: PlottedCampus) {
  const city = campus.city?.trim()
  return `<div><strong>${escapeHtml(campus.name)}</strong>${
    city ? `<div>${escapeHtml(city)}</div>` : ""
  }</div>`
}

function OverviewCanvas({ campuses }: { campuses: PlottedCampus[] }) {
  const router = useRouter()
  const containerRef = React.useRef<HTMLDivElement>(null)
  const routerRef = React.useRef(router)
  routerRef.current = router

  React.useEffect(() => {
    const container = containerRef.current
    const token = mapboxAccessToken()
    if (!container || !token) return
    let cancelled = false
    let map: mapboxgl.Map | undefined

    ;(async () => {
      const mapbox = (await import("mapbox-gl")).default
      await import("mapbox-gl/dist/mapbox-gl.css")
      if (cancelled) return
      mapbox.accessToken = token
      const first = campuses[0]
      map = new mapbox.Map({
        container,
        style: "mapbox://styles/mapbox/streets-v12",
        center: [first.longitude, first.latitude],
        zoom: STREET_ZOOM,
      })
      map.addControl(
        new mapbox.NavigationControl({ showCompass: false }),
        "top-right"
      )
      map.on("load", () => {
        if (!map || cancelled) return
        const bounds = new mapbox.LngLatBounds()
        for (const campus of campuses) {
          const position: [number, number] = [campus.longitude, campus.latitude]
          bounds.extend(position)
          const marker = new mapbox.Marker()
            .setLngLat(position)
            .setPopup(
              new mapbox.Popup({ offset: 24 }).setHTML(popupHtml(campus))
            )
            .addTo(map)
          const element = marker.getElement()
          element.style.cursor = "pointer"
          element.setAttribute("role", "link")
          element.setAttribute("aria-label", campus.name)
          element.addEventListener(
            "click",
            () => {
              routerRef.current.push(`/portal/campuses/${campus.id}`)
            },
            true
          )
        }
        if (campuses.length === 1) {
          map.setCenter([first.longitude, first.latitude])
          map.setZoom(STREET_ZOOM)
        } else {
          map.fitBounds(bounds, {
            padding: 48,
            maxZoom: STREET_ZOOM,
            duration: 0,
          })
        }
        map.resize()
      })
    })()

    return () => {
      cancelled = true
      map?.remove()
    }
  }, [campuses])

  return (
    <div
      ref={containerRef}
      className="h-80 w-full overflow-hidden rounded-xl ring-1 ring-foreground/10"
    />
  )
}

function MapNote({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-80 items-center justify-center rounded-xl bg-muted/40 px-4 text-center text-sm text-muted-foreground ring-1 ring-foreground/10">
      {children}
    </div>
  )
}

export function CampusOverviewMap({
  institutionId,
}: {
  institutionId: string
}) {
  const [campuses, setCampuses] = React.useState<Campus[] | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    let cancelled = false
    setCampuses(null)
    setError(null)
    fetchCampuses(institutionId)
      .then((rows) => {
        if (!cancelled) setCampuses(rows)
      })
      .catch((caught: unknown) => {
        if (!cancelled) {
          setError(
            caught instanceof Error ? caught.message : "Failed to load campuses"
          )
        }
      })
    return () => {
      cancelled = true
    }
  }, [institutionId])

  const plotted = React.useMemo(
    () =>
      (campuses ?? []).filter(
        (campus): campus is PlottedCampus =>
          typeof campus.latitude === "number" &&
          typeof campus.longitude === "number"
      ),
    [campuses]
  )

  if (error) return <MapNote>{error}</MapNote>
  if (!campuses) return <MapNote>Loading campuses...</MapNote>
  if (plotted.length === 0) {
    return <MapNote>No campuses have a location yet</MapNote>
  }
  if (!mapboxAccessToken()) return <MapNote>{MAP_UNAVAILABLE_MESSAGE}</MapNote>

  return <OverviewCanvas campuses={plotted} />
}
