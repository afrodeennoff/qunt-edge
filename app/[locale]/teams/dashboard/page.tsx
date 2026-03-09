import { TeamManagement } from "../components/team-management"

interface DashboardPageProps {
  params: Promise<{
    locale: string
  }>
}

export default async function DashboardPage({ params }: DashboardPageProps) {
  await params

  return (
    <section className="space-y-6 rounded-3xl border border-border/70 bg-card/80 p-4 shadow-[0_22px_40px_-34px_hsl(var(--foreground)/0.55)] backdrop-blur-sm sm:p-6">
      <TeamManagement />
    </section>
  )
}
