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

import { apiUrl } from "@/lib/api"

import {
  institutionTypeLabels,
  type Institution,
  type InstitutionType,
} from "./institutions"

const selectClassName =
  "h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"

type FormState = {
  name: string
  email: string
  institutionType: InstitutionType
  phone: string
  city: string
  country: string
  website: string
}

type TabValue = "details" | "contact"

const emptyForm: FormState = {
  name: "",
  email: "",
  institutionType: "UNIVERSITY",
  phone: "",
  city: "",
  country: "",
  website: "",
}

function formFromInstitution(institution?: Institution | null): FormState {
  if (!institution) return emptyForm
  return {
    name: institution.name,
    email: institution.email,
    institutionType: institution.institutionType,
    phone: institution.phone ?? "",
    city: institution.city ?? "",
    country: institution.country ?? "",
    website: institution.website ?? "",
  }
}

type CreateInstitutionDialogProps = {
  // When set, the dialog edits this institution instead of creating one.
  institution?: Institution | null
  // Pass open/onOpenChange to control the dialog from outside (edit from a row).
  open?: boolean
  onOpenChange?: (open: boolean) => void
  // Hide the "Create institution" button when the parent opens the dialog.
  showTrigger?: boolean
  onSaved: () => void
}

export function CreateInstitutionDialog({
  institution = null,
  open,
  onOpenChange,
  showTrigger = true,
  onSaved,
}: CreateInstitutionDialogProps) {
  const [internalOpen, setInternalOpen] = React.useState(false)
  const isOpen = open ?? internalOpen

  function setOpen(next: boolean) {
    if (open === undefined) setInternalOpen(next)
    onOpenChange?.(next)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      {showTrigger ? (
        <DialogTrigger render={<Button />}>Create institution</DialogTrigger>
      ) : null}
      <DialogContent>
        {/* The popup unmounts when closed, so the form starts fresh each time. */}
        <InstitutionForm
          institution={institution}
          onSaved={() => {
            setOpen(false)
            onSaved()
          }}
        />
      </DialogContent>
    </Dialog>
  )
}

function InstitutionForm({
  institution,
  onSaved,
}: {
  institution: Institution | null
  onSaved: () => void
}) {
  const isEdit = institution !== null
  const [form, setForm] = React.useState<FormState>(() =>
    formFromInstitution(institution)
  )
  const [tab, setTab] = React.useState<TabValue>("details")
  const [pending, setPending] = React.useState(false)

  function update(field: keyof FormState, value: string) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    // Required fields all live on Details; jump back so the problem is visible.
    if (!form.name.trim() || !form.email.trim()) {
      setTab("details")
      toast.error(
        !form.name.trim() ? "Name is required" : "Email is required"
      )
      return
    }

    setPending(true)

    try {
      const response = await fetch(
        isEdit
          ? `${apiUrl()}/institutions/${institution.id}`
          : `${apiUrl()}/institutions`,
        {
          method: isEdit ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.name.trim(),
            email: form.email.trim(),
            institutionType: form.institutionType,
            phone: form.phone.trim(),
            city: form.city.trim(),
            country: form.country.trim(),
            website: form.website.trim(),
          }),
        }
      )
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) {
        toast.error(
          payload.message ||
            (isEdit ? "Could not update institution" : "Could not create institution")
        )
        return
      }

      toast.success(isEdit ? "Institution updated" : "Institution created")
      onSaved()
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : isEdit
            ? "Could not update institution"
            : "Could not create institution"
      )
    } finally {
      setPending(false)
    }
  }

  const title = isEdit ? "Edit institution" : "Create institution"

  return (
    <>
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>
          {isEdit
            ? "Update this institution's details."
            : "Add a registered institution."}
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={onSubmit} noValidate>
        <FieldGroup>
          <Tabs value={tab} onValueChange={(value) => setTab(value as TabValue)}>
            <TabsList>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="contact">Contact</TabsTrigger>
            </TabsList>
            <TabsContent value="details">
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="institution-name">Name</FieldLabel>
                  <Input
                    id="institution-name"
                    placeholder="Northfield University"
                    value={form.name}
                    onChange={(event) => update("name", event.target.value)}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="institution-email">Email</FieldLabel>
                  <Input
                    id="institution-email"
                    type="email"
                    placeholder="office@northfield.edu"
                    value={form.email}
                    onChange={(event) => update("email", event.target.value)}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="institution-type">Type</FieldLabel>
                  <select
                    id="institution-type"
                    className={selectClassName}
                    value={form.institutionType}
                    onChange={(event) =>
                      update("institutionType", event.target.value)
                    }
                  >
                    {(Object.keys(institutionTypeLabels) as InstitutionType[]).map(
                      (type) => (
                        <option key={type} value={type}>
                          {institutionTypeLabels[type]}
                        </option>
                      )
                    )}
                  </select>
                </Field>
              </FieldGroup>
            </TabsContent>
            <TabsContent value="contact">
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="institution-phone">Phone</FieldLabel>
                  <Input
                    id="institution-phone"
                    placeholder="+27 21 000 0000"
                    value={form.phone}
                    onChange={(event) => update("phone", event.target.value)}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="institution-city">City</FieldLabel>
                  <Input
                    id="institution-city"
                    placeholder="Cape Town"
                    value={form.city}
                    onChange={(event) => update("city", event.target.value)}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="institution-country">Country</FieldLabel>
                  <Input
                    id="institution-country"
                    placeholder="South Africa"
                    value={form.country}
                    onChange={(event) => update("country", event.target.value)}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="institution-website">Website</FieldLabel>
                  <Input
                    id="institution-website"
                    placeholder="https://northfield.edu"
                    value={form.website}
                    onChange={(event) => update("website", event.target.value)}
                  />
                </Field>
              </FieldGroup>
            </TabsContent>
          </Tabs>
          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending
                ? isEdit
                  ? "Saving..."
                  : "Creating..."
                : isEdit
                  ? "Save"
                  : "Create institution"}
            </Button>
          </DialogFooter>
        </FieldGroup>
      </form>
    </>
  )
}
