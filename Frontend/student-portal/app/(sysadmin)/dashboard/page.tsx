import { InstitutionCountKpi } from '@/components/dashboard/institution-count-kpi';

export default function DashboardPage() {
  return (
    <div className="space-y-6 p-6">
      <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <InstitutionCountKpi />
      </div>
    </div>
  );
}