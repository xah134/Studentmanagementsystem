"use client"

import { useEffect, useState } from "react"
import { Users } from "lucide-react"

import { KpiWidget } from "@/components/kpi/kpi-widget"
import { apiUrl, authHeaders } from "@/lib/api"

export function UserCountKpi() {
  const [value, setValue] = useState<number | null>(null)
  const [description, setDescription] = useState("Registered users")

  useEffect(() => {
    fetch(`${apiUrl()}/users?page=1&pageSize=1`, {
      headers: authHeaders(),
    })
      .then(async (response) => {
        const payload = await response.json().catch(() => ({}))
        if (!response.ok) {
          throw new Error(payload.message || "Failed to load users count")
        }
        return payload
      })
      .then((payload) => {
        if (typeof payload?.summary?.totalCount !== "number") {
          throw new Error("Invalid response structure")
        }
        setValue(payload.summary.totalCount)
      })
      .catch((error: unknown) => {
        setDescription(
          error instanceof Error ? error.message : "Error loading count"
        )
      })
  }, [])

  return (
    <KpiWidget
      label="Users"
      value={value}
      description={description}
      icon={Users}
    />
  )
}
