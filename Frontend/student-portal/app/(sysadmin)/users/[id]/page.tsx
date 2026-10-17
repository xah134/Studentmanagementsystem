import { notFound } from "next/navigation"

import { getUser, getUserName } from "@/components/users/users"

export default async function UserPage({
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
      <h1 className="text-3xl font-bold tracking-tight">
        {getUserName(user) || user.email}
      </h1>
      <p>{user.email}</p>
    </div>
  )
}
