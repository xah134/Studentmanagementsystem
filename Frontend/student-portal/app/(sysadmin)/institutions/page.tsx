"use client"

import * as React from "react"

import { CreateInstitutionDialog } from "@/components/institutions/create-institution-dialog"
import { InstitutionsTable } from "@/components/institutions/institutions-table"

export default function InstitutionsPage() {
  const [refreshKey, setRefreshKey] = React.useState(0)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Institutions</h1>
        <CreateInstitutionDialog
          onCreated={() => setRefreshKey((key) => key + 1)}
        />
      </div>
      <InstitutionsTable refreshKey={refreshKey} />
    </div>
  )
}
