import { notFound } from "next/navigation"

import { getInstitution, institutionTypeLabels } from "@/components/institutions/institutions"

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
      <h1 className="text-3xl font-bold tracking-tight">{institution.name}</h1>
      <p className="text-muted-foreground">
        {[institutionTypeLabels[institution.institutionType], institution.city]
          .filter(Boolean)
          .join(" · ")}
      </p>
      <p>{institution.email}</p>
    </div>
  )
}
