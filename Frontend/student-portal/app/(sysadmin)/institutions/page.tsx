"use client"

import * as React from "react"

import { CreateInstitutionDialog } from "@/components/institutions/create-institution-dialog"
import { InstitutionsTable } from "@/components/institutions/institutions-table"
import { PageTitle } from "@/components/page-title"

export default function InstitutionsPage() {
  const [refreshKey, setRefreshKey] = React.useState(0)

  return (
    <div className="flex flex-col gap-6">
      <PageTitle>Institutions</PageTitle>
      <div className="flex justify-end">
        <CreateInstitutionDialog
          onCreated={() => setRefreshKey((key) => key + 1)}
        />
      </div>
      <InstitutionsTable refreshKey={refreshKey} />
    </div>
  )
}
