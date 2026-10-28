"use client"

import type * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronRight, type LucideIcon } from "lucide-react"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/Collapsible/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarSeparator,
} from "@/components/ui/Sidebar/sidebar"

export type AppNavIcon = LucideIcon | React.ComponentType<{ className?: string }>

export type AppNavItem = {
  title: string
  url?: string
  icon?: AppNavIcon
  children?: AppNavItem[]
}

export type AppNavSection = {
  label: string
  items: AppNavItem[]
}

function collectUrls(items: AppNavItem[]): string[] {
  return items.flatMap((item) => [
    ...(item.url ? [item.url] : []),
    ...(item.children ? collectUrls(item.children) : []),
  ])
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

function childActive(pathname: string, item: AppNavItem, urls: string[]) {
  if (!item.children?.length) return false
  return item.children.some(
    (child) => child.url && isCurrent(pathname, child.url, urls)
  )
}

export function NavMain({ sections }: { sections: AppNavSection[] }) {
  const pathname = usePathname()
  const urls = sections.flatMap((section) => collectUrls(section.items))

  return (
    <>
      {sections.map((section, index) => (
        <SidebarGroup key={section.label} className="py-1">
          {index > 0 ? <SidebarSeparator className="my-1" /> : null}
          <SidebarGroupLabel className="h-6">{section.label}</SidebarGroupLabel>
          <SidebarMenu>
            {section.items.map((item) => {
              if (item.children?.length) {
                const open = childActive(pathname, item, urls)
                return (
                  <Collapsible
                    key={item.title}
                    defaultOpen={open}
                    className="group/collapsible"
                  >
                    <SidebarMenuItem>
                      <CollapsibleTrigger
                        render={
                          <SidebarMenuButton tooltip={item.title} />
                        }
                      >
                        {item.icon ? <item.icon /> : null}
                        <span>{item.title}</span>
                        <ChevronRight className="ml-auto transition-transform group-data-[open]/collapsible:rotate-90" />
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {item.children.map((child) => (
                            <SidebarMenuSubItem key={child.title}>
                              <SidebarMenuSubButton
                                isActive={
                                  !!child.url &&
                                  isCurrent(pathname, child.url, urls)
                                }
                                render={
                                  child.url ? (
                                    <Link href={child.url} />
                                  ) : undefined
                                }
                              >
                                {child.icon ? <child.icon /> : null}
                                <span>{child.title}</span>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                )
              }

              if (!item.url) return null

              return (
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
              )
            })}
          </SidebarMenu>
        </SidebarGroup>
      ))}
    </>
  )
}
