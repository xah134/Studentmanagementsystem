import { UpdatePasswordForm } from "@/components/auth/update-password"

export default function UpdatePasswordPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-4xl">
        <UpdatePasswordForm />
      </div>
    </div>
  )
}
