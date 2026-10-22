"use client"

import * as React from "react"
import { toast } from "sonner"

import { fetchCampuses, type Campus } from "@/components/campuses/campuses"
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

import {
  createFaculty,
  updateFaculty,
  type FacultyDetail,
  type FacultyInput,
} from "./faculties"

const selectClassName =
  "h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"

type FormState = {
  name: string
  code: string
  description: string
  campusId: string
}

const emptyForm: FormState = {
  name: "",
  code: "",
  description: "",
  campusId: "",
}

function formFromFaculty(faculty: FacultyDetail): FormState {
  return {
    name: faculty.name,
    code: faculty.code ?? "",
    description: faculty.description ?? "",
    campusId: faculty.campusId ?? "",
  }
}

export function CreateFacultyDialog({
  institutionId,
  faculty = null,
  open,
  onOpenChange,
  onSaved,
  showTrigger = false,
}: {
  institutionId: string
  faculty?: FacultyDetail | null
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
  const editing = Boolean(faculty)

  function setDialogOpen(next: boolean) {
    if (!isControlled) setUncontrolledOpen(next)
    onOpenChange?.(next)
  }

  React.useEffect(() => {
    if (!dialogOpen) return
    setForm(faculty ? formFromFaculty(faculty) : emptyForm)
  }, [dialogOpen, faculty])

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

  function update(field: keyof FormState, value: string) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!form.name.trim()) {
      toast.error("Name is required")
      return
    }

    const input: FacultyInput = {
      institutionId,
      name: form.name.trim(),
      code: form.code.trim(),
      description: form.description.trim(),
      campusId: form.campusId.trim() || null,
    }

    setPending(true)
    try {
      if (faculty) {
        await updateFaculty(faculty.id, input)
        toast.success("Faculty updated")
      } else {
        await createFaculty(input)
        toast.success("Faculty created")
      }
      setForm(emptyForm)
      setDialogOpen(false)
      onSaved()
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not save faculty"
      )
    } finally {
      setPending(false)
    }
  }

  const fieldId = faculty?.id ?? "new"

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      {showTrigger ? (
        <DialogTrigger render={<Button />}>Create faculty</DialogTrigger>
      ) : null}
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {editing ? "Edit faculty" : "Create faculty"}
          </DialogTitle>
          <DialogDescription>
            {editing
              ? "Update this faculty."
              : "Add a faculty for this institution."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit}>
          <Tabs defaultValue="details">
            <TabsList>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="campus">Campus</TabsTrigger>
            </TabsList>
            <TabsContent value="details">
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor={`${fieldId}-name`}>Name</FieldLabel>
                  <Input
                    id={`${fieldId}-name`}
                    placeholder="Faculty of Science"
                    value={form.name}
                    onChange={(event) => update("name", event.target.value)}
                    required
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor={`${fieldId}-code`}>Code</FieldLabel>
                  <Input
                    id={`${fieldId}-code`}
                    placeholder="SCI"
                    value={form.code}
                    onChange={(event) => update("code", event.target.value)}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor={`${fieldId}-description`}>
                    Description
                  </FieldLabel>
                  <Input
                    id={`${fieldId}-description`}
                    placeholder="Natural sciences"
                    value={form.description}
                    onChange={(event) =>
                      update("description", event.target.value)
                    }
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
                    value={form.campusId}
                    onChange={(event) => update("campusId", event.target.value)}
                  >
                    <option value="">Whole institution</option>
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
                  : "Create faculty"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
