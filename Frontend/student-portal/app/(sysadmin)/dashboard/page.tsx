import { InstitutionCountKpi } from "@/components/dashboard/institution-count-kpi"
import { UserCountKpi } from "@/components/dashboard/user-count-kpi"
import { PageTitle } from "@/components/page-title"

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <PageTitle>Dashboard</PageTitle>
      <div className="grid gap-4 sm:grid-cols-2">
        <InstitutionCountKpi />
        <UserCountKpi />
      </div>
    </div>
  )
}
