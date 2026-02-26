import { TeamManagement } from "../components/team-management"

interface DashboardPageProps {
  params: Promise<{
    locale: string
  }>
}

export default async function DashboardPage({ params }: DashboardPageProps) {
  await params

  return (
    <section className="space-y-6 rounded-3xl border border-border/60 bg-card/75 p-4 shadow-sm backdrop-blur-sm sm:p-6">
      <TeamManagement />
    </section>
  )
}
