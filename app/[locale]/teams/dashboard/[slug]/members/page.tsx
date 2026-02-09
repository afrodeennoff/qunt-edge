'use client'

import { useParams } from "next/navigation"
import Link from "next/link"
import { ShieldPlus, UserPlus, Users } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function TeamMembersPage() {
  const params = useParams<{ slug: string }>()
  const slug = params.slug

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
          <Button className="h-10 rounded-xl text-[11px] font-black uppercase tracking-[0.15em]">
            <UserPlus className="h-4 w-4" />
            Invite Member
          </Button>
        </div>
      </header>

      <Card className="border-border/70 bg-card/70">
        <CardContent className="flex flex-col items-center justify-center gap-4 py-16 text-center sm:py-24">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-primary/25 bg-primary/10">
            <ShieldPlus className="h-7 w-7 text-primary" />
          </div>
          <h2 className="text-lg font-black tracking-tight sm:text-xl">Role Matrix Expansion In Progress</h2>
          <p className="max-w-md text-sm text-muted-foreground">
            Advanced role mapping for `/{slug}` is being finalized. You can still manage core team settings and invitations from the dashboard controls.
          </p>
          <Button asChild variant="outline" className="rounded-xl border-border/70">
            <Link href="/teams/manage">Open Team Management</Link>
          </Button>
        </CardContent>
      </Card>
    </section>
  )
}
