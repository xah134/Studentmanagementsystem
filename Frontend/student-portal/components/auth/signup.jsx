"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff } from "lucide-react"
import { cn } from "cn"

import { Button } from "@/components/ui/Button/button"
import { Card, CardContent } from "@/components/ui/Card/card"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/Field/field"
import { Input } from "@/components/ui/Input/input"

export function SignUpForm({ className, ...props }) {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [pending, setPending] = useState(false)

  async function onSubmit(event) {
    event.preventDefault()
    setError("")
    setPending(true)

    const form = new FormData(event.currentTarget)
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_STUDENT_PORTAL_API_URL || "http://localhost:5156/api"}/initialize`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: form.get("email"),
            password: form.get("password"),
          }),
        }
      )
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) {
        setError(payload.message || "Could not create the account")
        return
      }
      router.push("/")
    } catch (requestError) {
      setError(requestError.message || "Could not create the account")
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
                <h1 className="text-2xl font-bold">Create your account</h1>
                <p className="text-balance text-muted-foreground">
                  Sign up for your University Portal account
                </p>
              </div>
              <Field>
                <FieldLabel htmlFor="signup-email">Email</FieldLabel>
                <Input
                  id="signup-email"
                  name="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="signup-password">Password</FieldLabel>
                <div className="relative">
                  <Input
                    id="signup-password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="At least 8 characters"
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
              {error ? (
                <p className="text-sm text-destructive" role="alert">
                  {error}
                </p>
              ) : null}
              <Field>
                <Button type="submit" disabled={pending}>
                  {pending ? "Signing up..." : "Sign up"}
                </Button>
              </Field>
            </FieldGroup>
          </form>
          <div className="relative hidden bg-muted md:block">
            <img
              src="/auth/academics-background.jpg"
              alt="Graduates in front of an academics building"
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
