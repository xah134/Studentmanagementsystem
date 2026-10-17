import { notFound } from "next/navigation"

import { PageTitle } from "@/components/page-title"
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

  return <PageTitle>{`Edit ${getUserName(user) || user.email}`}</PageTitle>
}
