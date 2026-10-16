import { notFound } from "next/navigation"

import { getInstitution } from "@/components/institutions/institutions"

export default async function EditInstitutionPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const institution = await getInstitution(id)

  if (!institution) {
    notFound()
  }

  return (
    <h1 className="text-3xl font-bold tracking-tight">
      Edit {institution.name}
    </h1>
  )
}
