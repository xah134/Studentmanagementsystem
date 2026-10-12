export default function SystemAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-svh items-center justify-center bg-muted p-6">
      {children}
    </div>
  )
}
