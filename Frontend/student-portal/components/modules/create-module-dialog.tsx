"use client"

import * as React from "react"
import { toast } from "sonner"

import { fetchCourses, type Course } from "@/components/courses/courses"
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
  createModule,
  updateModule,
  type ModuleDetail,
  type ModuleInput,
} from "./modules"

const selectClassName =
  "h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"

type FormState = {
  name: string
  code: string
  description: string
  credits: string
  courseId: string
}

const emptyForm: FormState = {
  name: "",
  code: "",
  description: "",
  credits: "",
  courseId: "",
}

function formFromModule(moduleRow: ModuleDetail): FormState {
  return {
    name: moduleRow.name,
    code: moduleRow.code ?? "",
    description: moduleRow.description ?? "",
    credits:
      moduleRow.credits === null || moduleRow.credits === undefined
        ? ""
        : String(moduleRow.credits),
    courseId: moduleRow.courseId,
  }
}

function parseCreditsInput(value: string): number | null | "invalid" {
  const text = value.trim()
  if (!text) return null
  if (!/^\d+$/.test(text)) return "invalid"
  return Number(text)
}

export function CreateModuleDialog({
  institutionId,
  module: moduleRow = null,
  open,
  onOpenChange,
  onSaved,
  showTrigger = false,
}: {
  institutionId: string
  module?: ModuleDetail | null
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onSaved: () => void
  showTrigger?: boolean
}) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false)
  const [form, setForm] = React.useState<FormState>(emptyForm)
  const [courses, setCourses] = React.useState<Course[]>([])
  const [pending, setPending] = React.useState(false)
  const isControlled = open !== undefined
  const dialogOpen = isControlled ? open : uncontrolledOpen
  const editing = Boolean(moduleRow)

  function setDialogOpen(next: boolean) {
    if (!isControlled) setUncontrolledOpen(next)
    onOpenChange?.(next)
  }

  React.useEffect(() => {
    if (!dialogOpen) return
    setForm(moduleRow ? formFromModule(moduleRow) : emptyForm)
  }, [dialogOpen, moduleRow])

  React.useEffect(() => {
    if (!dialogOpen) return
    const controller = new AbortController()
    fetchCourses(institutionId, controller.signal)
      .then(setCourses)
      .catch((error: unknown) => {
        if (controller.signal.aborted) return
        setCourses([])
        toast.error(
          error instanceof Error ? error.message : "Failed to load courses"
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

    if (!form.courseId) {
      toast.error("Course is required")
      return
    }

    const credits = parseCreditsInput(form.credits)
    if (credits === "invalid") {
      toast.error("Credits must be a whole number")
      return
    }

    const input: ModuleInput = {
      institutionId,
      courseId: form.courseId,
      name: form.name.trim(),
      code: form.code.trim(),
      description: form.description.trim(),
      credits,
    }

    setPending(true)
    try {
      if (moduleRow) {
        await updateModule(moduleRow.id, input)
        toast.success("Module updated")
      } else {
        await createModule(input)
        toast.success("Module created")
      }
      setForm(emptyForm)
      setDialogOpen(false)
      onSaved()
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not save module"
      )
    } finally {
      setPending(false)
    }
  }

  const fieldId = moduleRow?.id ?? "new"

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      {showTrigger ? (
        <DialogTrigger render={<Button />}>Create module</DialogTrigger>
      ) : null}
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {editing ? "Edit module" : "Create module"}
          </DialogTitle>
          <DialogDescription>
            {editing
              ? "Update this module."
              : "Add a module for this institution."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit}>
          <Tabs defaultValue="details">
            <TabsList>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="course">Course</TabsTrigger>
            </TabsList>
            <TabsContent value="details">
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor={`${fieldId}-name`}>Name</FieldLabel>
                  <Input
                    id={`${fieldId}-name`}
                    placeholder="Introduction to Programming"
                    value={form.name}
                    onChange={(event) => update("name", event.target.value)}
                    required
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor={`${fieldId}-code`}>Code</FieldLabel>
                  <Input
                    id={`${fieldId}-code`}
                    placeholder="CS101"
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
                    placeholder="First-year programming"
                    value={form.description}
                    onChange={(event) =>
                      update("description", event.target.value)
                    }
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor={`${fieldId}-credits`}>Credits</FieldLabel>
                  <Input
                    id={`${fieldId}-credits`}
                    type="number"
                    min={0}
                    step={1}
                    placeholder="16"
                    value={form.credits}
                    onChange={(event) => update("credits", event.target.value)}
                  />
                </Field>
              </FieldGroup>
            </TabsContent>
            <TabsContent value="course">
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor={`${fieldId}-course`}>Course</FieldLabel>
                  <select
                    id={`${fieldId}-course`}
                    className={selectClassName}
                    value={form.courseId}
                    onChange={(event) => update("courseId", event.target.value)}
                    required
                  >
                    <option value="">Select a course</option>
                    {courses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.name}
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
                  : "Create module"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
