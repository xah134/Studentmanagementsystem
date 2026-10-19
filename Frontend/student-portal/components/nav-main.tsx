"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import type { LucideIcon } from "lucide-react"

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/Sidebar/sidebar"

export type AppNavItem = {
  title: string
  url: string
  icon?: LucideIcon
}

export type AppNavSection = {
  label: string
  items: AppNavItem[]
}

function isCurrent(pathname: string, url: string, urls: string[]) {
  if (pathname === url) return true
  if (!pathname.startsWith(`${url}/`)) return false
  return !urls.some(
    (other) =>
      other !== url &&
      other.startsWith(`${url}/`) &&
      (pathname === other || pathname.startsWith(`${other}/`))
  )
}

export function NavMain({ sections }: { sections: AppNavSection[] }) {
  const pathname = usePathname()
  const urls = sections.flatMap((section) => section.items.map((item) => item.url))

  return (
    <>
      {sections.map((section, index) => (
        <SidebarGroup key={section.label}>
          {index > 0 ? <SidebarSeparator className="mb-2" /> : null}
          <SidebarGroupLabel>{section.label}</SidebarGroupLabel>
          <SidebarMenu>
            {section.items.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  tooltip={item.title}
                  isActive={isCurrent(pathname, item.url, urls)}
                  render={<Link href={item.url} />}
                >
                  {item.icon ? <item.icon /> : null}
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      ))}
    </>
  )
}
