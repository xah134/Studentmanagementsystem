import { notFound } from "next/navigation"

import { getUser, getUserName } from "@/components/users/users"

export default async function EditTeamMemberPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const user = await getUser(id)

  if (!user) {
    notFound()
  }

  return (
    <h1 className="text-3xl font-bold tracking-tight">
      Edit {getUserName(user) || user.email}
    </h1>
  )
}
