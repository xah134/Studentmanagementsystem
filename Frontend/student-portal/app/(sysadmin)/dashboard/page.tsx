"use client"

import { useEffect, useState } from "react"
import { Building2 } from "lucide-react"

import { KpiWidget } from "@/components/kpi/kpi-widget"

export default function DashboardPage() {
  const [value, setValue] = useState<number | null>(null)
  const [description, setDescription] = useState("Registered institutions")

  useEffect(() => {
    const apiUrl =
      process.env.NEXT_PUBLIC_STUDENT_PORTAL_API_URL ||
      "http://localhost:5156/api"

    fetch(`${apiUrl}/institutions?page=1&pageSize=1`)
      .then(async (response) => {
        const payload = await response.json().catch(() => ({}))
        if (!response.ok) {
          throw new Error(payload.message || "Failed to load institutions count")
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
    <div className="space-y-6 p-6">
      <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiWidget
          label="Institutions"
          value={value}
          description={description}
          icon={Building2}
        />
      </div>
    </div>
  )
}
