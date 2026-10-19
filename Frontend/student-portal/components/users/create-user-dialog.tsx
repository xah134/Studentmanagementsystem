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

import { apiUrl, authHeaders } from "@/lib/api"

import { userRoleLabels, type User, type UserRole } from "./users"

const selectClassName =
  "h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"

type InstitutionOption = {
  id: string
  name: string
}

type FormState = {
  firstName: string
  lastName: string
  email: string
  phone: string
  password: string
  role: UserRole
  institutionId: string
}

type TabValue = "profile" | "access"

const emptyForm: FormState = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  password: "",
  role: "LECTURER",
  institutionId: "",
}

function formFromUser(user?: User | null): FormState {
  if (!user) return emptyForm
  return {
    firstName: user.firstName ?? "",
    lastName: user.lastName ?? "",
    email: user.email,
    phone: user.phone ?? "",
    password: "",
    role: user.role,
    institutionId: user.institutionId ?? "",
  }
}

type CreateUserDialogProps = {
  // When set, the dialog edits this user instead of creating one.
  user?: User | null
  // Pass open/onOpenChange to control the dialog from outside (edit from a row).
  open?: boolean
  onOpenChange?: (open: boolean) => void
  // Hide the "Create user" button when the parent opens the dialog.
  showTrigger?: boolean
  onSaved: () => void
}

export function CreateUserDialog({
  user = null,
  open,
  onOpenChange,
  showTrigger = true,
  onSaved,
}: CreateUserDialogProps) {
  const [internalOpen, setInternalOpen] = React.useState(false)
  const isOpen = open ?? internalOpen

  function setOpen(next: boolean) {
    if (open === undefined) setInternalOpen(next)
    onOpenChange?.(next)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      {showTrigger ? (
        <DialogTrigger render={<Button />}>Create user</DialogTrigger>
      ) : null}
      <DialogContent>
        {/* The popup unmounts when closed, so the form starts fresh each time. */}
        <UserForm
          user={user}
          onSaved={() => {
            setOpen(false)
            onSaved()
          }}
        />
      </DialogContent>
    </Dialog>
  )
}

function UserForm({
  user,
  onSaved,
}: {
  user: User | null
  onSaved: () => void
}) {
  const isEdit = user !== null
  const [form, setForm] = React.useState<FormState>(() => formFromUser(user))
  const [tab, setTab] = React.useState<TabValue>("profile")
  const [institutions, setInstitutions] = React.useState<InstitutionOption[]>([])
  const [pending, setPending] = React.useState(false)

  React.useEffect(() => {
    const controller = new AbortController()

    fetch(`${apiUrl()}/institutions?page=1&pageSize=50`, {
      cache: "no-store",
      signal: controller.signal,
      headers: authHeaders(),
    })
      .then(async (response) => {
        const payload = await response.json().catch(() => ({}))
        if (!response.ok || !Array.isArray(payload?.data)) {
          throw new Error(payload?.message || "Failed to load institutions")
        }
        setInstitutions(
          payload.data.map((item: { id: string; name: string }) => ({
            id: item.id,
            name: item.name,
          }))
        )
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return
        setInstitutions([])
        toast.error(
          error instanceof Error ? error.message : "Failed to load institutions"
        )
      })

    return () => controller.abort()
  }, [])

  function update(field: keyof FormState, value: string) {
    setForm((current) => {
      const next = { ...current, [field]: value }
      if (field === "role" && value === "SYSTEM_ADMIN") {
        next.institutionId = ""
      }
      return next
    })
  }

  // Returns the first problem and the tab it lives on, so submit can switch to it.
  function validate(): { tab: TabValue; message: string } | null {
    if (!form.firstName.trim()) {
      return { tab: "profile", message: "First name is required" }
    }
    if (!form.lastName.trim()) {
      return { tab: "profile", message: "Last name is required" }
    }
    if (!form.email.trim()) {
      return { tab: "profile", message: "Email is required" }
    }
    if (!isEdit && form.password.length < 8) {
      return { tab: "access", message: "Password must be at least 8 characters" }
    }
    if (isEdit && form.password.length > 0 && form.password.length < 8) {
      return { tab: "access", message: "Password must be at least 8 characters" }
    }
    if (form.role !== "SYSTEM_ADMIN" && !form.institutionId) {
      return { tab: "access", message: "Institution is required" }
    }
    return null
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const problem = validate()
    if (problem) {
      setTab(problem.tab)
      toast.error(problem.message)
      return
    }

    setPending(true)

    try {
      const response = await fetch(
        isEdit ? `${apiUrl()}/users/${user.id}` : `${apiUrl()}/users`,
        {
          method: isEdit ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            firstName: form.firstName.trim(),
            lastName: form.lastName.trim(),
            email: form.email.trim(),
            phone: form.phone.trim(),
            password: form.password,
            role: form.role,
            institutionId:
              form.role === "SYSTEM_ADMIN" ? null : form.institutionId || null,
          }),
        }
      )
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) {
        toast.error(
          payload.message ||
            (isEdit ? "Could not update user" : "Could not create user")
        )
        return
      }

      toast.success(isEdit ? "User updated" : "User created")
      onSaved()
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : isEdit
            ? "Could not update user"
            : "Could not create user"
      )
    } finally {
      setPending(false)
    }
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>{isEdit ? "Edit user" : "Create user"}</DialogTitle>
        <DialogDescription>
          {isEdit
            ? "Update this person's details."
            : "Add a person who can sign in."}
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={onSubmit} noValidate>
        <FieldGroup>
          <Tabs value={tab} onValueChange={(value) => setTab(value as TabValue)}>
            <TabsList>
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="access">Access</TabsTrigger>
            </TabsList>
            <TabsContent value="profile">
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="user-first-name">First name</FieldLabel>
                  <Input
                    id="user-first-name"
                    placeholder="Ada"
                    value={form.firstName}
                    onChange={(event) => update("firstName", event.target.value)}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="user-last-name">Last name</FieldLabel>
                  <Input
                    id="user-last-name"
                    placeholder="Lovelace"
                    value={form.lastName}
                    onChange={(event) => update("lastName", event.target.value)}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="user-email">Email</FieldLabel>
                  <Input
                    id="user-email"
                    type="email"
                    placeholder="ada@example.com"
                    value={form.email}
                    onChange={(event) => update("email", event.target.value)}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="user-phone">Phone</FieldLabel>
                  <Input
                    id="user-phone"
                    placeholder="+27 21 000 0000"
                    value={form.phone}
                    onChange={(event) => update("phone", event.target.value)}
                  />
                </Field>
              </FieldGroup>
            </TabsContent>
            <TabsContent value="access">
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="user-password">Password</FieldLabel>
                  <Input
                    id="user-password"
                    type="password"
                    placeholder={
                      isEdit
                        ? "Leave blank to keep the current password"
                        : "At least 8 characters"
                    }
                    value={form.password}
                    onChange={(event) => update("password", event.target.value)}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="user-role">Role</FieldLabel>
                  <select
                    id="user-role"
                    className={selectClassName}
                    value={form.role}
                    onChange={(event) => update("role", event.target.value)}
                  >
                    {(Object.keys(userRoleLabels) as UserRole[]).map((role) => (
                      <option key={role} value={role}>
                        {userRoleLabels[role]}
                      </option>
                    ))}
                  </select>
                </Field>
                {form.role !== "SYSTEM_ADMIN" ? (
                  <Field>
                    <FieldLabel htmlFor="user-institution">Institution</FieldLabel>
                    <select
                      id="user-institution"
                      className={selectClassName}
                      value={form.institutionId}
                      onChange={(event) =>
                        update("institutionId", event.target.value)
                      }
                    >
                      <option value="">Select an institution</option>
                      {institutions.map((institution) => (
                        <option key={institution.id} value={institution.id}>
                          {institution.name}
                        </option>
                      ))}
                    </select>
                  </Field>
                ) : null}
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
                  : "Create user"}
            </Button>
          </DialogFooter>
        </FieldGroup>
      </form>
    </>
  )
}
