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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs/tabs"

import {
  createCampus,
  updateCampus,
  type CampusDetail,
  type CampusInput,
} from "./campuses"

type FormState = {
  name: string
  description: string
  address: string
  city: string
  state: string
  zip: string
  latitude: string
  longitude: string
}

const emptyForm: FormState = {
  name: "",
  description: "",
  address: "",
  city: "",
  state: "",
  zip: "",
  latitude: "",
  longitude: "",
}

function formFromCampus(campus: CampusDetail): FormState {
  return {
    name: campus.name,
    description: campus.description ?? "",
    address: campus.address ?? "",
    city: campus.city ?? "",
    state: campus.state ?? "",
    zip: campus.zip ?? "",
    latitude: campus.latitude === null ? "" : String(campus.latitude),
    longitude: campus.longitude === null ? "" : String(campus.longitude),
  }
}

function numberOrNull(value: string): number | string | null {
  const trimmed = value.trim()
  if (!trimmed) return null
  const number = Number(trimmed)
  return Number.isFinite(number) ? number : trimmed
}

export function CreateCampusDialog({
  institutionId,
  campus = null,
  open,
  onOpenChange,
  onSaved,
  showTrigger = false,
}: {
  institutionId: string
  campus?: CampusDetail | null
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onSaved: () => void
  showTrigger?: boolean
}) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false)
  const [form, setForm] = React.useState<FormState>(emptyForm)
  const [pending, setPending] = React.useState(false)
  const isControlled = open !== undefined
  const dialogOpen = isControlled ? open : uncontrolledOpen
  const editing = Boolean(campus)

  function setDialogOpen(next: boolean) {
    if (!isControlled) setUncontrolledOpen(next)
    onOpenChange?.(next)
  }

  React.useEffect(() => {
    if (!dialogOpen) return
    setForm(campus ? formFromCampus(campus) : emptyForm)
  }, [dialogOpen, campus])

  function update(field: keyof FormState, value: string) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!form.name.trim()) {
      toast.error("Name is required")
      return
    }

    const input: CampusInput = {
      institutionId,
      name: form.name.trim(),
      description: form.description.trim(),
      address: form.address.trim(),
      city: form.city.trim(),
      state: form.state.trim(),
      zip: form.zip.trim(),
      latitude: numberOrNull(form.latitude),
      longitude: numberOrNull(form.longitude),
    }

    setPending(true)
    try {
      if (campus) {
        await updateCampus(campus.id, input)
        toast.success("Campus updated")
      } else {
        await createCampus(input)
        toast.success("Campus created")
      }
      setForm(emptyForm)
      setDialogOpen(false)
      onSaved()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save campus")
    } finally {
      setPending(false)
    }
  }

  const fieldId = campus?.id ?? "new"

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      {showTrigger ? (
        <DialogTrigger render={<Button />}>Create campus</DialogTrigger>
      ) : null}
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit campus" : "Create campus"}</DialogTitle>
          <DialogDescription>
            {editing
              ? "Update this campus."
              : "Add a campus for this institution."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit}>
          <Tabs defaultValue="details">
            <TabsList>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="address">Address</TabsTrigger>
              <TabsTrigger value="location">Location</TabsTrigger>
            </TabsList>
            <TabsContent value="details">
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor={`${fieldId}-name`}>Name</FieldLabel>
                  <Input
                    id={`${fieldId}-name`}
                    placeholder="Main campus"
                    value={form.name}
                    onChange={(event) => update("name", event.target.value)}
                    required
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor={`${fieldId}-description`}>
                    Description
                  </FieldLabel>
                  <Input
                    id={`${fieldId}-description`}
                    placeholder="City centre campus"
                    value={form.description}
                    onChange={(event) => update("description", event.target.value)}
                  />
                </Field>
              </FieldGroup>
            </TabsContent>
            <TabsContent value="address">
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor={`${fieldId}-address`}>Address</FieldLabel>
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
              </FieldGroup>
            </TabsContent>
            <TabsContent value="location">
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor={`${fieldId}-latitude`}>Latitude</FieldLabel>
                  <Input
                    id={`${fieldId}-latitude`}
                    placeholder="-33.9249"
                    value={form.latitude}
                    onChange={(event) => update("latitude", event.target.value)}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor={`${fieldId}-longitude`}>
                    Longitude
                  </FieldLabel>
                  <Input
                    id={`${fieldId}-longitude`}
                    placeholder="18.4241"
                    value={form.longitude}
                    onChange={(event) => update("longitude", event.target.value)}
                  />
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
                  : "Create campus"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
