"use client"

import * as React from "react"

import { SidebarTrigger } from "@/components/ui/Sidebar/sidebar"

const PageTitleContext = React.createContext<{
  title: string
  setTitle: React.Dispatch<React.SetStateAction<string>>
} | null>(null)

export function PageTitleProvider({ children }: { children: React.ReactNode }) {
  const [title, setTitle] = React.useState("")
  const value = React.useMemo(() => ({ title, setTitle }), [title])

  return (
    <PageTitleContext.Provider value={value}>{children}</PageTitleContext.Provider>
  )
}

export function PageTitle({ children }: { children: string }) {
  const context = React.useContext(PageTitleContext)
  const setTitle = context?.setTitle

  React.useEffect(() => {
    if (!setTitle) return
    setTitle(children)
    return () => {
      setTitle((current) => (current === children ? "" : current))
    }
  }, [children, setTitle])

  return null
}

export function AppHeader() {
  const context = React.useContext(PageTitleContext)

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b px-4">
      <SidebarTrigger />
      {context?.title ? (
        <h1 className="truncate text-lg font-semibold tracking-tight">
          {context.title}
        </h1>
      ) : null}
    </header>
  )
}
