"use client"

import { Tabs as TabsPrimitive } from "@base-ui/react/tabs"
import { cn } from "cn"

function Tabs({ ...props }: TabsPrimitive.Root.Props) {
  return <TabsPrimitive.Root data-slot="tabs" {...props} />
}

function TabsList({ className, ...props }: TabsPrimitive.List.Props) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(
        "inline-flex h-8 w-full items-center gap-1 rounded-lg bg-muted p-0.5 text-muted-foreground",
        className
      )}
      {...props}
    />
  )
}

function TabsTrigger({ className, ...props }: TabsPrimitive.Tab.Props) {
  return (
    <TabsPrimitive.Tab
      data-slot="tabs-trigger"
      className={cn(
        "inline-flex h-7 flex-1 items-center justify-center rounded-md px-2.5 text-sm font-medium whitespace-nowrap outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 data-active:bg-background data-active:text-foreground data-active:shadow-sm",
        className
      )}
      {...props}
    />
  )
}

function TabsContent({ className, ...props }: TabsPrimitive.Panel.Props) {
  return (
    <TabsPrimitive.Panel
      data-slot="tabs-content"
      className={cn("mt-4 outline-none", className)}
      {...props}
    />
  )
}

export { Tabs, TabsContent, TabsList, TabsTrigger }
