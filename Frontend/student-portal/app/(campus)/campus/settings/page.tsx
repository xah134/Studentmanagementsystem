"use client"

import { PageTitle } from "@/components/page-title"
import { WhatsappSessionSettings } from "@/components/support/whatsapp-session-settings"
import { useCampusPortal } from "@/lib/campus-portal"

export default function CampusSettingsPage() {
  const { siteId } = useCampusPortal()

  return (
    <div className="flex flex-col gap-8">
      <PageTitle>Settings</PageTitle>
      <WhatsappSessionSettings siteId={siteId} />
    </div>
  )
}
