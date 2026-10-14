"use client"

import type { LucideIcon } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card/card"

export function KpiWidget({
  label,
  value,
  description,
  icon: Icon,
}: {
  label: string
  value: number | null
  description?: string
  icon?: LucideIcon
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {Icon ? <Icon className="size-4" /> : null}
          {label}
        </CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-semibold tracking-tight">
          {value === null ? "—" : value.toLocaleString()}
        </p>
      </CardContent>
    </Card>
  )
}
