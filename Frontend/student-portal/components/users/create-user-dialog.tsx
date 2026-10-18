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

import { apiUrl, authHeaders } from "@/lib/api"

import { userRoleLabels, type UserRole } from "./users"

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

const emptyForm: FormState = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  password: "",
  role: "LECTURER",
  institutionId: "",
}

export function CreateUserDialog({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = React.useState(false)
  const [form, setForm] = React.useState<FormState>(emptyForm)
  const [institutions, setInstitutions] = React.useState<InstitutionOption[]>([])
  const [pending, setPending] = React.useState(false)

  React.useEffect(() => {
    if (!open) return
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
  }, [open])

  function update(field: keyof FormState, value: string) {
    setForm((current) => {
      const next = { ...current, [field]: value }
      if (field === "role" && value === "SYSTEM_ADMIN") {
        next.institutionId = ""
      }
      return next
    })
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true)

    try {
      const response = await fetch(`${apiUrl()}/users`, {
        method: "POST",
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
      })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) {
        toast.error(payload.message || "Could not create user")
        return
      }

      toast.success("User created")
      setForm(emptyForm)
      setOpen(false)
      onCreated()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not create user")
    } finally {
      setPending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>Create user</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create user</DialogTitle>
          <DialogDescription>
            Add a person who can sign in.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="create-user-first-name">First name</FieldLabel>
              <Input
                id="create-user-first-name"
                placeholder="Ada"
                value={form.firstName}
                onChange={(event) => update("firstName", event.target.value)}
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="create-user-last-name">Last name</FieldLabel>
              <Input
                id="create-user-last-name"
                placeholder="Lovelace"
                value={form.lastName}
                onChange={(event) => update("lastName", event.target.value)}
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="create-user-email">Email</FieldLabel>
              <Input
                id="create-user-email"
                type="email"
                placeholder="ada@example.com"
                value={form.email}
                onChange={(event) => update("email", event.target.value)}
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="create-user-phone">Phone</FieldLabel>
              <Input
                id="create-user-phone"
                placeholder="+27 21 000 0000"
                value={form.phone}
                onChange={(event) => update("phone", event.target.value)}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="create-user-password">Password</FieldLabel>
              <Input
                id="create-user-password"
                type="password"
                placeholder="At least 8 characters"
                value={form.password}
                onChange={(event) => update("password", event.target.value)}
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="create-user-role">Role</FieldLabel>
              <select
                id="create-user-role"
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
                <FieldLabel htmlFor="create-user-institution">
                  Institution
                </FieldLabel>
                <select
                  id="create-user-institution"
                  className={selectClassName}
                  value={form.institutionId}
                  onChange={(event) => update("institutionId", event.target.value)}
                  required
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
            <DialogFooter>
              <Button type="submit" disabled={pending}>
                {pending ? "Creating..." : "Create user"}
              </Button>
            </DialogFooter>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  )
}
