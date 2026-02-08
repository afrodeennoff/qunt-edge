import { Suspense } from "react"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AuthProfileButton } from "../components/auth-profile-button"
import { AuthProfileButtonSkeleton } from "../components/auth-profile-button-skeleton"
import { TeamsSidebar } from "../components/teams-sidebar"

export default function TeamManageLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen w-full bg-background selection:bg-accent-teal/20 selection:text-foreground">
      <TeamsSidebar />

      <SidebarInset className="relative flex-1 overflow-hidden">
        <div className="pointer-events-none absolute left-0 top-0 z-0 h-full w-full">
          <div className="absolute left-[-10%] top-[-10%] h-[45%] w-[45%] rounded-full bg-primary/6 blur-[120px] animate-pulse-slow" />
          <div className="absolute bottom-[-10%] right-[-10%] h-[45%] w-[45%] rounded-full bg-primary/8 blur-[120px] animate-pulse-slow" />
        </div>

        <div className="relative z-10 flex min-h-screen flex-col">
          <header className="sticky top-0 z-40 h-16 border-b border-border/70 bg-background/95 backdrop-blur-md">
            <div className="mx-auto flex h-full w-full max-w-[1600px] items-center justify-between px-4 sm:px-6 lg:px-8">
              <div className="flex items-center gap-3">
                <SidebarTrigger className="-ml-1 md:hidden" />
                <div className="flex flex-col">
                  <h1 className="text-sm font-bold tracking-wide text-foreground">Team Management</h1>
                  <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                    Unified Workspace
                  </span>
                </div>
              </div>
              <Suspense fallback={<AuthProfileButtonSkeleton />}>
                <AuthProfileButton />
              </Suspense>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto">
            <div className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
              {children}
            </div>
          </main>
        </div>
      </SidebarInset>
    </div>
  )
}
