import { notFound } from "next/navigation"

import { getInstitution } from "@/components/institutions/institutions"
import { PageTitle } from "@/components/page-title"

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

  return <PageTitle>{`Edit ${institution.name}`}</PageTitle>
}
