import { UsersTable } from "@/components/users/users-table"

export default function UsersPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight">Users</h1>
      <UsersTable />
    </div>
  )
}
