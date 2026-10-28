"use client"

import * as React from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/Button/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/Dialog/dialog"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/Field/field"
import { Input } from "@/components/ui/Input/input"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/Tabs/tabs"
import { fetchCampuses, type Campus } from "@/components/campuses/campuses"

import {
  createLecturer,
  genderLabels,
  updateLecturer,
  verificationStatusLabels,
  type Gender,
  type LecturerDetail,
  type LecturerInput,
  type VerificationStatus,
} from "./lecturers"

const selectClassName =
  "h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"

type FormState = Omit<LecturerInput, "institutionId">

const emptyForm: FormState = {
  firstName: "",
  lastName: "",
  phone: "",
  gender: "",
  dateOfBirth: "",
  nationality: "",
  foreignNational: false,
  verificationStatus: "PENDING",
  idNumber: "",
  passportNumber: "",
  address: "",
  city: "",
  state: "",
  zip: "",
  country: "",
  siteId: "",
}

function formFromLecturer(lecturer: LecturerDetail): FormState {
  return {
    firstName: lecturer.firstName ?? "",
    lastName: lecturer.lastName ?? "",
    phone: lecturer.phone ?? "",
    gender: lecturer.gender ?? "",
    dateOfBirth: lecturer.dateOfBirth ?? "",
    nationality: lecturer.nationality ?? "",
    foreignNational: lecturer.foreignNational,
    verificationStatus: lecturer.verificationStatus,
    idNumber: lecturer.idNumber ?? "",
    passportNumber: lecturer.passportNumber ?? "",
    address: lecturer.address ?? "",
    city: lecturer.city ?? "",
    state: lecturer.state ?? "",
    zip: lecturer.zip ?? "",
    country: lecturer.country ?? "",
    siteId: lecturer.siteId ?? "",
  }
}

export function CreateLecturerDialog({
  institutionId,
  lecturer = null,
  open,
  onOpenChange,
  onSaved,
  showTrigger = false,
}: {
  institutionId: string
  lecturer?: LecturerDetail | null
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onSaved: () => void
  showTrigger?: boolean
}) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false)
  const [form, setForm] = React.useState<FormState>(emptyForm)
  const [campuses, setCampuses] = React.useState<Campus[]>([])
  const [pending, setPending] = React.useState(false)
  const isControlled = open !== undefined
  const dialogOpen = isControlled ? open : uncontrolledOpen
  const editing = Boolean(lecturer)

  function setDialogOpen(next: boolean) {
    if (!isControlled) setUncontrolledOpen(next)
    onOpenChange?.(next)
  }

  React.useEffect(() => {
    if (!dialogOpen) return
    setForm(lecturer ? formFromLecturer(lecturer) : emptyForm)
  }, [dialogOpen, lecturer])

  React.useEffect(() => {
    if (!dialogOpen) return
    const controller = new AbortController()

    fetchCampuses(institutionId, controller.signal)
      .then(setCampuses)
      .catch((error: unknown) => {
        if (controller.signal.aborted) return
        setCampuses([])
        toast.error(
          error instanceof Error ? error.message : "Failed to load campuses"
        )
      })

    return () => controller.abort()
  }, [dialogOpen, institutionId])

  function update<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!form.firstName.trim() || !form.lastName.trim()) {
      toast.error("First and last name are required")
      return
    }

    const input: LecturerInput = {
      institutionId,
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      phone: form.phone.trim(),
      gender: form.gender,
      dateOfBirth: form.dateOfBirth,
      nationality: form.nationality.trim(),
      foreignNational: form.foreignNational,
      verificationStatus: form.verificationStatus,
      idNumber: form.idNumber.trim(),
      passportNumber: form.passportNumber.trim(),
      address: form.address.trim(),
      city: form.city.trim(),
      state: form.state.trim(),
      zip: form.zip.trim(),
      country: form.country.trim(),
      siteId: form.siteId,
    }

    setPending(true)
    try {
      if (lecturer) {
        await updateLecturer(lecturer.id, input)
        toast.success("Lecturer updated")
      } else {
        await createLecturer(input)
        toast.success("Lecturer created")
      }
      setForm(emptyForm)
      setDialogOpen(false)
      onSaved()
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not save lecturer"
      )
    } finally {
      setPending(false)
    }
  }

  const fieldId = lecturer?.id ?? "new-lecturer"

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      {showTrigger ? (
        <DialogTrigger render={<Button />}>Create lecturer</DialogTrigger>
      ) : null}
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {editing ? "Edit lecturer" : "Create lecturer"}
          </DialogTitle>
          <DialogDescription>
            {editing
              ? "Update this lecturer's profile."
              : "Add a lecturer to this institution."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit}>
          <Tabs defaultValue="profile">
            <TabsList>
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="identity">Identity</TabsTrigger>
              <TabsTrigger value="address">Address</TabsTrigger>
              <TabsTrigger value="campus">Campus</TabsTrigger>
            </TabsList>
            <TabsContent value="profile">
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor={`${fieldId}-firstName`}>
                    First name
                  </FieldLabel>
                  <Input
                    id={`${fieldId}-firstName`}
                    placeholder="Sipho"
                    value={form.firstName}
                    onChange={(event) =>
                      update("firstName", event.target.value)
                    }
                    required
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor={`${fieldId}-lastName`}>
                    Last name
                  </FieldLabel>
                  <Input
                    id={`${fieldId}-lastName`}
                    placeholder="Mabaso"
                    value={form.lastName}
                    onChange={(event) =>
                      update("lastName", event.target.value)
                    }
                    required
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor={`${fieldId}-phone`}>Phone</FieldLabel>
                  <Input
                    id={`${fieldId}-phone`}
                    placeholder="+27 21 000 0000"
                    value={form.phone}
                    onChange={(event) => update("phone", event.target.value)}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor={`${fieldId}-gender`}>Gender</FieldLabel>
                  <select
                    id={`${fieldId}-gender`}
                    className={selectClassName}
                    value={form.gender}
                    onChange={(event) =>
                      update("gender", event.target.value as Gender | "")
                    }
                  >
                    <option value="">Not specified</option>
                    {(Object.keys(genderLabels) as Gender[]).map((gender) => (
                      <option key={gender} value={gender}>
                        {genderLabels[gender]}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field>
                  <FieldLabel htmlFor={`${fieldId}-dob`}>
                    Date of birth
                  </FieldLabel>
                  <Input
                    id={`${fieldId}-dob`}
                    type="date"
                    value={form.dateOfBirth}
                    onChange={(event) =>
                      update("dateOfBirth", event.target.value)
                    }
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor={`${fieldId}-nationality`}>
                    Nationality
                  </FieldLabel>
                  <Input
                    id={`${fieldId}-nationality`}
                    placeholder="South African"
                    value={form.nationality}
                    onChange={(event) =>
                      update("nationality", event.target.value)
                    }
                  />
                </Field>
                <Field>
                  <div className="flex items-center gap-2">
                    <input
                      id={`${fieldId}-foreign`}
                      type="checkbox"
                      className="size-4"
                      checked={form.foreignNational}
                      onChange={(event) =>
                        update("foreignNational", event.target.checked)
                      }
                    />
                    <FieldLabel htmlFor={`${fieldId}-foreign`}>
                      Foreign national
                    </FieldLabel>
                  </div>
                </Field>
                <Field>
                  <FieldLabel htmlFor={`${fieldId}-status`}>
                    Verification status
                  </FieldLabel>
                  <select
                    id={`${fieldId}-status`}
                    className={selectClassName}
                    value={form.verificationStatus}
                    onChange={(event) =>
                      update(
                        "verificationStatus",
                        event.target.value as VerificationStatus
                      )
                    }
                  >
                    {(
                      Object.keys(
                        verificationStatusLabels
                      ) as VerificationStatus[]
                    ).map((status) => (
                      <option key={status} value={status}>
                        {verificationStatusLabels[status]}
                      </option>
                    ))}
                  </select>
                </Field>
              </FieldGroup>
            </TabsContent>
            <TabsContent value="identity">
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor={`${fieldId}-id-number`}>
                    ID number
                  </FieldLabel>
                  <Input
                    id={`${fieldId}-id-number`}
                    placeholder="0000000000000"
                    value={form.idNumber}
                    onChange={(event) => update("idNumber", event.target.value)}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor={`${fieldId}-passport`}>
                    Passport number
                  </FieldLabel>
                  <Input
                    id={`${fieldId}-passport`}
                    placeholder="A12345678"
                    value={form.passportNumber}
                    onChange={(event) =>
                      update("passportNumber", event.target.value)
                    }
                  />
                </Field>
              </FieldGroup>
            </TabsContent>
            <TabsContent value="address">
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor={`${fieldId}-address`}>
                    Address
                  </FieldLabel>
                  <Input
                    id={`${fieldId}-address`}
                    placeholder="12 Main Road"
                    value={form.address}
                    onChange={(event) => update("address", event.target.value)}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor={`${fieldId}-city`}>City</FieldLabel>
                  <Input
                    id={`${fieldId}-city`}
                    placeholder="Cape Town"
                    value={form.city}
                    onChange={(event) => update("city", event.target.value)}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor={`${fieldId}-state`}>State</FieldLabel>
                  <Input
                    id={`${fieldId}-state`}
                    placeholder="Western Cape"
                    value={form.state}
                    onChange={(event) => update("state", event.target.value)}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor={`${fieldId}-zip`}>Zip</FieldLabel>
                  <Input
                    id={`${fieldId}-zip`}
                    placeholder="8001"
                    value={form.zip}
                    onChange={(event) => update("zip", event.target.value)}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor={`${fieldId}-country`}>
                    Country
                  </FieldLabel>
                  <Input
                    id={`${fieldId}-country`}
                    placeholder="South Africa"
                    value={form.country}
                    onChange={(event) => update("country", event.target.value)}
                  />
                </Field>
              </FieldGroup>
            </TabsContent>
            <TabsContent value="campus">
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor={`${fieldId}-campus`}>Campus</FieldLabel>
                  <select
                    id={`${fieldId}-campus`}
                    className={selectClassName}
                    value={form.siteId}
                    onChange={(event) => update("siteId", event.target.value)}
                  >
                    <option value="">Unassigned</option>
                    {campuses.map((campus) => (
                      <option key={campus.id} value={campus.id}>
                        {campus.name}
                      </option>
                    ))}
                  </select>
                </Field>
              </FieldGroup>
            </TabsContent>
          </Tabs>
          <DialogFooter className="mt-4">
            <Button type="submit" disabled={pending}>
              {pending
                ? editing
                  ? "Saving..."
                  : "Creating..."
                : editing
                  ? "Save"
                  : "Create lecturer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
