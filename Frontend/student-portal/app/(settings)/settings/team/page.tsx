"use client"

import * as React from "react"

import { CreateUserDialog } from "@/components/users/create-user-dialog"
import { UsersTable } from "@/components/users/users-table"

export default function TeamSettingsPage() {
  const [refreshKey, setRefreshKey] = React.useState(0)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Team</h1>
        <CreateUserDialog onCreated={() => setRefreshKey((key) => key + 1)} />
      </div>
      <UsersTable refreshKey={refreshKey} />
    </div>
  )
}
