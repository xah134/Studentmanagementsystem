"use client"

import * as React from "react"

import { PageTitle } from "@/components/page-title"
import { CreateUserDialog } from "@/components/users/create-user-dialog"
import { UsersTable } from "@/components/users/users-table"

export default function TeamSettingsPage() {
  const [refreshKey, setRefreshKey] = React.useState(0)

  return (
    <div className="flex flex-col gap-6">
      <PageTitle>Team</PageTitle>
      <div className="flex justify-end">
        <CreateUserDialog onCreated={() => setRefreshKey((key) => key + 1)} />
      </div>
      <UsersTable refreshKey={refreshKey} />
    </div>
  )
}
