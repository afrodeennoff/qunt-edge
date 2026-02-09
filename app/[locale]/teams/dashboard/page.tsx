import Link from "next/link"
import { ArrowRight, Building2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TeamManagement } from "../components/team-management"

export default function DashboardPage() {
  return (
    <section className="space-y-6 rounded-3xl border border-border/60 bg-card/75 p-4 shadow-sm backdrop-blur-sm sm:p-6">
      <header className="rounded-2xl border border-border/70 bg-background/70 p-5 sm:p-6">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Teams</p>
        <h1 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">Choose a Team Workspace</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Select an existing team from the sidebar or create a new one to open analytics, members, and trader views.
        </p>
      </header>

      <Card className="border-border/70 bg-background/70">
        <CardHeader>
          <CardTitle className="inline-flex items-center gap-2 text-lg">
            <Building2 className="h-5 w-5 text-primary" />
            Next Step
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-3">
          <Button asChild className="rounded-xl">
            <Link href="/teams/manage">
              Manage Teams
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" className="rounded-xl border-border/70">
            <Link href="/teams">View Teams Product Page</Link>
          </Button>
        </CardContent>
      </Card>

      <div className="rounded-2xl border border-border/70 bg-background/70 p-2 sm:p-3">
        <TeamManagement />
      </div>
    </section>
  )
}
