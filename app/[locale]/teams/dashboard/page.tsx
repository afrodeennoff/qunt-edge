import Link from "next/link"
import { ArrowRight, Building2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TeamManagement } from "../components/team-management"

interface DashboardPageProps {
  params: Promise<{
    locale: string
  }>
}

export default async function DashboardPage({ params }: DashboardPageProps) {
  const { locale } = await params
  const teamsManageHref = `/${locale}/teams/manage`
  const teamsLandingHref = `/${locale}/teams`

  return (
    <section className="enterprise-shell space-y-6 rounded-3xl p-4 sm:p-6">
      <header className="enterprise-panel p-5 sm:p-6">
        <p className="enterprise-kicker">Teams</p>
        <h1 className="mt-3 text-2xl font-black tracking-tight text-zinc-50 sm:text-3xl">Choose a Team Workspace</h1>
        <p className="mt-2 max-w-2xl text-sm text-zinc-400">
          Select an existing team from the sidebar or create a new one to open analytics, members, and trader views.
        </p>
      </header>

      <Card className="enterprise-panel">
        <CardHeader>
          <CardTitle className="inline-flex items-center gap-2 text-lg text-zinc-50">
            <Building2 className="h-5 w-5 text-zinc-200" />
            Next Step
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-3">
          <Button asChild className="rounded-xl bg-white text-black hover:bg-zinc-200">
            <Link href={teamsManageHref}>
              Manage Teams
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" className="rounded-xl border-white/20 bg-transparent text-zinc-200 hover:bg-white/10">
            <Link href={teamsLandingHref}>View Teams Product Page</Link>
          </Button>
        </CardContent>
      </Card>

      <TeamManagement />
    </section>
  )
}
