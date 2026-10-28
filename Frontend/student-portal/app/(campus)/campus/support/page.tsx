"use client"

import { CampusSupportInbox } from "@/components/support/campus-support-inbox"
import { PageTitle } from "@/components/page-title"
import { useCampusPortal } from "@/lib/campus-portal"

export default function CampusSupportPage() {
  const { siteId } = useCampusPortal()

  return (
    <>
      <PageTitle>Support</PageTitle>
      <CampusSupportInbox siteId={siteId} />
    </>
  )
}
