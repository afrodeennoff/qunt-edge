import { Bolt, BadgeCheck } from "lucide-react"
import type { TraderProfile } from "../../types/trader-profile"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function ProfileHero({ profile }: { profile: TraderProfile }) {
  return (
    <div className="rounded-2xl border border-border/70 bg-[hsl(var(--qe-panel))]/95 p-4">
      <div className="flex items-center gap-4">
        <Avatar className="size-18 rounded-full border border-border/70">
          <AvatarImage src={profile.avatar} alt={profile.name} />
          <AvatarFallback>{profile.name.slice(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div>
          <p className="flex items-center gap-1 text-[28px] font-semibold leading-none text-foreground">
            {profile.name}
            <Bolt className="size-5" />
          </p>
          <p className="mt-1 text-ui-body text-muted-foreground">
            {profile.linkedAccounts} linked accounts • {profile.totalTrades} trades
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-md border border-border/70 bg-background/60 px-2 py-1 text-ui-micro font-semibold text-foreground">
              <BadgeCheck className="size-3.5" /> {profile.tier}
            </span>
            <span className="rounded-md border border-border/70 bg-background/60 px-2 py-1 text-ui-micro text-foreground">{profile.style}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
