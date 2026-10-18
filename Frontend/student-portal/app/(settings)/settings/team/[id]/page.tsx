"use client"

import { useEffect, useState } from "react"
import { notFound, useParams } from "next/navigation"

import { PageTitle } from "@/components/page-title"
import { getUser, getUserName, type User } from "@/components/users/users"

export default function TeamMemberPage() {
  const params = useParams<{ id: string }>()
  const [user, setUser] = useState<User | null | undefined>(undefined)

  useEffect(() => {
    let cancelled = false
    getUser(params.id)
      .then((item) => {
        if (!cancelled) setUser(item ?? null)
      })
      .catch(() => {
        if (!cancelled) setUser(null)
      })
    return () => {
      cancelled = true
    }
  }, [params.id])

  if (user === undefined) {
    return <p className="text-sm text-muted-foreground">Loading user...</p>
  }
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
