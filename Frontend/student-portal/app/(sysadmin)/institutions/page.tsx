import { InstitutionsTable } from "@/components/institutions/institutions-table"

export default function InstitutionsPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight">Institutions</h1>
      <InstitutionsTable />
    </div>
  )
}
