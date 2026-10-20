import { InstitutionCountKpi } from "@/components/dashboard/institution-count-kpi"
import { UserCountKpi } from "@/components/dashboard/user-count-kpi"
import { PageTitle } from "@/components/page-title"

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <PageTitle>Dashboard</PageTitle>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <InstitutionCountKpi />
        <UserCountKpi />
      </div>
    </div>
  )
}
