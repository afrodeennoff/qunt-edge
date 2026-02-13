# shadcn/ui Components - Complete Usage Guide

This guide shows you how to use all 50+ shadcn/ui components in your Next.js project.

## 📦 Project Setup

Your project already has shadcn/ui components installed in `/components/ui/`. The setup includes:
- **Next.js 16** with App Router
- **TypeScript** for type safety
- **Tailwind CSS v4** for styling
- **Radix UI** primitives for accessibility
- **class-variance-authority (CVA)** for component variants

## 🎯 Core Utilities

### The `cn()` Function

All components use the `cn()` utility for merging Tailwind classes:

```tsx
import { cn } from "@/lib/utils"

// Merge classes with proper precedence
className={cn("base-classes", "conditional-classes", className)}
```

**Location:** `/lib/utils.ts:9`

### Import Pattern

```tsx
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
```

---

## 🧩 Component Categories

### 1️⃣ Form & Input Components

#### **Button** (`/components/ui/button.tsx`)

The most versatile component with multiple variants and sizes.

```tsx
import { Button } from "@/components/ui/button"

// Basic variants
<Button>Default</Button>
<Button variant="destructive">Delete</Button>
<Button variant="outline">Cancel</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>
<Button variant="mono">Mono</Button>

// Sizes
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>
<Button size="icon"><Icon /></Button>

// With icons
<Button>
  <Upload className="w-4 h-4" />
  Upload File
</Button>

// As child (renders as Link)
<Button asChild>
  <Link href="/dashboard">Go to Dashboard</Link>
</Button>

// Disabled state
<Button disabled>Disabled</Button>
```

**Available Props:**
- `variant`: default, destructive, outline, secondary, ghost, link, mono
- `size`: sm, default, lg, icon
- `asChild`: boolean (for composition)
- All standard HTML button attributes

---

#### **Input** (`/components/ui/input.tsx`)

```tsx
import { Input } from "@/components/ui/input"

<Input placeholder="Enter your email" type="email" />
<Input disabled value="Disabled input" />
<Input className="bg-background" />
```

---

#### **Textarea** (`/components/ui/textarea.tsx`)

```tsx
import { Textarea } from "@/components/ui/textarea"

<Textarea placeholder="Enter your message" rows={5} />
```

---

#### **Label** (`/components/ui/label.tsx`)

```tsx
import { Label } from "@/components/ui/label"

<Label htmlFor="email">Email</Label>
<Input id="email" />
```

---

#### **Select** (`/components/ui/select.tsx`)

```tsx
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

<Select>
  <SelectTrigger className="w-[180px]">
    <SelectValue placeholder="Select option" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">Option 1</SelectItem>
    <SelectItem value="option2">Option 2</SelectItem>
    <SelectItem value="option3">Option 3</SelectItem>
  </SelectContent>
</Select>
```

---

#### **Checkbox** (`/components/ui/checkbox.tsx`)

```tsx
import { Checkbox } from "@/components/ui/checkbox"

<Checkbox id="terms" />
<Label htmlFor="terms">Accept terms and conditions</Label>
```

---

#### **Switch** (`/components/ui/switch.tsx`)

```tsx
import { Switch } from "@/components/ui/switch"

<Switch id="airplane-mode" />
<Label htmlFor="airplane-mode">Airplane Mode</Label>
```

---

#### **Radio Group** (`/components/ui/radio-group.tsx`)

```tsx
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

<RadioGroup defaultValue="option1">
  <RadioGroupItem value="option1" id="option1" />
  <Label htmlFor="option1">Option 1</Label>

  <RadioGroupItem value="option2" id="option2" />
  <Label htmlFor="option2">Option 2</Label>
</RadioGroup>
```

---

#### **Slider** (`/components/ui/slider.tsx`)

```tsx
import { Slider } from "@/components/ui/slider"

<Slider defaultValue={[50]} max={100} step={1} />
<Slider defaultValue={[20, 80]} max={100} step={1} /> {/* Range */}
```

---

#### **Input OTP** (`/components/ui/input-otp.tsx`)

```tsx
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"

<InputOTP maxLength={6}>
  <InputOTPGroup>
    <InputOTPSlot index={0} />
    <InputOTPSlot index={1} />
    <InputOTPSlot index={2} />
    <InputOTPSlot index={3} />
    <InputOTPSlot index={4} />
    <InputOTPSlot index={5} />
  </InputOTPGroup>
</InputOTP>
```

---

### 2️⃣ Layout & Structure

#### **Card** (`/components/ui/card.tsx`)

Advanced card component with multiple variants and interactive features.

```tsx
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  CardStatusDot,
} from "@/components/ui/card"

// Basic card
<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Card content goes here</p>
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>

// With variants
<Card variant="glass">Glass effect</Card>
<Card variant="elevated">Elevated with shadow</Card>
<Card variant="outlined">Outlined border</Card>
<Card variant="flat">Flat transparent</Card>
<Card variant="matte">Matte finish</Card>

// With hover effect
<Card hover>
  Hover me
</Card>

// Clickable card
<Card clickable onClick={() => console.log("clicked")}>
  Clickable card
</Card>

// With size
<Card size="sm">Small padding</Card>
<Card size="md">Medium padding</Card>
<Card size="lg">Large padding</Card>

// With status indicator
<Card status="live">
  <CardHeader>
    <CardTitle>Live Status</CardTitle>
  </CardHeader>
</Card>

// Status dot component
<CardStatusDot tone="live" label="Live" />
<CardStatusDot tone="synced" label="Synced" />
<CardStatusDot tone="idle" label="Idle" />
<CardStatusDot tone="error" label="Error" />
```

**Card Variants:**
- `default`: Standard card with border
- `glass`: Glass morphism effect
- `elevated`: Elevated with shadow
- `outlined`: Thick border
- `flat`: Transparent
- `matte`: Matte finish panel

**Card Sizes:**
- `sm`: Small padding (p-3)
- `md`: Medium padding (p-6) - default
- `lg`: Large padding (p-8)

**Interactive Options:**
- `hover`: Hover lift effect
- `clickable`: Clickable with focus ring
- `status`: Status indicator (live, synced, idle, error)

---

#### **Dialog** (`/components/ui/dialog.tsx`)

```tsx
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

<Dialog>
  <DialogTrigger asChild>
    <Button>Open Dialog</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Dialog Title</DialogTitle>
      <DialogDescription>Dialog description</DialogDescription>
    </DialogHeader>
    <div>Dialog content</div>
    <DialogFooter>
      <Button>Cancel</Button>
      <Button>Confirm</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

---

#### **Sheet** (`/components/ui/sheet.tsx`)

```tsx
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

<Sheet>
  <SheetTrigger asChild>
    <Button>Open Sheet</Button>
  </SheetTrigger>
  <Content side="right"> {/* top, bottom, left, right */}
    <SheetHeader>
      <SheetTitle>Sheet Title</SheetTitle>
      <SheetDescription>Sheet description</SheetDescription>
    </SheetHeader>
    <div>Sheet content</div>
  </SheetContent>
</Sheet>
```

---

#### **Drawer** (`/components/ui/drawer.tsx`)

```tsx
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"

<Drawer>
  <DrawerTrigger>Open Drawer</DrawerTrigger>
  <DrawerContent>
    <DrawerHeader>
      <DrawerTitle>Drawer Title</DrawerTitle>
      <DrawerDescription>Drawer description</DrawerDescription>
    </DrawerHeader>
    <div>Drawer content</div>
    <DrawerFooter>
      <DrawerClose>
        <Button variant="outline">Cancel</Button>
      </DrawerClose>
      <Button>Confirm</Button>
    </DrawerFooter>
  </DrawerContent>
</Drawer>
```

---

#### **Accordion** (`/components/ui/accordion.tsx`)

```tsx
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

<Accordion type="single" collapsible>
  <AccordionItem value="item-1">
    <AccordionTrigger>Is it accessible?</AccordionTrigger>
    <AccordionContent>
      Yes. It adheres to the WAI-ARIA design pattern.
    </AccordionContent>
  </AccordionItem>

  <AccordionItem value="item-2">
    <AccordionTrigger>Is it styled?</AccordionTrigger>
    <AccordionContent>
      Yes. It comes with default styles.
    </AccordionContent>
  </AccordionItem>
</Accordion>
```

---

#### **Tabs** (`/components/ui/tabs.tsx`)

```tsx
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

<Tabs defaultValue="tab1">
  <TabsList>
    <TabsTrigger value="tab1">Tab 1</TabsTrigger>
    <TabsTrigger value="tab2">Tab 2</TabsTrigger>
    <TabsTrigger value="tab3">Tab 3</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">Content 1</TabsContent>
  <TabsContent value="tab2">Content 2</TabsContent>
  <TabsContent value="tab3">Content 3</TabsContent>
</Tabs>
```

---

#### **Separator** (`/components/ui/separator.tsx`)

```tsx
import { Separator } from "@/components/ui/separator"

<Separator /> {/* Horizontal */}
<Separator orientation="vertical" className="h-8" /> {/* Vertical */}
```

---

#### **Scroll Area** (`/components/ui/scroll-area.tsx`)

```tsx
import { ScrollArea } from "@/components/ui/scroll-area"

<ScrollArea className="h-[200px] w-[350px]">
  <div>Content that scrolls...</div>
</ScrollArea>
```

---

#### **Resizable** (`/components/ui/resizable.tsx`)

```tsx
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"

<ResizablePanelGroup direction="horizontal">
  <ResizablePanel defaultSize={50}>Panel 1</ResizablePanel>
  <ResizableHandle />
  <ResizablePanel defaultSize={50}>Panel 2</ResizablePanel>
</ResizablePanelGroup>
```

---

### 3️⃣ Navigation

#### **Navigation Menu** (`/components/ui/navigation-menu.tsx`)

```tsx
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"

<NavigationMenu>
  <NavigationMenuList>
    <NavigationMenuItem>
      <NavigationMenuTrigger>Menu Item</NavigationMenuTrigger>
      <NavigationMenuContent>
        <NavigationMenuLink href="/link">Link</NavigationMenuLink>
      </NavigationMenuContent>
    </NavigationMenuItem>
  </NavigationMenuList>
</NavigationMenu>
```

---

#### **Pagination** (`/components/ui/pagination.tsx`)

```tsx
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

<Pagination>
  <PaginationContent>
    <PaginationItem>
      <PaginationPrevious href="#" />
    </PaginationItem>
    <PaginationItem>
      <PaginationLink href="#">1</PaginationLink>
    </PaginationItem>
    <PaginationItem>
      <PaginationLink href="#" isActive>2</PaginationLink>
    </PaginationItem>
    <PaginationItem>
      <PaginationLink href="#">3</PaginationLink>
    </PaginationItem>
    <PaginationItem>
      <PaginationEllipsis />
    </PaginationItem>
    <PaginationItem>
      <PaginationNext href="#" />
    </PaginationItem>
  </PaginationContent>
</Pagination>
```

---

#### **Sidebar** (`/components/ui/sidebar.tsx`)

Complex sidebar component with context and keyboard shortcuts.

```tsx
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

function App() {
  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div>Logo</div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/dashboard">
                      <Home className="w-4 h-4" />
                      <span>Dashboard</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <div>User info</div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <SidebarTrigger />
        <main>Main content</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
```

**Keyboard Shortcut:** `Ctrl/Cmd + B` to toggle sidebar

---

### 4️⃣ Feedback & Overlays

#### **Alert** (`/components/ui/alert.tsx`)

```tsx
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

<Alert>
  <AlertTitle>Alert Title</AlertTitle>
  <AlertDescription>Alert description</AlertDescription>
</Alert>

<Alert variant="destructive">
  <AlertTitle>Error</AlertTitle>
  <AlertDescription>Something went wrong</AlertDescription>
</Alert>
```

---

#### **Alert Dialog** (`/components/ui/alert-dialog.tsx`)

```tsx
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

<AlertDialog>
  <AlertDialogTrigger asChild>
    <Button variant="destructive">Delete Account</Button>
  </AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
      <AlertDialogDescription>
        This action cannot be undone.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction>Delete</AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

---

#### **Badge** (`/components/ui/badge.tsx`)

```tsx
import { Badge } from "@/components/ui/badge"

<Badge>Default</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="destructive">Destructive</Badge>
<Badge variant="outline">Outline</Badge>
```

---

#### **Progress** (`/components/ui/progress.tsx`)

```tsx
import { Progress } from "@/components/ui/progress"

<Progress value={33} />
<Progress value={66} className="w-[60%]" />
```

---

#### **Skeleton** (`/components/ui/skeleton.tsx`)

```tsx
import { Skeleton } from "@/components/ui/skeleton"

<Skeleton className="h-12 w-12 rounded-full" />
<Skeleton className="h-4 w-[250px]" />
<Skeleton className="h-4 w-[200px]" />
```

---

#### **Sonner (Toast)** (`/components/ui/sonner.tsx`)

```tsx
import { toast } from "sonner"
import { Toaster } from "@/components/ui/sonner"

// In your root layout
<Toaster />

// Usage
toast("Event has been created")
toast.success("Event created successfully")
toast.error("Event creation failed")
toast.info("New message received")
toast.warning("Warning message")
toast.promise(promise, {
  loading: "Loading...",
  success: "Success!",
  error: "Error!",
})
```

---

#### **Tooltip** (`/components/ui/tooltip.tsx`)

```tsx
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

<TooltipProvider>
  <Tooltip>
    <TooltipTrigger asChild>
      <Button>Hover me</Button>
    </TooltipTrigger>
    <TooltipContent>
      <p>Tooltip content</p>
    </TooltipContent>
  </Tooltip>
</TooltipProvider>
```

---

#### **Popover** (`/components/ui/popover.tsx`)

```tsx
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

<Popover>
  <PopoverTrigger asChild>
    <Button>Open Popover</Button>
  </PopoverTrigger>
  <PopoverContent>
    <div>Popover content</div>
  </PopoverContent>
</Popover>
```

---

#### **Hover Card** (`/components/ui/hover-card.tsx`)

```tsx
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"

<HoverCard>
  <HoverCardTrigger asChild>
    <Link href="/user">@user</Link>
  </HoverCardTrigger>
  <HoverCardContent>
    <div>User information</div>
  </HoverCardContent>
</HoverCard>
```

---

### 5️⃣ Data Display

#### **Table** (`/components/ui/table.tsx`)

```tsx
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

<Table>
  <TableCaption>A list of your recent invoices.</TableCaption>
  <TableHeader>
    <TableRow>
      <TableHead>Invoice</TableHead>
      <TableHead>Status</TableHead>
      <TableHead>Amount</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>INV001</TableCell>
      <TableCell>Paid</TableCell>
      <TableCell>$250.00</TableCell>
    </TableRow>
  </TableBody>
  <TableFooter>
    <TableRow>
      <TableCell colSpan={3}>Total</TableCell>
      <TableCell>$1,000.00</TableCell>
    </TableRow>
  </TableFooter>
</Table>
```

---

#### **Avatar** (`/components/ui/avatar.tsx`)

```tsx
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

<Avatar>
  <AvatarImage src="https://github.com/shadcn.png" />
  <AvatarFallback>CN</AvatarFallback>
</Avatar>
```

---

#### **Calendar** (`/components/ui/calendar.tsx`)

```tsx
import { Calendar } from "@/components/ui/calendar"

<Calendar
  mode="single"
  selected={date}
  onSelect={setDate}
  className="rounded-md border"
/>
```

---

#### **Carousel** (`/components/ui/carousel.tsx`)

```tsx
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

<Carousel>
  <CarouselContent>
    <CarouselItem>Slide 1</CarouselItem>
    <CarouselItem>Slide 2</CarouselItem>
    <CarouselItem>Slide 3</CarouselItem>
  </CarouselContent>
  <CarouselPrevious />
  <CarouselNext />
</Carousel>
```

---

#### **Chart** (`/components/ui/chart.tsx`)

```tsx
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, Line, LineChart } from "recharts"

const data = [
  { month: "January", desktop: 186, mobile: 80 },
  { month: "February", desktop: 305, mobile: 200 },
  // ...
]

<ChartContainer config={chartConfig} className="min-h-[200px] w-full">
  <BarChart data={data}>
    <XAxis dataKey="month" />
    <ChartTooltip content={<ChartTooltipContent />} />
    <Bar dataKey="desktop" fill="var(--color-desktop)" />
  </BarChart>
</ChartContainer>
```

---

#### **Command (Cmd+K)** (`/components/ui/command.tsx`)

```tsx
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command"

<Command>
  <CommandInput placeholder="Type a command or search..." />
  <CommandList>
    <CommandEmpty>No results found.</CommandEmpty>
    <CommandGroup heading="Suggestions">
      <CommandItem>Calendar</CommandItem>
      <CommandItem>Search</CommandItem>
    </CommandGroup>
  </CommandList>
</Command>
```

---

#### **Context Menu** (`/components/ui/context-menu.tsx`)

```tsx
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"

<ContextMenu>
  <ContextMenuTrigger>Right click me</ContextMenuTrigger>
  <ContextMenuContent>
    <ContextMenuItem>Copy</ContextMenuItem>
    <ContextMenuItem>Paste</ContextMenuItem>
    <ContextMenuSeparator />
    <ContextMenuItem>Delete</ContextMenuItem>
  </ContextMenuContent>
</ContextMenu>
```

---

#### **Dropdown Menu** (`/components/ui/dropdown-menu.tsx`)

```tsx
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button>Open Menu</Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuLabel>My Account</DropdownMenuLabel>
    <DropdownMenuSeparator />
    <DropdownMenuGroup>
      <DropdownMenuItem>Profile</DropdownMenuItem>
      <DropdownMenuItem>Settings</DropdownMenuItem>
    </DropdownMenuGroup>
  </DropdownMenuContent>
</DropdownMenu>
```

---

### 6️⃣ Custom Components

#### **Action Card** (`/components/ui/action-card.tsx`)

Interactive card with primary and secondary actions.

```tsx
import { ActionCard } from "@/components/ui/action-card"

<ActionCard
  title="Card Title"
  description="Card description"
  primaryAction={{
    label: "Primary",
    onClick: () => console.log("primary"),
  }}
  secondaryAction={{
    label: "Secondary",
    onClick: () => console.log("secondary"),
  }}
/>

// With tone
<ActionCard tone="success" />
<ActionCard tone="warning" />
<ActionCard tone="error" />

// With size
<ActionCard size="sm" />
<ActionCard size="md" />
<ActionCard size="lg" />
```

---

#### **Glass Card** (`/components/ui/glass-card.tsx`)

Glass morphism effect card.

```tsx
import { GlassCard } from "@/components/ui/glass-card"

<GlassCard variant="default">Default glass</GlassCard>
<GlassCard variant="strong">Strong glass</GlassCard>
<GlassCard variant="subtle">Subtle glass</GlassCard>
```

---

#### **Media Card** (`/components/ui/media-card.tsx`)

Card for displaying media with image, title, badges, and actions.

```tsx
import { MediaCard } from "@/components/ui/media-card"

<MediaCard
  image="https://example.com/image.jpg"
  title="Media Title"
  description="Media description"
  badges={[
    { label: "New", variant: "default" },
    { label: "Featured", variant: "secondary" },
  ]}
  actions={[
    { icon: Play, label: "Play", onClick: () => {} },
    { icon: Heart, label: "Like", onClick: () => {} },
  ]}
/>

// With aspect ratio
<MediaCard aspectRatio="video" />
<MediaCard aspectRatio="square" />
<MediaCard aspectRatio="portrait" />

// With size
<MediaCard size="sm" />
<MediaCard size="md" />
<MediaCard size="lg" />
```

---

#### **Stats Card** (`/components/ui/stats-card.tsx`)

Statistics display card with trend indicators.

```tsx
import { StatsCard } from "@/components/ui/stats-card"
import { TrendingUp, TrendingDown } from "lucide-react"

<StatsCard
  title="Total Revenue"
  value="$45,231.89"
  trend={{
    value: "+20.1%",
    direction: "up",
    icon: TrendingUp,
  }}
  icon={DollarSign}
/>

<StatsCard
  title="Expenses"
  value="$12,345.67"
  trend={{
    value: "-5.2%",
    direction: "down",
    icon: TrendingDown,
  }}
/>
```

---

#### **Kbd (Keyboard Key)** (`/components/ui/kbd.tsx`)

```tsx
import { Kbd, KbdGroup } from "@/components/ui/kbd"

<Kbd>Ctrl</Kbd>
<Kbd>K</Kbd>

<KbdGroup>
  <Kbd>Ctrl</Kbd>
  <span>+</span>
  <Kbd>K</Kbd>
</KbdGroup>
```

---

#### **Segmented Control** (`/components/ui/segmented-control.tsx`)

```tsx
import { SegmentedControl } from "@/components/ui/segmented-control"

<SegmentedControl
  options={[
    { label: "Day", value: "day" },
    { label: "Week", value: "week" },
    { label: "Month", value: "month" },
  ]}
  value={value}
  onChange={setValue}
/>
```

---

#### **Mood Tracker** (`/components/ui/mood-tracker.tsx`)

```tsx
import { MoodTracker } from "@/components/ui/mood-tracker"

<MoodTracker
  moods={[
    { label: "Happy", color: "bg-green-500", value: "happy" },
    { label: "Neutral", color: "bg-gray-500", value: "neutral" },
    { label: "Sad", color: "bg-blue-500", value: "sad" },
  ]}
  selected={selectedMood}
  onSelect={setSelectedMood}
/>
```

---

#### **Dropzone** (`/components/ui/dropzone.tsx`)

File upload dropzone with Supabase integration.

```tsx
import { Dropzone, DropzoneContent, DropzoneEmptyState } from "@/components/ui/dropzone"
import { useDropzone } from "@/components/ui/dropzone"

function FileUpload() {
  const { files, isDragging, handleDragOver, handleDragLeave, handleDrop, removeFile } = useDropzone()

  return (
    <Dropzone
      isDragging={isDragging}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="min-h-[200px]"
    >
      <DropzoneContent>
        {files.length === 0 ? (
          <DropzoneEmptyState />
        ) : (
          files.map(file => (
            <div key={file.name}>
              {file.name}
              <button onClick={() => removeFile(file)}>Remove</button>
            </div>
          ))
        )}
      </DropzoneContent>
    </Dropzone>
  )
}
```

---

#### **Form (React Hook Form)** (`/components/ui/form.tsx`)

```tsx
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

const formSchema = z.object({
  username: z.string().min(2).max(50),
})

function ProfileForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { username: "" },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="shadcn" {...field} />
              </FormControl>
              <FormDescription>This is your public display name.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  )
}
```

---

## 🎨 Styling & Theming

### Theme Colors

Your project uses CSS variables for theming. These are defined in your globals.css:

```css
/* Usage in components */
className="bg-primary text-primary-foreground"
className="bg-secondary text-secondary-foreground"
className="bg-accent text-accent-foreground"
className="bg-muted text-muted-foreground"
className="bg-destructive text-destructive-foreground"
className="border-border"
className="text-card-foreground"
```

### Custom Classes

You can always add custom Tailwind classes to any component:

```tsx
<Button className="rounded-full w-12 h-12 p-0">
  <Icon className="w-6 h-6" />
</Button>

<Card className="bg-gradient-to-br from-purple-500 to-pink-500">
  <CardContent>
    Custom styled card
  </CardContent>
</Card>
```

---

## 🚀 Real-World Examples

### Login Form

```tsx
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log({ email, password })
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Login</CardTitle>
        <CardDescription>Enter your credentials</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
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
        </CardContent>
        <CardFooter>
          <Button className="w-full">Sign In</Button>
        </CardFooter>
      </form>
    </Card>
  )
}
```

### Data Table with Actions

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
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface User {
  id: string
  name: string
  email: string
  status: "active" | "inactive"
}

const users: User[] = [
  { id: "1", name: "John Doe", email: "john@example.com", status: "active" },
  { id: "2", name: "Jane Smith", email: "jane@example.com", status: "inactive" },
]

export function UsersTable() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell>{user.name}</TableCell>
            <TableCell>{user.email}</TableCell>
            <TableCell>
              <Badge variant={user.status === "active" ? "default" : "secondary"}>
                {user.status}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
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

### Dashboard Card Grid

```tsx
"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatsCard } from "@/components/ui/stats-card"
import { DollarSign, Users, TrendingUp, Activity } from "lucide-react"

export function DashboardGrid() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatsCard
        title="Total Revenue"
        value="$45,231.89"
        icon={DollarSign}
        trend={{ value: "+20.1%", direction: "up", icon: TrendingUp }}
      />
      <StatsCard
        title="Active Users"
        value="2,350"
        icon={Users}
        trend={{ value: "+180", direction: "up", icon: TrendingUp }}
      />
      <StatsCard
        title="Sales"
        value="+12,234"
        icon={Activity}
        trend={{ value: "+19%", direction: "up", icon: TrendingUp }}
      />
      <StatsCard
        title="Active Now"
        value="+573"
        icon={Activity}
        trend={{ value: "+201", direction: "up", icon: TrendingUp }}
      />
    </div>
  )
}
```

---

## 📚 Best Practices

### 1. **Always use `cn()` for className merging**

```tsx
// ❌ Bad
<div className={`base-classes ${isActive ? "active" : ""}`}>...</div>

// ✅ Good
<div className={cn("base-classes", isActive && "active")}>...</div>
```

### 2. **Use forwardRef for interactive components**

```tsx
const MyComponent = React.forwardRef<HTMLDivElement, MyComponentProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("base", className)} {...props} />
  )
)
MyComponent.displayName = "MyComponent"
```

### 3. **Use CVA for component variants**

```tsx
const variants = cva("base-classes", {
  variants: {
    variant: {
      default: "variant-classes",
      primary: "primary-classes",
    },
  },
  defaultVariants: {
    variant: "default",
  },
})
```

### 4. **Keep components focused and small**

Break large components into smaller sub-components.

### 5. **Use TypeScript for type safety**

All props should be properly typed.

### 6. **Use sub-components for complex UIs**

Like `CardHeader`, `CardContent`, `CardFooter` for cards.

---

## 🎯 Quick Reference

| Component | Import Path | Use Case |
|-----------|-------------|----------|
| Button | `@/components/ui/button` | Actions, links |
| Input | `@/components/ui/input` | Text input |
| Card | `@/components/ui/card` | Content containers |
| Dialog | `@/components/ui/dialog` | Modal dialogs |
| Dropdown Menu | `@/components/ui/dropdown-menu` | Context menus |
| Table | `@/components/ui/table` | Data tables |
| Form | `@/components/ui/form` | React Hook Form |
| Toast | `@/components/ui/sonner` | Notifications |
| Sidebar | `@/components/ui/sidebar` | Navigation sidebar |
| Command | `@/components/ui/command` | Command palette |

---

## 🐛 Troubleshooting

### Issue: Component styles not applying

**Solution:** Make sure you're using the `cn()` utility and importing correctly.

### Issue: TypeScript errors

**Solution:** Ensure you're using the correct prop types from the component.

### Issue: Components not responsive

**Solution:** Use Tailwind's responsive prefixes: `sm:`, `md:`, `lg:`, `xl:`.

---

## 📖 Additional Resources

- **shadcn/ui Documentation:** https://ui.shadcn.com
- **Radix UI:** https://www.radix-ui.com
- **Tailwind CSS:** https://tailwindcss.com
- **Project Components:** `/components/ui/`

---

## 🎉 Conclusion

Your project has 50+ shadcn/ui components ready to use. All components are:
- ✅ Fully typed with TypeScript
- ✅ Accessible (Radix UI primitives)
- ✅ Customizable with variants
- ✅ Responsive by default
- ✅ Dark mode ready

Start building by importing components from `@/components/ui/*` and using the examples above. Happy coding! 🚀
