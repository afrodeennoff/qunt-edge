import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Code, LineChart, GraduationCap } from "lucide-react"
import { UnifiedPageHeader, UnifiedPageShell } from "@/components/layout/unified-page-shell"

export default function AboutPage() {
  const founderSkills = [
    { name: "Order Book Trading", icon: <BookOpen className="w-4 h-4" /> },
    { name: "Volume Profile", icon: <LineChart className="w-4 h-4" /> },
    { name: "Computer Science", icon: <Code className="w-4 h-4" /> },
    { name: "Quantitative Finance", icon: <GraduationCap className="w-4 h-4" /> },
  ]

  return (
    <UnifiedPageShell className="py-8">
      <UnifiedPageHeader
        eyebrow="Company"
        title="About Qunt Edge"
        description="Built by a trader-engineer to transform raw trade history into actionable execution intelligence."
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card className="border-white/10 bg-black/40">
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

        <Card className="border-white/10 bg-black/40">
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

        <Card className="border-white/10 bg-black/40 md:col-span-2">
          <CardHeader>
            <CardTitle className="text-2xl">Founder&apos;s Expertise</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {founderSkills.map((skill, index) => (
                <Badge key={index} variant="secondary" className="border-white/15 bg-white/10 text-sm py-1 px-2 flex items-center gap-1">
                  {skill.icon}
                  {skill.name}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-black/40 md:col-span-2">
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
