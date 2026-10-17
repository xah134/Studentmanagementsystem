import { notFound } from "next/navigation"

import { getInstitution, institutionTypeLabels } from "@/components/institutions/institutions"
import { PageTitle } from "@/components/page-title"

export default async function InstitutionPage({
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
    <div className="flex flex-col gap-2">
      <PageTitle>{institution.name}</PageTitle>
      <p className="text-muted-foreground">
        {[institutionTypeLabels[institution.institutionType], institution.city]
          .filter(Boolean)
          .join(" · ")}
      </p>
      <p>{institution.email}</p>
    </div>
  )
}
