"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff } from "lucide-react"
import { toast } from "sonner"
import { cn } from "cn"

import { Button } from "@/components/ui/Button/button"
import { Card, CardContent } from "@/components/ui/Card/card"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/Field/field"
import { Input } from "@/components/ui/Input/input"

const apiUrl =
  process.env.NEXT_PUBLIC_STUDENT_PORTAL_API_URL || "http://localhost:5156/api"

function recoverySession() {
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""))
  return {
    accessToken: hash.get("access_token") || "",
    refreshToken: hash.get("refresh_token") || "",
  }
}

export function UpdatePasswordForm({ className, ...props }) {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [pending, setPending] = useState(false)
  const [session, setSession] = useState({ accessToken: "", refreshToken: "" })

  useEffect(() => {
    const nextSession = recoverySession()
    setSession(nextSession)
    if (!nextSession.accessToken || !nextSession.refreshToken) {
      toast.error("Open the reset link from your email to choose a new password")
    }
  }, [])

  async function onSubmit(event) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const password = String(form.get("password") || "")
    const confirmPassword = String(form.get("confirmPassword") || "")

    if (password !== confirmPassword) {
      toast.error("Passwords do not match")
      return
    }
    if (!session.accessToken || !session.refreshToken) {
      toast.error("Open the reset link from your email to choose a new password")
      return
    }

    setPending(true)
    try {
      const response = await fetch(`${apiUrl}/auth/update-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password,
          accessToken: session.accessToken,
          refreshToken: session.refreshToken,
        }),
      })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) {
        toast.error(payload.message || "Could not update the password")
        return
      }
      toast.success("Password updated")
      router.push("/")
    } catch (error) {
      toast.error(error.message || "Could not update the password")
    } finally {
      setPending(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:min-h-[21rem] md:grid-cols-2">
          <form className="p-6 md:p-8" onSubmit={onSubmit}>
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">Choose a new password</h1>
                <p className="text-balance text-muted-foreground">
                  Enter a new password for your University Portal account.
                </p>
              </div>
              <Field>
                <FieldLabel htmlFor="new-password">New password</FieldLabel>
                <div className="relative">
                  <Input
                    id="new-password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    className="pr-9"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="absolute top-1/2 right-0.5 -translate-y-1/2"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    aria-pressed={showPassword}
                    onClick={() => setShowPassword((visible) => !visible)}
                  >
                    {showPassword ? <EyeOff /> : <Eye />}
                  </Button>
                </div>
              </Field>
              <Field>
                <FieldLabel htmlFor="confirm-password">Confirm password</FieldLabel>
                <Input
                  id="confirm-password"
                  name="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  required
                />
              </Field>
              <Field>
                <Button type="submit" disabled={pending}>
                  {pending ? "Updating..." : "Update password"}
                </Button>
              </Field>
            </FieldGroup>
          </form>
          <div className="relative hidden bg-muted md:block">
            <img
              src="/auth/students-reading.jpg"
              alt="Students taking notes in class"
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
