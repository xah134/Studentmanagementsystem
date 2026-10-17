import { PageTitle } from "@/components/page-title"

export default function AccountSettingsPage() {
  return (
    <div className="flex flex-col gap-2">
      <PageTitle>Account</PageTitle>
      <p className="text-muted-foreground">Your account details.</p>
    </div>
  )
}
