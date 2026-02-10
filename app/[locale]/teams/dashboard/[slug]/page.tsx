import { Suspense } from "react"
import { TeamEquityGridClient } from "../../components/user-equity/team-equity-grid-client"

interface TeamDashboardPageProps {
  params: Promise<{
    slug: string
  }>
}

export default async function TeamDashboardPage({ params }: TeamDashboardPageProps) {
  const { slug } = await params

  return (
    <section className="page-stack">
      <header className="surface-frame">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Team Workspace</p>
        <h1 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">Overview</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Live visibility into team equity, account structure, and cross-trader performance.
        </p>
      </header>

      <Suspense fallback={<div className="surface-frame text-sm text-muted-foreground">Loading team overview…</div>}>
        <TeamEquityGridClient teamId={slug} />
      </Suspense>
    </section>
  )
}
