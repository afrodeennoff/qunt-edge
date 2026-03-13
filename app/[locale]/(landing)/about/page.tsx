import type { Metadata } from "next"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Code, LineChart, GraduationCap } from "lucide-react"
import { UnifiedPageShell } from "@/components/layout/unified-page-shell"
import Link from "next/link"

export const revalidate = 1800
export const metadata: Metadata = {
  title: "About Qunt Edge | Trading Performance Intelligence",
  description:
    "Learn how Qunt Edge helps discretionary traders improve execution quality, risk discipline, and decision consistency.",
}

export default function AboutPage({ params }: { params: { locale: string } }) {
  const { locale } = params
  const founderSkills = [
    { name: "Order Book Trading", icon: <BookOpen className="w-4 h-4" /> },
    { name: "Volume Profile", icon: <LineChart className="w-4 h-4" /> },
    { name: "Computer Science", icon: <Code className="w-4 h-4" /> },
    { name: "Quantitative Finance", icon: <GraduationCap className="w-4 h-4" /> },
  ]

  return (
    <UnifiedPageShell widthClassName="max-w-[1280px]" className="py-8">
      <header className="mb-6 rounded-2xl border border-border/60 bg-card/70 p-6">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">About Qunt Edge</h1>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground sm:text-base">
          Built for serious discretionary traders who want better decision quality, tighter risk control, and repeatable performance.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href={`/${locale}/pricing`} className="rounded-full bg-primary px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-primary-foreground">
            View Pricing
          </Link>
          <Link href={`/${locale}/support`} className="rounded-full border border-border px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-foreground hover:bg-accent/50">
            Contact Support
          </Link>
        </div>
      </header>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card className="border-border/60 bg-card/70">
          <CardHeader>
            <CardTitle className="text-2xl">Our Mission</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              At Qunt Edge, we&apos;re on a mission to empower traders with advanced analytics and AI-driven insights. 
              Our platform is designed to help you understand your trading patterns, optimize your strategies, 
              and ultimately become a better trader through comprehensive backtesting and analysis of your real track record.
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/70">
          <CardHeader>
            <CardTitle className="text-2xl">THE TRADER BEHIND TIMON|</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-muted-foreground">
              I&apos;m Timon - a futures trader and trading educator. After years of studying price action, market behavior, and trading psychology, I developed a structured approach focused on clarity, simplicity, and consistent execution.
            </p>
            <p className="text-muted-foreground">
              This method is built to help traders avoid common mistakes, reduce noise, and progress with better decision-making and discipline. The focus is straightforward: strategy, execution, and mindset. No distractions. Just a process designed to support steady improvement over time.
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/70 md:col-span-2">
          <CardHeader>
            <CardTitle className="text-2xl">Founder&apos;s Expertise</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {founderSkills.map((skill, index) => (
                <Badge key={index} variant="secondary" className="border-border/60 bg-secondary/30 text-sm py-1 px-2 flex items-center gap-1">
                  {skill.icon}
                  {skill.name}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/70 md:col-span-2">
          <CardHeader>
            <CardTitle className="text-2xl">Why Qunt Edge?</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Built by a trader, for traders</li>
              <li>Advanced analytics powered by real-world trading experience</li>
              <li>Comprehensive backtesting using your actual trade history</li>
              <li>AI-driven insights to improve your trading psychology</li>
              <li>Tailored to serious traders looking to elevate their performance</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </UnifiedPageShell>
  )
}
