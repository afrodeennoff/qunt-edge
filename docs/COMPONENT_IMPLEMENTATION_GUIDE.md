# How to Implement shadcn/ui Components - Step by Step Guide

This guide shows you **how to actually implement** shadcn/ui components in your Next.js project, with real examples from your codebase.

---

## 🎯 Step 1: Understand the Implementation Pattern

All shadcn/ui components follow this pattern:

```tsx
// 1. Import the component
import { ComponentName } from "@/components/ui/component-name"

// 2. Use the component with props
<ComponentName
  variant="variant-name"  // Optional variant
  size="size-name"         // Optional size
  className="custom-classes" // Custom classes
  {...standardProps}          // Standard HTML props
>
  {/* Children content */}
</ComponentName>
```

---

## 📦 Step 2: See Real Examples from Your Project

### ✅ Example 1: Tabs Component (from `/app/[locale]/dashboard/page.tsx`)

**How it's implemented:**

```tsx
// Import from components/ui
import { Tabs, TabsContent } from "@/components/ui/tabs"

export default function Home() {
  const activeTab = searchParams.get("tab") || "widgets"

  return (
    <Tabs value={activeTab} className="w-full h-full relative z-10">
      <TabsContent value="table" className="mt-0 h-[calc(100vh-150px)]">
        <TradeTableReview />
      </TabsContent>

      <TabsContent value="accounts" className="mt-0">
        <AccountsOverview size="large" surface="embedded" />
      </TabsContent>

      <TabsContent value="widgets" className="mt-0">
        <WidgetCanvas />
      </TabsContent>
    </Tabs>
  )
}
```

**Key points:**
- Import from `@/components/ui/tabs`
- Use `value` prop to control active tab
- Use `TabsContent` for each tab panel
- Add custom `className` for styling

---

### ✅ Example 2: Form Components (from `/app/[locale]/(authentication)/components/user-auth-form.tsx`)

**How it's implemented:**

```tsx
// Import form components
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

// Use Input
<Input
  placeholder="Enter your email"
  type="email"
  className="bg-background"
/>

// Use Button
<Button variant="default" size="sm" disabled={isLoading}>
  Sign In
</Button>

// Use Form with validation
<FormField
  control={form.control}
  name="email"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Email</FormLabel>
      <FormControl>
        <Input placeholder="user@example.com" {...field} />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>

// Use Tabs
<Tabs value={tab} onValueChange={setTab}>
  <TabsList>
    <TabsTrigger value="email">Email</TabsTrigger>
    <TabsTrigger value="password">Password</TabsTrigger>
  </TabsList>
  <TabsContent value="email">
    {/* Email form content */}
  </TabsContent>
  <TabsContent value="password">
    {/* Password form content */}
  </TabsContent>
</Tabs>

// Use Badge
<Badge variant="secondary">New Feature</Badge>
```

**Key points:**
- Form components work with `react-hook-form`
- `FormField` uses a render prop for custom form fields
- `FormControl` wraps the actual input
- `FormMessage` shows validation errors
- `Tabs` uses controlled state with `value` and `onValueChange`

---

### ✅ Example 3: Sheet Component (from `/app/[locale]/dashboard/components/add-widget-sheet.tsx`)

**How it's implemented:**

```tsx
// Import Sheet components
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

// Use Sheet
<Sheet>
  <SheetTrigger asChild>
    <Button size="icon">
      <Plus className="w-4 h-4" />
    </Button>
  </SheetTrigger>
  <SheetContent>
    <SheetHeader>
      <SheetTitle>Add Widget</SheetTitle>
    </SheetHeader>
    {/* Sheet content */}
  </SheetContent>
</Sheet>
```

**Key points:**
- `SheetTrigger` uses `asChild` to render as Button
- `SheetContent` contains the actual sheet content
- `SheetHeader` and `SheetTitle` for consistent styling

---

## 🚀 Step 3: Implement Your Own Components

### Example 1: Simple Form with Input and Button

```tsx
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function SimpleForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log({ email, password })
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Sign In</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <Button type="submit" className="w-full">
            Sign In
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
```

### Example 2: Data Table with Badge and Actions

```tsx
"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal } from "lucide-react"

interface Trade {
  id: string
  symbol: string
  side: "long" | "short"
  pnl: number
  status: "win" | "loss" | "breakeven"
}

const trades: Trade[] = [
  { id: "1", symbol: "ES", side: "long", pnl: 500, status: "win" },
  { id: "2", symbol: "NQ", side: "short", pnl: -300, status: "loss" },
  { id: "3", symbol: "CL", side: "long", pnl: 0, status: "breakeven" },
]

export function TradesTable() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Symbol</TableHead>
          <TableHead>Side</TableHead>
          <TableHead>P&L</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {trades.map((trade) => (
          <TableRow key={trade.id}>
            <TableCell className="font-medium">{trade.symbol}</TableCell>
            <TableCell>{trade.side}</TableCell>
            <TableCell className={trade.pnl >= 0 ? "text-green-600" : "text-red-600"}>
              ${trade.pnl}
            </TableCell>
            <TableCell>
              <Badge
                variant={trade.status === "win" ? "default" : trade.status === "loss" ? "destructive" : "secondary"}
              >
                {trade.status}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Edit</DropdownMenuItem>
                  <DropdownMenuItem>Delete</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
```

### Example 3: Stats Cards Dashboard

```tsx
"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatsCard } from "@/components/ui/stats-card"
import { DollarSign, TrendingUp, TrendingDown, Users } from "lucide-react"

export function StatsDashboard() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatsCard
        title="Total Revenue"
        value="$45,231.89"
        icon={DollarSign}
        trend={{
          value: "+20.1%",
          direction: "up",
          icon: TrendingUp,
        }}
      />

      <StatsCard
        title="Net Profit"
        value="$12,500"
        icon={TrendingUp}
        trend={{
          value: "+15.3%",
          direction: "up",
          icon: TrendingUp,
        }}
      />

      <StatsCard
        title="Win Rate"
        value="68%"
        icon={Users}
        trend={{
          value: "-2.1%",
          direction: "down",
          icon: TrendingDown,
        }}
      />

      <StatsCard
        title="Total Trades"
        value="1,234"
        icon={Users}
        trend={{
          value: "+5.2%",
          direction: "up",
          icon: TrendingUp,
        }}
      />
    </div>
  )
}
```

### Example 4: Interactive Card with Status

```tsx
"use client"

import { Card, CardContent, CardHeader, CardStatusDot, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export function TradeCard({ trade }: { trade: any }) {
  return (
    <Card
      variant="elevated"
      hover
      className="transition-all"
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{trade.symbol}</CardTitle>
          <CardStatusDot tone="live" label="Live" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Side</span>
            <Badge variant={trade.side === "long" ? "default" : "secondary"}>
              {trade.side}
            </Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">P&L</span>
            <span className={trade.pnl >= 0 ? "text-green-600" : "text-red-600"}>
              ${trade.pnl}
            </span>
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <Button variant="outline" className="flex-1">
            Edit
          </Button>
          <Button variant="default" className="flex-1">
            Close
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
```

---

## 📋 Step 4: Common Implementation Patterns

### Pattern 1: Controlled Components

```tsx
// Most components are controlled
const [value, setValue] = useState("default")

<Tabs value={value} onValueChange={setValue}>
  <TabsContent value="default">Tab 1</TabsContent>
  <TabsContent value="other">Tab 2</TabsContent>
</Tabs>

// Or with custom state
const [isOpen, setIsOpen] = useState(false)

<Sheet open={isOpen} onOpenChange={setIsOpen}>
  <SheetContent>Content</SheetContent>
</Sheet>
```

### Pattern 2: Variants and Sizes

```tsx
// Button variants
<Button variant="default">Default</Button>
<Button variant="destructive">Destructive</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>

// Button sizes
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>
<Button size="icon"><Icon /></Button>

// Card variants
<Card variant="default">Default</Card>
<Card variant="glass">Glass</Card>
<Card variant="elevated">Elevated</Card>
<Card variant="outlined">Outlined</Card>
<Card variant="flat">Flat</Card>
<Card variant="matte">Matte</Card>
```

### Pattern 3: Custom Styling with cn()

```tsx
import { cn } from "@/lib/utils"

// Always use cn() for custom classes
<Button className={cn(
  "base-classes",
  condition && "conditional-class",
  className
)}>
  Click me
</Button>

// Example: Dynamic styling
<Button className={cn(
  "w-full",
  isLoading && "opacity-50 cursor-not-allowed",
  isSuccess && "bg-green-600 hover:bg-green-700"
)}>
  {isLoading ? "Loading..." : "Submit"}
</Button>
```

### Pattern 4: Sub-components

```tsx
// Many components have sub-components
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>
    Content
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>

<Dialog>
  <DialogTrigger asChild>
    <Button>Open</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Title</DialogTitle>
      <DialogDescription>Description</DialogDescription>
    </DialogHeader>
    <div>Content</div>
    <DialogFooter>
      <Button>Confirm</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### Pattern 5: asChild Prop (Composition)

```tsx
// Render component as child element
<Button asChild>
  <Link href="/dashboard">
    Go to Dashboard
  </Link>
</Button>

<DropdownMenuTrigger asChild>
  <Button variant="ghost">
    <MoreHorizontal />
  </Button>
</DropdownMenuTrigger>
```

---

## 🎨 Step 5: Styling and Theming

### Using Theme Colors

Your project uses CSS variables for theming. Use them in your components:

```tsx
// Background colors
className="bg-background"
className="bg-card"
className="bg-primary"
className="bg-secondary"
className="bg-muted"
className="bg-accent"
className="bg-destructive"

// Text colors
className="text-foreground"
className="text-primary-foreground"
className="text-secondary-foreground"
className="text-muted-foreground"
className="text-accent-foreground"

// Border colors
className="border-border"
className="border-input"
className="focus:ring-ring"
```

### Custom Styling Examples

```tsx
// Gradient button
<Button className="bg-gradient-to-r from-purple-500 to-pink-500">
  Gradient Button
</Button>

// Glass card
<Card className="bg-white/10 backdrop-blur-md border-white/20">
  Glass Effect
</Card>

// Custom hover effect
<Button className="hover:scale-105 transition-transform">
  Scale on Hover
</Button>

// Responsive spacing
<Card className="p-4 sm:p-6 lg:p-8">
  Responsive Padding
</Card>
```

---

## 🔧 Step 6: Combining Multiple Components

### Example: User Settings Page

```tsx
"use client"

import { useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

export function UserSettings() {
  const [notifications, setNotifications] = useState(true)
  const [email, setEmail] = useState("user@example.com")
  const [theme, setTheme] = useState("dark")

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Settings</CardTitle>
          <CardDescription>
            Manage your account settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="profile">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="preferences">Preferences</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive email notifications
                  </p>
                </div>
                <Switch
                  checked={notifications}
                  onCheckedChange={setNotifications}
                />
              </div>
            </TabsContent>

            <TabsContent value="preferences" className="space-y-4">
              <div className="space-y-2">
                <Label>Theme</Label>
                <Select value={theme} onValueChange={setTheme}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <Badge>Pro</Badge>
                <span className="text-sm text-muted-foreground">
                  Advanced settings available
                </span>
              </div>
            </TabsContent>
          </Tabs>

          <Separator className="my-4" />

          <div className="flex justify-end gap-2">
            <Button variant="outline">Cancel</Button>
            <Button>Save Changes</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
```

---

## 📱 Step 7: Responsive Design Patterns

```tsx
// Responsive grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <Card>Item 1</Card>
  <Card>Item 2</Card>
  <Card>Item 3</Card>
</div>

// Responsive buttons
<Button size="sm" className="xs:w-auto sm:w-24 lg:w-32">
  Responsive Width
</Button>

// Responsive cards
<Card className="p-4 sm:p-6 lg:p-8">
  Responsive padding
</Card>

// Hide on mobile
<div className="hidden md:block">
  Desktop only content
</div>

// Show on mobile
<div className="block md:hidden">
  Mobile only content
</div>
```

---

## ✅ Step 8: Testing Your Implementation

### Checklist for Component Implementation

- [ ] Import from correct path (`@/components/ui/component-name`)
- [ ] Use `cn()` for className merging
- [ ] Pass required props (value, onChange, etc.)
- [ ] Add accessibility attributes (aria-label, htmlFor)
- [ ] Test on mobile and desktop
- [ ] Test dark mode (if applicable)
- [ ] Test variant changes
- [ ] Test size changes
- [ ] Test with dynamic data
- [ ] Add loading states if needed
- [ ] Add error states if needed

---

## 🎯 Quick Reference: Common Props

| Component | Key Props | Use Case |
|------------|-------------|-----------|
| Button | variant, size, asChild | Actions, links |
| Input | type, placeholder, value, onChange | Text input |
| Card | variant, size, hover, clickable, status | Content containers |
| Tabs | value, onValueChange | Tabbed navigation |
| Form | control, name, render | Form fields with validation |
| Table | - | Data tables |
| Badge | variant | Status indicators |
| Dialog | open, onOpenChange | Modal dialogs |
| Sheet | side, open, onOpenChange | Side panels |
| DropdownMenu | - | Context menus |
| Select | value, onValueChange | Dropdown selects |
| Switch | checked, onCheckedChange | Toggles |

---

## 🚀 Next Steps

1. **Start Simple**: Use Button, Input, and Card for basic UIs
2. **Add Complexity**: Integrate Tabs, Dialog, and DropdownMenu
3. **Advanced Features**: Use Form components with validation, Charts, and Data Tables
4. **Customize**: Add variants, sizes, and custom styling
5. **Test**: Always test on mobile and desktop

---

## 💡 Pro Tips

1. **Always use `cn()`** for merging classes
2. **Use TypeScript** for type safety
3. **Test accessibility** with keyboard navigation
4. **Check responsive** behavior on different screen sizes
5. **Use variants** instead of custom classes when possible
6. **Combine components** to build complex UIs
7. **Follow existing patterns** in your codebase
8. **Keep components small** and focused

---

## 📚 Real-World Example: Dashboard Widget

```tsx
"use client"

import { useState } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown } from "lucide-react"

export function PerformanceWidget() {
  const [timeframe, setTimeframe] = useState("1d")
  const [isLoading, setIsLoading] = useState(false)

  const data = {
    "1d": { value: "+2.5%", trend: "up" },
    "1w": { value: "+8.3%", trend: "up" },
    "1m": { value: "-1.2%", trend: "down" },
  }

  const handleRefresh = async () => {
    setIsLoading(true)
    // Fetch data...
    setTimeout(() => setIsLoading(false), 1000)
  }

  const current = data[timeframe as keyof typeof data]

  return (
    <Card className="col-span-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>Performance</CardTitle>
        <div className="flex items-center gap-2">
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-[100px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1d">1 Day</SelectItem>
              <SelectItem value="1w">1 Week</SelectItem>
              <SelectItem value="1m">1 Month</SelectItem>
            </SelectContent>
          </Select>
          <Button
            size="icon"
            variant="outline"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="w-4 h-4 animate-spin rounded-full border-2 border-transparent border-t-current" />
            ) : (
              <TrendingUp className="w-4 h-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Returns</p>
            <p className="text-2xl font-bold">
              {current.value}
            </p>
          </div>
          <Badge
            variant={current.trend === "up" ? "default" : "destructive"}
            className="flex items-center gap-1"
          >
            {current.trend === "up" ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            {current.trend}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}
```

---

## 🎉 Summary

To implement shadcn/ui components:

1. **Import** from `@/components/ui/component-name`
2. **Use** the component with appropriate props
3. **Customize** with `className` using `cn()`
4. **Combine** components to build complex UIs
5. **Test** thoroughly on all devices

All 50+ components follow similar patterns. Once you learn one, you know them all!

Happy building! 🚀
