"use client"

import dynamic from "next/dynamic"
import { useEffect, useMemo, useRef, useState } from "react"
import {
  Bot,
  Brain,
  CircleCheck,
  CircleX,
  Gauge,
  Loader2,
  MessageSquareText,
  PauseCircle,
  Sparkles,
  TrendingUp,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useI18n } from "@/locales/client"
import type { BehaviorInsights } from "@/lib/behavior-insights"

const MindsetWidget = dynamic(
  () => import("../components/mindset/mindset-widget").then((m) => ({ default: m.MindsetWidget })),
  { loading: () => <div className="h-full w-full animate-pulse rounded-xl border border-border/60 bg-card/60" /> }
)

const AnalysisOverview = dynamic(
  () => import("../components/analysis/analysis-overview").then((m) => ({ default: m.AnalysisOverview })),
  { loading: () => <div className="h-80 w-full animate-pulse rounded-xl border border-border/60 bg-card/60" /> }
)

const ChatWidget = dynamic(
  () => import("../components/chat/chat"),
  { loading: () => <div className="h-full w-full animate-pulse rounded-xl border border-border/60 bg-card/60" /> }
)

export default function DashboardBehaviorPage() {
  const t = useI18n()
  const [periodDays, setPeriodDays] = useState(30)
  const [refreshKey, setRefreshKey] = useState(0)
  const [insights, setInsights] = useState<BehaviorInsights | null>(null)
  const [isLoadingInsights, setIsLoadingInsights] = useState(true)
  const [insightsError, setInsightsError] = useState<string | null>(null)
  const inFlightControllerRef = useRef<AbortController | null>(null)

  useEffect(() => {
    let isMounted = true
    inFlightControllerRef.current?.abort()
    const controller = new AbortController()
    inFlightControllerRef.current = controller

    const loadInsights = async () => {
      setIsLoadingInsights(true)
      setInsightsError(null)
      try {
        const response = await fetch(`/api/behavior/insights?periodDays=${periodDays}`, {
          method: "GET",
          cache: "no-store",
          signal: controller.signal,
        })

        if (!response.ok) {
          throw new Error(`Insights request failed (${response.status})`)
        }

        const payload = (await response.json()) as BehaviorInsights
        if (isMounted) {
          setInsights(payload)
        }
      } catch (error) {
        if ((error as Error).name === "AbortError") return
        console.error("[Behavior Page] Failed to load insights", error)
        if (isMounted) {
          setInsightsError("Unable to load behavior insights right now.")
        }
      } finally {
        if (isMounted) {
          setIsLoadingInsights(false)
        }
      }
    }

    loadInsights()
    return () => {
      isMounted = false
      controller.abort()
    }
  }, [periodDays, refreshKey])

  const trainingModules = useMemo(() => {
    const checkInRate = insights?.modules.checkInRate ?? 0
    const averageEmotion = insights?.summary.averageEmotion ?? 50
    const emotionalRisk = insights?.summary.emotionalRiskPercent ?? 0

    return [
      {
        title: "Daily Emotional Check-In",
        description: "Track confidence, anxiety, and focus before market open to adapt your execution plan.",
        metric: `${checkInRate}% completion`,
      },
      {
        title: "Mindset Coaching Loop",
        description: "Use coaching prompts for market anxiety, losses, and overconfidence after winning streaks.",
        metric: `Avg emotion: ${averageEmotion}/100`,
      },
      {
        title: "Mindful Entry Reminders",
        description: "Nudges before execution: planned setup or emotional reaction?",
        metric: `Emotion-driven risk: ${emotionalRisk}%`,
      },
    ]
  }, [insights])

  const reflectionModules = useMemo(() => {
    return [
      {
        title: "Weekly Self-Reflection Dashboard",
        description: "Review loss-chasing, panic exits, and impulsive entries with behavior trend views.",
        metric: "Emotion-Driven Trades",
        value: `${insights?.summary.emotionalRiskPercent ?? 0}%`,
      },
      {
        title: "Post-Trade Psychological Review",
        description: "After high-risk trades, capture state-of-mind and trigger source (news, social, revenge, FOMO).",
        metric: "Reflection Completion",
        value: `${insights?.modules.reflectionCompletionRate ?? 0}%`,
      },
      {
        title: "Stress & Risk Impact Report",
        description: "Monthly synthesis of market exposure and emotional volatility with AI recommendations.",
        metric: "Stress Events",
        value: `${(insights?.summary.overtradingDays ?? 0) + (insights?.summary.lossChasingEvents ?? 0) + (insights?.summary.impulsiveTradeCount ?? 0)}`,
      },
    ]
  }, [insights])

  const gamificationModules = useMemo(() => {
    return [
      {
        badge: "Steady Hand",
        detail: "Maintain your risk profile for 30 consecutive days.",
        achieved: insights?.achievements.steadyHand ?? false,
      },
      {
        badge: "Emotional Master",
        detail: "Avoid revenge trading and overtrading behavior.",
        achieved: insights?.achievements.emotionalMaster ?? false,
      },
      {
        badge: "Control Streak",
        detail: "Trade 7 days with disciplined size and planned entries.",
        achieved: insights?.achievements.controlStreak ?? false,
      },
    ]
  }, [insights])

  const recommendationList = insights?.recommendations ?? []

  return (
    <div className="w-full space-y-6 p-3 sm:p-4 lg:p-6">
      <Card className="rounded-2xl border border-border/60 bg-card shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-foreground" />
                <CardTitle className="text-xl md:text-2xl">Behavior AI Hub</CardTitle>
                <Badge variant="secondary" className="border-border/20 text-foreground">
                  <Sparkles className="mr-1 h-3.5 w-3.5" />
                  AI
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {t("analysis.description")}
              </p>
            </div>
            <div className="hidden items-center gap-2 md:flex">
              <Badge variant="outline" className="gap-1">
                <TrendingUp className="h-3.5 w-3.5" />
                Performance
              </Badge>
              <Badge variant="outline" className="gap-1">
                <Bot className="h-3.5 w-3.5" />
                Coach
              </Badge>
              <Badge variant="outline" className="gap-1">
                <MessageSquareText className="h-3.5 w-3.5" />
                Journal
              </Badge>
              <Badge variant="outline" className="gap-1">
                <Gauge className="h-3.5 w-3.5" />
                Stress Monitor
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              variant={periodDays === 7 ? "default" : "secondary"}
              onClick={() => setPeriodDays(7)}
            >
              7d
            </Button>
            <Button
              size="sm"
              variant={periodDays === 30 ? "default" : "secondary"}
              onClick={() => setPeriodDays(30)}
            >
              30d
            </Button>
            <Button
              size="sm"
              variant={periodDays === 90 ? "default" : "secondary"}
              onClick={() => setPeriodDays(90)}
            >
              90d
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                const section = document.getElementById("analysis-section")
                section?.scrollIntoView({ behavior: "smooth", block: "start" })
              }}
            >
              Open AI Analysis
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                const section = document.getElementById("coach-section")
                section?.scrollIntoView({ behavior: "smooth", block: "start" })
              }}
            >
              Ask AI Coach
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                const section = document.getElementById("mindset-section")
                section?.scrollIntoView({ behavior: "smooth", block: "start" })
              }}
            >
              Open Journal
            </Button>
            {isLoadingInsights ? (
              <Badge variant="outline" className="gap-1">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Updating insights
              </Badge>
            ) : null}
            {!isLoadingInsights ? (
              <Badge variant="outline" className="gap-1">
                Confidence: {insights?.summary.confidenceScore ?? 0}% ({insights?.summary.confidenceBand ?? "low"})
              </Badge>
            ) : null}
          </div>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-border/70 bg-background/70 p-3">
              <p className="text-xs text-muted-foreground">Trades</p>
              <p className="text-lg font-semibold">{insights?.summary.tradeCount ?? 0}</p>
            </div>
            <div className="rounded-xl border border-border/70 bg-background/70 p-3">
              <p className="text-xs text-muted-foreground">Win Rate</p>
              <p className="text-lg font-semibold">{insights?.summary.winRate ?? 0}%</p>
            </div>
            <div className="rounded-xl border border-border/70 bg-background/70 p-3">
              <p className="text-xs text-muted-foreground">Stress Score</p>
              <p className="text-lg font-semibold">{insights?.summary.stressScore ?? 0}/100</p>
            </div>
            <div className="rounded-xl border border-border/70 bg-background/70 p-3">
              <p className="text-xs text-muted-foreground">Discipline Streak</p>
              <p className="text-lg font-semibold">{insights?.summary.disciplineStreakDays ?? 0} days</p>
            </div>
          </div>
          {insightsError ? (
            <p className="mt-3 text-sm text-destructive">{insightsError}</p>
          ) : null}
        </CardContent>
      </Card>

      <Tabs defaultValue="insights" className="space-y-4">
        <TabsList className="h-auto rounded-2xl border border-border/70 bg-card/70 p-1">
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="workspace">Workspace</TabsTrigger>
        </TabsList>

        <TabsContent value="insights" className="space-y-4">
          <section className="grid gap-4 lg:grid-cols-3">
            <Card className="border-border/70 bg-card/75 lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-base">Behavior Health</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Risk Alignment</span>
                  <span className="font-medium">{insights?.modules.riskAlignmentScore ?? 0}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Emotional Risk</span>
                  <span className="font-medium">{insights?.summary.emotionalRiskPercent ?? 0}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Check-In Rate</span>
                  <span className="font-medium">{insights?.modules.checkInRate ?? 0}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Loss Chasing Events</span>
                  <span className="font-medium">{insights?.summary.lossChasingEvents ?? 0}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/70 bg-card/75">
              <CardHeader>
                <CardTitle className="text-base">Live Prompt</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  {insights?.prompts.mindful ?? "Before executing: is this trade analysis-driven or emotion-driven?"}
                </p>
                <Button variant="secondary" className="w-full gap-2" onClick={() => setRefreshKey((value) => value + 1)}>
                  <PauseCircle className="h-4 w-4" />
                  Refresh Prompt
                </Button>
              </CardContent>
            </Card>
          </section>

          {(insights?.drivers?.length ?? 0) > 0 ? (
            <section className="rounded-2xl border border-border/70 bg-card/75 p-4 md:p-6">
              <div className="mb-3 flex items-center gap-2">
                <Gauge className="h-4 w-4 text-foreground" />
                <h3 className="text-base font-semibold">Top Risk Drivers</h3>
              </div>
              <div className="grid gap-2 md:grid-cols-2">
                {insights?.drivers.slice(0, 4).map((driver) => (
                  <div key={driver.key} className="rounded-xl border border-border/70 bg-background/60 p-3">
                    <p className="text-sm font-medium">{driver.key}</p>
                    <p className="text-xs text-muted-foreground">{driver.explanation}</p>
                    <Badge variant="secondary" className="mt-2">
                      Contribution: {driver.contribution}
                    </Badge>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          <section className="grid gap-4 lg:grid-cols-2">
            <Card className="border-border/70 bg-card/75">
              <CardHeader>
                <CardTitle className="text-base">Training & Reflection</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {trainingModules.map((module) => (
                  <div key={module.title} className="rounded-xl border border-border/70 bg-background/60 p-3">
                    <p className="text-sm font-medium">{module.title}</p>
                    <p className="text-xs text-muted-foreground">{module.description}</p>
                    <Badge variant="secondary" className="mt-2">{module.metric}</Badge>
                  </div>
                ))}
                {reflectionModules.map((module) => (
                  <div key={module.title} className="flex items-center justify-between rounded-xl border border-border/70 bg-background/60 p-3 text-sm">
                    <span className="text-muted-foreground">{module.metric}</span>
                    <span className="font-medium">{module.value}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-border/70 bg-card/75">
              <CardHeader>
                <CardTitle className="text-base">Achievements & Guidance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {gamificationModules.map((module) => (
                  <div key={module.badge} className="rounded-xl border border-border/70 bg-background/60 p-3">
                    <p className="text-sm font-medium flex items-center gap-2">
                      {module.achieved ? (
                        <CircleCheck className="h-4 w-4 text-foreground" />
                      ) : (
                        <CircleX className="h-4 w-4 text-muted-foreground" />
                      )}
                      {module.badge}
                    </p>
                    <p className="text-xs text-muted-foreground">{module.detail}</p>
                  </div>
                ))}
                <div className="rounded-xl border border-border/70 bg-background/60 p-3">
                  <p className="text-sm font-medium mb-1">Risk Guard</p>
                  <p className="text-xs text-muted-foreground">{insights?.prompts.riskGuard}</p>
                </div>
              </CardContent>
            </Card>
          </section>

          {recommendationList.length > 0 ? (
            <section className="rounded-2xl border border-border/70 bg-card/75 p-4 md:p-6">
              <div className="mb-3 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-foreground" />
                <h3 className="text-base font-semibold">AI Recommendations</h3>
              </div>
              <div className="space-y-2">
                {insights?.recommendationsDetailed?.length ? (
                  insights.recommendationsDetailed.map((recommendation, index) => (
                    <div key={`${recommendation.text}-${index}`} className="rounded-lg border border-border/60 p-3 bg-background/50">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm text-muted-foreground">{recommendation.text}</p>
                        <Badge
                          variant={recommendation.priority === "high" ? "destructive" : recommendation.priority === "medium" ? "secondary" : "outline"}
                        >
                          {recommendation.priority}
                        </Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  recommendationList.map((recommendation) => (
                    <p key={recommendation} className="text-sm text-muted-foreground">
                      {recommendation}
                    </p>
                  ))
                )}
              </div>
            </section>
          ) : null}
        </TabsContent>

        <TabsContent value="workspace" className="space-y-4">
          <section id="analysis-section" className="rounded-2xl border border-border/70 bg-card/75 p-4 md:p-6">
            <AnalysisOverview />
          </section>

          <section id="coach-section" className="rounded-2xl border border-border/70 bg-card/75 p-4 md:p-6">
            <div className="mb-4 flex items-center gap-2">
              <Bot className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">AI Trading Coach</h2>
            </div>
            <div className="h-[min(620px,68dvh)] min-h-[420px] sm:min-h-[500px]">
              <ChatWidget size="large" />
            </div>
          </section>

          <section id="mindset-section" className="rounded-2xl border border-border/70 bg-card/75 p-4 md:p-6">
            <div className="mb-4 flex items-center gap-2">
              <MessageSquareText className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">Mindset & Journal</h2>
            </div>
            <div className="h-[min(780px,calc(100dvh-220px))] min-h-[420px] sm:min-h-[640px]">
              <MindsetWidget size="large" />
            </div>
          </section>
        </TabsContent>
      </Tabs>
    </div>
  )
}
