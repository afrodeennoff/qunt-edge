'use client'

import { useParams } from "next/navigation"
import Link from "next/link"
import { ArrowRight, Settings, Users } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TeamManagement } from "../../../components/team-management"

export default function TeamMembersPage() {
  const params = useParams<{ slug: string; locale?: string }>()
  const slug = params.slug
  const localePrefix = params.locale ? `/${params.locale}` : ''
  const teamManageHref = `${localePrefix}/teams/manage`
  const analyticsHref = `${localePrefix}/teams/dashboard/${slug}/analytics`

  return (
    <section className="space-y-6">
      <header className="rounded-2xl border border-border/70 bg-card/70 p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="h-4 w-4 text-primary" />
              <p className="text-[10px] font-black uppercase tracking-[0.2em]">Access Control</p>
            </div>
            <h1 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">Members & Roles</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Manage invitations, responsibilities, and permission boundaries across the team.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" className="h-10 rounded-xl border-border/70 text-[11px] font-black uppercase tracking-[0.15em]">
              <Link href={analyticsHref}>
                Team Analytics
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild className="h-10 rounded-xl text-[11px] font-black uppercase tracking-[0.15em]">
              <Link href={teamManageHref}>
                <Settings className="h-4 w-4" />
                Manage Team
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <Card className="border-border/70 bg-card/75">
        <CardContent className="p-2 sm:p-3">
          <TeamManagement />
        </CardContent>
      </Card>
    </section>
  )
}
