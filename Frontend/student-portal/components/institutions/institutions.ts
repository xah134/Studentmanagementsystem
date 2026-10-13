export type InstitutionType =
  | "UNIVERSITY"
  | "COLLEGE"
  | "HIGH_SCHOOL"
  | "PRIMARY_SCHOOL"
  | "KINDERGARTEN"
  | "OTHER"

export type Institution = {
  id: string
  name: string
  email: string
  institutionType: InstitutionType
  city: string
  isActive: boolean
}

export const institutionTypeLabels: Record<InstitutionType, string> = {
  UNIVERSITY: "University",
  COLLEGE: "College",
  HIGH_SCHOOL: "High school",
  PRIMARY_SCHOOL: "Primary school",
  KINDERGARTEN: "Kindergarten",
  OTHER: "Other",
}

export const institutions: Institution[] = [
  {
    id: "northfield-university",
    name: "Northfield University",
    email: "office@northfield.example",
    institutionType: "UNIVERSITY",
    city: "Cape Town",
    isActive: true,
  },
  {
    id: "harbor-college",
    name: "Harbor College",
    email: "hello@harbor.example",
    institutionType: "COLLEGE",
    city: "Durban",
    isActive: true,
  },
  {
    id: "cedar-high",
    name: "Cedar High",
    email: "admin@cedar.example",
    institutionType: "HIGH_SCHOOL",
    city: "Johannesburg",
    isActive: false,
  },
]

export function getInstitution(id: string) {
  return institutions.find((institution) => institution.id === id)
}
