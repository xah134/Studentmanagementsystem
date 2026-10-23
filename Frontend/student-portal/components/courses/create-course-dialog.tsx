"use client"

import * as React from "react"
import { toast } from "sonner"

import { fetchCampuses, type Campus } from "@/components/campuses/campuses"
import { fetchFaculties, type Faculty } from "@/components/faculties/faculties"
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
  createCourse,
  updateCourse,
  type CourseDetail,
  type CourseInput,
} from "./courses"

const selectClassName =
  "h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"

type FormState = {
  name: string
  code: string
  description: string
  facultyId: string
  campusId: string
}

const emptyForm: FormState = {
  name: "",
  code: "",
  description: "",
  facultyId: "",
  campusId: "",
}

function formFromCourse(course: CourseDetail): FormState {
  return {
    name: course.name,
    code: course.code ?? "",
    description: course.description ?? "",
    facultyId: course.facultyId,
    campusId: course.campusId ?? "",
  }
}

export function CreateCourseDialog({
  institutionId,
  course = null,
  open,
  onOpenChange,
  onSaved,
  showTrigger = false,
}: {
  institutionId: string
  course?: CourseDetail | null
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onSaved: () => void
  showTrigger?: boolean
}) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false)
  const [form, setForm] = React.useState<FormState>(emptyForm)
  const [faculties, setFaculties] = React.useState<Faculty[]>([])
  const [campuses, setCampuses] = React.useState<Campus[]>([])
  const [pending, setPending] = React.useState(false)
  const isControlled = open !== undefined
  const dialogOpen = isControlled ? open : uncontrolledOpen
  const editing = Boolean(course)

  function setDialogOpen(next: boolean) {
    if (!isControlled) setUncontrolledOpen(next)
    onOpenChange?.(next)
  }

  React.useEffect(() => {
    if (!dialogOpen) return
    setForm(course ? formFromCourse(course) : emptyForm)
  }, [dialogOpen, course])

  React.useEffect(() => {
    if (!dialogOpen) return
    const controller = new AbortController()
    fetchFaculties(institutionId, controller.signal)
      .then(setFaculties)
      .catch((error: unknown) => {
        if (controller.signal.aborted) return
        setFaculties([])
        toast.error(
          error instanceof Error ? error.message : "Failed to load faculties"
        )
      })
    return () => controller.abort()
  }, [dialogOpen, institutionId])

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

    if (!form.facultyId) {
      toast.error("Faculty is required")
      return
    }

    const input: CourseInput = {
      institutionId,
      facultyId: form.facultyId,
      name: form.name.trim(),
      code: form.code.trim(),
      description: form.description.trim(),
      campusId: form.campusId.trim() || null,
    }

    setPending(true)
    try {
      if (course) {
        await updateCourse(course.id, input)
        toast.success("Course updated")
      } else {
        await createCourse(input)
        toast.success("Course created")
      }
      setForm(emptyForm)
      setDialogOpen(false)
      onSaved()
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not save course"
      )
    } finally {
      setPending(false)
    }
  }

  const fieldId = course?.id ?? "new"

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      {showTrigger ? (
        <DialogTrigger render={<Button />}>Create course</DialogTrigger>
      ) : null}
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {editing ? "Edit course" : "Create course"}
          </DialogTitle>
          <DialogDescription>
            {editing
              ? "Update this course."
              : "Add a course for this institution."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit}>
          <Tabs defaultValue="details">
            <TabsList>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="placement">Placement</TabsTrigger>
            </TabsList>
            <TabsContent value="details">
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor={`${fieldId}-name`}>Name</FieldLabel>
                  <Input
                    id={`${fieldId}-name`}
                    placeholder="BSc Computer Science"
                    value={form.name}
                    onChange={(event) => update("name", event.target.value)}
                    required
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor={`${fieldId}-code`}>Code</FieldLabel>
                  <Input
                    id={`${fieldId}-code`}
                    placeholder="BSC-CS"
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
                    placeholder="Undergraduate computer science"
                    value={form.description}
                    onChange={(event) =>
                      update("description", event.target.value)
                    }
                  />
                </Field>
              </FieldGroup>
            </TabsContent>
            <TabsContent value="placement">
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor={`${fieldId}-faculty`}>Faculty</FieldLabel>
                  <select
                    id={`${fieldId}-faculty`}
                    className={selectClassName}
                    value={form.facultyId}
                    onChange={(event) => update("facultyId", event.target.value)}
                    required
                  >
                    <option value="">Select a faculty</option>
                    {faculties.map((faculty) => (
                      <option key={faculty.id} value={faculty.id}>
                        {faculty.name}
                      </option>
                    ))}
                  </select>
                </Field>
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
                  : "Create course"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
