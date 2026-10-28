"use client"

import * as React from "react"
import { Trash2 } from "lucide-react"
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
import { fetchAcademicYears, type AcademicYear } from "@/components/calendar/calendar-api"
import { fetchCampuses, type Campus } from "@/components/campuses/campuses"
import { fetchCourses, type Course } from "@/components/courses/courses"
import { fetchFaculties, type Faculty } from "@/components/faculties/faculties"

import {
  createStudent,
  genderLabels,
  updateStudent,
  verificationStatusLabels,
  type Gender,
  type StudentDetail,
  type StudentInput,
  type VerificationStatus,
} from "./students"

const selectClassName =
  "h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"

type GuardianRow = {
  key: string
  name: string
  relationship: string
  phone: string
  email: string
}

type FormState = Omit<StudentInput, "institutionId" | "guardians"> & {
  guardians: GuardianRow[]
}

const emptyForm: FormState = {
  siteId: "",
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
  facultyId: "",
  courseId: "",
  academicYearId: "",
  guardians: [],
}

let guardianCounter = 0
function nextGuardianKey() {
  guardianCounter += 1
  return `guardian-${guardianCounter}`
}

function emptyGuardian(): GuardianRow {
  return {
    key: nextGuardianKey(),
    name: "",
    relationship: "",
    phone: "",
    email: "",
  }
}

function formFromStudent(student: StudentDetail): FormState {
  return {
    siteId: student.siteId,
    firstName: student.firstName ?? "",
    lastName: student.lastName ?? "",
    phone: student.phone ?? "",
    gender: student.gender ?? "",
    dateOfBirth: student.dateOfBirth ?? "",
    nationality: student.nationality ?? "",
    foreignNational: student.foreignNational,
    verificationStatus: student.verificationStatus,
    idNumber: student.idNumber ?? "",
    passportNumber: student.passportNumber ?? "",
    address: student.address ?? "",
    city: student.city ?? "",
    state: student.state ?? "",
    zip: student.zip ?? "",
    country: student.country ?? "",
    facultyId: "",
    courseId: "",
    academicYearId: "",
    guardians: student.guardians.map((guardian) => ({
      key: nextGuardianKey(),
      name: guardian.name,
      relationship: guardian.relationship,
      phone: guardian.phone ?? "",
      email: guardian.email ?? "",
    })),
  }
}

export function CreateStudentDialog({
  institutionId,
  student = null,
  open,
  onOpenChange,
  onSaved,
  showTrigger = false,
}: {
  institutionId: string
  student?: StudentDetail | null
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onSaved: () => void
  showTrigger?: boolean
}) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false)
  const [form, setForm] = React.useState<FormState>(emptyForm)
  const [campuses, setCampuses] = React.useState<Campus[]>([])
  const [faculties, setFaculties] = React.useState<Faculty[]>([])
  const [courses, setCourses] = React.useState<Course[]>([])
  const [years, setYears] = React.useState<AcademicYear[]>([])
  const [pending, setPending] = React.useState(false)
  const isControlled = open !== undefined
  const dialogOpen = isControlled ? open : uncontrolledOpen
  const editing = Boolean(student)

  function setDialogOpen(next: boolean) {
    if (!isControlled) setUncontrolledOpen(next)
    onOpenChange?.(next)
  }

  React.useEffect(() => {
    if (!dialogOpen) return
    setForm(student ? formFromStudent(student) : emptyForm)
  }, [dialogOpen, student])

  React.useEffect(() => {
    if (!dialogOpen) return
    const controller = new AbortController()

    Promise.all([
      fetchCampuses(institutionId, controller.signal),
      fetchFaculties(institutionId, controller.signal),
      fetchCourses(institutionId, controller.signal),
      fetchAcademicYears(institutionId, controller.signal),
    ])
      .then(([campusRows, facultyRows, courseRows, yearRows]) => {
        setCampuses(campusRows)
        setFaculties(facultyRows)
        setCourses(courseRows)
        setYears(yearRows)
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return
        setCampuses([])
        setFaculties([])
        setCourses([])
        setYears([])
        toast.error(
          error instanceof Error ? error.message : "Failed to load form options"
        )
      })

    return () => controller.abort()
  }, [dialogOpen, institutionId])

  const coursesForFaculty = courses.filter((course) => {
    if (form.facultyId && course.facultyId !== form.facultyId) return false
    if (form.siteId && course.campusId && course.campusId !== form.siteId) {
      return false
    }
    return true
  })

  function update<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  function updateGuardian(
    key: string,
    field: "name" | "relationship" | "phone" | "email",
    value: string
  ) {
    setForm((current) => ({
      ...current,
      guardians: current.guardians.map((guardian) =>
        guardian.key === key ? { ...guardian, [field]: value } : guardian
      ),
    }))
  }

  function addGuardian() {
    setForm((current) => ({
      ...current,
      guardians: [...current.guardians, emptyGuardian()],
    }))
  }

  function removeGuardian(key: string) {
    setForm((current) => ({
      ...current,
      guardians: current.guardians.filter((guardian) => guardian.key !== key),
    }))
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!form.firstName.trim() || !form.lastName.trim()) {
      toast.error("First and last name are required")
      return
    }
    if (!form.siteId) {
      toast.error("Campus is required")
      return
    }
    if (!editing) {
      if (!form.facultyId || !form.courseId || !form.academicYearId) {
        toast.error("Department, course, and academic year are required")
        return
      }
    }
    for (const guardian of form.guardians) {
      if (!guardian.name.trim()) {
        toast.error("Guardian name is required")
        return
      }
      if (!guardian.relationship.trim()) {
        toast.error("Guardian relationship is required")
        return
      }
    }

    const input: StudentInput = {
      institutionId,
      siteId: form.siteId,
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
      ...(editing
        ? {}
        : {
            facultyId: form.facultyId,
            courseId: form.courseId,
            academicYearId: form.academicYearId,
          }),
      guardians: form.guardians.map((guardian) => ({
        name: guardian.name.trim(),
        relationship: guardian.relationship.trim(),
        phone: guardian.phone.trim(),
        email: guardian.email.trim(),
      })),
    }

    setPending(true)
    try {
      if (student) {
        await updateStudent(student.id, input)
        toast.success("Student updated")
      } else {
        await createStudent(input)
        toast.success("Student created")
      }
      setForm(emptyForm)
      setDialogOpen(false)
      onSaved()
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not save student"
      )
    } finally {
      setPending(false)
    }
  }

  const fieldId = student?.id ?? "new-student"

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      {showTrigger ? (
        <DialogTrigger render={<Button />}>Create student</DialogTrigger>
      ) : null}
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit student" : "Create student"}</DialogTitle>
          <DialogDescription>
            {editing
              ? "Update this student's profile and guardians."
              : "Add a student with campus, department, course, and year."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit}>
          <Tabs defaultValue="profile">
            <TabsList>
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="identity">Identity</TabsTrigger>
              <TabsTrigger value="address">Address</TabsTrigger>
              <TabsTrigger value="campus">
                {editing ? "Campus" : "Enrollment"}
              </TabsTrigger>
              <TabsTrigger value="guardians">Guardians</TabsTrigger>
            </TabsList>
            <TabsContent value="profile">
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor={`${fieldId}-firstName`}>
                    First name
                  </FieldLabel>
                  <Input
                    id={`${fieldId}-firstName`}
                    placeholder="Amahle"
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
                    placeholder="Nkosi"
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
                    onChange={(event) => {
                      update("siteId", event.target.value)
                      update("courseId", "")
                    }}
                    required
                  >
                    <option value="">Select a campus</option>
                    {campuses.map((campus) => (
                      <option key={campus.id} value={campus.id}>
                        {campus.name}
                      </option>
                    ))}
                  </select>
                </Field>
                {!editing ? (
                  <>
                    <Field>
                      <FieldLabel htmlFor={`${fieldId}-faculty`}>
                        Department
                      </FieldLabel>
                      <select
                        id={`${fieldId}-faculty`}
                        className={selectClassName}
                        value={form.facultyId}
                        onChange={(event) => {
                          update("facultyId", event.target.value)
                          update("courseId", "")
                        }}
                        required
                      >
                        <option value="">Select a department</option>
                        {faculties.map((faculty) => (
                          <option key={faculty.id} value={faculty.id}>
                            {faculty.name}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field>
                      <FieldLabel htmlFor={`${fieldId}-course`}>
                        Course
                      </FieldLabel>
                      <select
                        id={`${fieldId}-course`}
                        className={selectClassName}
                        value={form.courseId}
                        onChange={(event) =>
                          update("courseId", event.target.value)
                        }
                        required
                      >
                        <option value="">Select a course</option>
                        {coursesForFaculty.map((course) => (
                          <option key={course.id} value={course.id}>
                            {course.name}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field>
                      <FieldLabel htmlFor={`${fieldId}-year`}>
                        Academic year
                      </FieldLabel>
                      <select
                        id={`${fieldId}-year`}
                        className={selectClassName}
                        value={form.academicYearId}
                        onChange={(event) =>
                          update("academicYearId", event.target.value)
                        }
                        required
                      >
                        <option value="">Select year</option>
                        {years.map((year) => (
                          <option key={year.id} value={year.id}>
                            {year.name}
                          </option>
                        ))}
                      </select>
                    </Field>
                  </>
                ) : null}
              </FieldGroup>
            </TabsContent>
            <TabsContent value="guardians">
              <div className="flex flex-col gap-4">
                {form.guardians.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No guardians added.
                  </p>
                ) : null}
                {form.guardians.map((guardian, index) => (
                  <div
                    key={guardian.key}
                    className="flex flex-col gap-3 rounded-lg border p-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        {`Guardian ${index + 1}`}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Remove guardian ${index + 1}`}
                        onClick={() => removeGuardian(guardian.key)}
                      >
                        <Trash2 />
                      </Button>
                    </div>
                    <FieldGroup>
                      <Field>
                        <FieldLabel htmlFor={`${guardian.key}-name`}>
                          Name
                        </FieldLabel>
                        <Input
                          id={`${guardian.key}-name`}
                          placeholder="Jane Doe"
                          value={guardian.name}
                          onChange={(event) =>
                            updateGuardian(
                              guardian.key,
                              "name",
                              event.target.value
                            )
                          }
                        />
                      </Field>
                      <Field>
                        <FieldLabel htmlFor={`${guardian.key}-relationship`}>
                          Relationship
                        </FieldLabel>
                        <Input
                          id={`${guardian.key}-relationship`}
                          placeholder="Mother"
                          value={guardian.relationship}
                          onChange={(event) =>
                            updateGuardian(
                              guardian.key,
                              "relationship",
                              event.target.value
                            )
                          }
                        />
                      </Field>
                      <Field>
                        <FieldLabel htmlFor={`${guardian.key}-phone`}>
                          Phone
                        </FieldLabel>
                        <Input
                          id={`${guardian.key}-phone`}
                          placeholder="+27 21 000 0000"
                          value={guardian.phone}
                          onChange={(event) =>
                            updateGuardian(
                              guardian.key,
                              "phone",
                              event.target.value
                            )
                          }
                        />
                      </Field>
                      <Field>
                        <FieldLabel htmlFor={`${guardian.key}-email`}>
                          Email
                        </FieldLabel>
                        <Input
                          id={`${guardian.key}-email`}
                          type="email"
                          placeholder="parent@example.com"
                          value={guardian.email}
                          onChange={(event) =>
                            updateGuardian(
                              guardian.key,
                              "email",
                              event.target.value
                            )
                          }
                        />
                      </Field>
                    </FieldGroup>
                  </div>
                ))}
                <div>
                  <Button type="button" variant="outline" onClick={addGuardian}>
                    Add guardian
                  </Button>
                </div>
              </div>
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
                  : "Create student"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
