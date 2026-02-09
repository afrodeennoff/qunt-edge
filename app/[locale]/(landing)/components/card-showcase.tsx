'use client'

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { StatsCard } from "@/components/ui/stats-card"
import { MediaCard } from "@/components/ui/media-card"
import { ActionCard } from "@/components/ui/action-card"
import { GlassCard } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, DollarSign, Users, ShoppingCart, BarChart3, Zap, Shield, CheckCircle2, AlertCircle } from "lucide-react"

export function CardShowcase() {
  return (
    <div className="w-full max-w-7xl mx-auto p-8 space-y-12">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Card Component System</h1>
        <p className="text-muted-foreground text-lg">
          Modern, accessible, and responsive card components with multiple variants
        </p>
      </div>

      {/* Card Variants */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold">Card Variants</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card variant="default" hover>
            <CardHeader>
              <CardTitle>Default Card</CardTitle>
              <CardDescription>Standard card with border and shadow</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                This is the default card variant with a subtle border and shadow effect.
              </p>
            </CardContent>
          </Card>

          <Card variant="glass" hover>
            <CardHeader>
              <CardTitle>Glass Card</CardTitle>
              <CardDescription>Glass morphism with backdrop blur</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Glass morphism effect with subtle transparency and blur.
              </p>
            </CardContent>
          </Card>

          <Card variant="elevated" hover>
            <CardHeader>
              <CardTitle>Elevated Card</CardTitle>
              <CardDescription>Higher elevation for emphasis</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Elevated card with stronger shadow for important content.
              </p>
            </CardContent>
          </Card>

          <Card variant="outlined" hover>
            <CardHeader>
              <CardTitle>Outlined Card</CardTitle>
              <CardDescription>2px border, no background</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Subtle boundary without background fill.
              </p>
            </CardContent>
          </Card>

          <Card variant="flat">
            <CardHeader>
              <CardTitle>Flat Card</CardTitle>
              <CardDescription>No border or shadow</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Minimal card with no visual decoration.
              </p>
            </CardContent>
          </Card>

          <GlassCard variant="strong" hover>
            <div className="p-4">
              <h3 className="font-semibold mb-2">Strong Glass</h3>
              <p className="text-sm text-muted-foreground">
                Enhanced glass effect with stronger backdrop.
              </p>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* Stats Cards */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold">Stats Cards</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Revenue"
            value="$125,430"
            icon={DollarSign}
            trend={{ value: 12.5, isPositive: true }}
            description="vs last month"
          />
          <StatsCard
            title="Active Users"
            value="8,543"
            icon={Users}
            trend={{ value: 8.2, isPositive: true }}
            description="vs last month"
          />
          <StatsCard
            title="New Orders"
            value="1,234"
            icon={ShoppingCart}
            trend={{ value: 3.1, isPositive: false }}
            description="vs last month"
          />
          <StatsCard
            title="Growth Rate"
            value="24.5%"
            icon={TrendingUp}
            description="Year over year"
          />
        </div>
      </section>

      {/* Action Cards */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold">Action Cards</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ActionCard
            title="Quick Setup"
            description="Get started in minutes with our easy setup wizard."
            icon={Zap}
            status="default"
            primaryAction={{
              label: "Start Setup",
              onClick: () => console.log("Setup clicked"),
              variant: "default"
            }}
            size="md"
          />
          <ActionCard
            title="Security Check"
            description="Your account security is up to date."
            icon={Shield}
            status="success"
            primaryAction={{
              label: "View Details",
              onClick: () => console.log("Security clicked"),
              variant: "outline"
            }}
            size="md"
          />
          <ActionCard
            title="Action Required"
            description="Please verify your email address to continue."
            icon={AlertCircle}
            status="warning"
            primaryAction={{
              label: "Verify Now",
              onClick: () => console.log("Verify clicked"),
              variant: "default"
            }}
            secondaryAction={{
              label: "Later",
              onClick: () => console.log("Later clicked")
            }}
            size="md"
          />
        </div>
      </section>

      {/* Media Cards */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold">Media Cards</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <MediaCard
            image="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop"
            title="Mountain Landscape"
            subtitle="Nature Photography"
            description="A breathtaking view of snow-capped mountains during golden hour."
            badges={[{ label: "Featured" }, { label: "Nature", variant: "secondary" }]}
            actions={
              <div className="flex gap-2 w-full">
                <Button variant="outline" className="flex-1">Like</Button>
                <Button className="flex-1">View</Button>
              </div>
            }
            imageAspect="video"
            onClick={() => console.log("Card clicked")}
          />
          <MediaCard
            image="https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop"
            title="Modern Office"
            subtitle="Workspace Design"
            description="Clean and minimalist office space perfect for productivity."
            badges={[{ label: "New", variant: "default" }]}
            actions={
              <div className="flex gap-2 w-full">
                <Button variant="outline" className="flex-1">Save</Button>
                <Button className="flex-1">Explore</Button>
              </div>
            }
            imageAspect="video"
          />
          <MediaCard
            image="https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=400&fit=crop"
            title="Team Collaboration"
            description="Working together to achieve amazing results."
            badges={[{ label: "Business" }]}
            imageAspect="square"
          />
        </div>
      </section>

      {/* Card Sizes */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold">Card Sizes</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          <Card size="sm" hover>
            <CardHeader size="sm">
              <CardTitle size="sm">Small Card</CardTitle>
              <CardDescription>Compact spacing</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">Perfect for dense information displays.</p>
            </CardContent>
          </Card>

          <Card size="md" hover>
            <CardHeader size="md">
              <CardTitle size="md">Medium Card</CardTitle>
              <CardDescription>Default spacing</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Balanced spacing for most use cases. This is the default size.</p>
            </CardContent>
          </Card>

          <Card size="lg" hover>
            <CardHeader size="lg">
              <CardTitle size="lg">Large Card</CardTitle>
              <CardDescription>Generous spacing</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-base">Extra space for emphasis and readability.</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Interactive Cards */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold">Interactive States</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card hover clickable>
            <CardHeader>
              <CardTitle>Hover & Clickable</CardTitle>
              <CardDescription>Try hovering and clicking</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                This card has both hover effects and clickable interaction.
              </p>
            </CardContent>
          </Card>

          <GlassCard variant="default" hover clickable>
            <div className="p-6 space-y-2">
              <h3 className="font-semibold">Interactive Glass Card</h3>
              <p className="text-sm text-muted-foreground">
                Glass morphism with smooth hover and click animations.
              </p>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* Composition Example */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold">Card Composition</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card variant="elevated" hover>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Analytics Dashboard</CardTitle>
                <Badge>Pro</Badge>
              </div>
              <CardDescription>Real-time performance metrics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Revenue</span>
                  <span className="font-medium">$45,231</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Growth</span>
                  <span className="font-medium text-green-500">+12.5%</span>
                </div>
              </div>
              <div className="h-32 bg-muted rounded-lg flex items-center justify-center">
                <span className="text-muted-foreground text-sm">Chart Placeholder</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">View Details</Button>
            </CardFooter>
          </Card>

          <Card variant="glass" hover>
            <CardHeader>
              <CardTitle>User Profile</CardTitle>
              <CardDescription>Account information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">John Doe</p>
                  <p className="text-sm text-muted-foreground">john@example.com</p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Member since</span>
                  <span>Jan 2024</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Plan</span>
                  <Badge variant="secondary">Enterprise</Badge>
                </div>
              </div>
            </CardContent>
            <CardFooter className="gap-2">
              <Button variant="outline" className="flex-1">Edit</Button>
              <Button className="flex-1">Share</Button>
            </CardFooter>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <div className="text-center text-sm text-muted-foreground">
        <p>Card Component System - Built with accessibility and responsive design in mind</p>
      </div>
    </div>
  )
}
