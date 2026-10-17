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

import { institutionTypeLabels, type InstitutionType } from "./institutions"

const API_URL =
  process.env.NEXT_PUBLIC_STUDENT_PORTAL_API_URL || "http://localhost:5156/api"

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

const emptyForm: FormState = {
  name: "",
  email: "",
  institutionType: "UNIVERSITY",
  phone: "",
  city: "",
  country: "",
  website: "",
}

export function CreateInstitutionDialog({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = React.useState(false)
  const [form, setForm] = React.useState<FormState>(emptyForm)
  const [pending, setPending] = React.useState(false)

  function update(field: keyof FormState, value: string) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true)

    try {
      const response = await fetch(`${API_URL}/institutions`, {
        method: "POST",
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
      })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) {
        toast.error(payload.message || "Could not create institution")
        return
      }

      toast.success("Institution created")
      setForm(emptyForm)
      setOpen(false)
      onCreated()
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not create institution"
      )
    } finally {
      setPending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>Create institution</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create institution</DialogTitle>
          <DialogDescription>Add a registered institution.</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="create-institution-name">Name</FieldLabel>
              <Input
                id="create-institution-name"
                placeholder="Northfield University"
                value={form.name}
                onChange={(event) => update("name", event.target.value)}
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="create-institution-email">Email</FieldLabel>
              <Input
                id="create-institution-email"
                type="email"
                placeholder="office@northfield.edu"
                value={form.email}
                onChange={(event) => update("email", event.target.value)}
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="create-institution-type">Type</FieldLabel>
              <select
                id="create-institution-type"
                className={selectClassName}
                value={form.institutionType}
                onChange={(event) => update("institutionType", event.target.value)}
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
            <Field>
              <FieldLabel htmlFor="create-institution-phone">Phone</FieldLabel>
              <Input
                id="create-institution-phone"
                placeholder="+27 21 000 0000"
                value={form.phone}
                onChange={(event) => update("phone", event.target.value)}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="create-institution-city">City</FieldLabel>
              <Input
                id="create-institution-city"
                placeholder="Cape Town"
                value={form.city}
                onChange={(event) => update("city", event.target.value)}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="create-institution-country">Country</FieldLabel>
              <Input
                id="create-institution-country"
                placeholder="South Africa"
                value={form.country}
                onChange={(event) => update("country", event.target.value)}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="create-institution-website">Website</FieldLabel>
              <Input
                id="create-institution-website"
                placeholder="https://northfield.edu"
                value={form.website}
                onChange={(event) => update("website", event.target.value)}
              />
            </Field>
            <DialogFooter>
              <Button type="submit" disabled={pending}>
                {pending ? "Creating..." : "Create institution"}
              </Button>
            </DialogFooter>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  )
}
