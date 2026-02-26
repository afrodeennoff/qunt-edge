import Link from "next/link"
import { ArrowRight } from "lucide-react"
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
    <section className="space-y-6 rounded-3xl border border-border/60 bg-card/75 p-4 shadow-sm backdrop-blur-sm sm:p-6">
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border/70 bg-background/70 p-3">
        <Button asChild className="rounded-xl">
          <Link href={teamsManageHref}>
            Manage Teams
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
        <Button asChild variant="outline" className="rounded-xl border-border/70">
          <Link href={teamsLandingHref}>View Teams Product Page</Link>
        </Button>
      </div>

      <TeamManagement />
    </section>
  )
}
