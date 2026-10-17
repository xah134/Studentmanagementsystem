import { notFound } from "next/navigation"

import { PageTitle } from "@/components/page-title"
import { getUser, getUserName } from "@/components/users/users"

export default async function TeamMemberPage({
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
    <div className="flex flex-col gap-2">
      <PageTitle>{getUserName(user) || user.email}</PageTitle>
      <p>{user.email}</p>
    </div>
  )
}
