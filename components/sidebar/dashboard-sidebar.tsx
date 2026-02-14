"use client"

import * as React from "react"
import {
    Activity,
    BarChart3,
    BookOpen,
    Brain,
    Building2,
    CreditCard,
    Database,
    Globe,
    LayoutDashboard,
    RefreshCw,
    Settings,
    Sparkles,
    TrendingUp,
    Shield,
    Command,
    ChevronsUpDown,
    LogOut,
    User,
    Settings2,
} from "lucide-react"

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarRail,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    useSidebar,
} from "@/components/ui/sidebar"

import { useData } from "@/context/data-provider"
import { useUserStore } from "@/store/user-store"
import { useCurrentLocale } from "@/locales/client"
import { checkAdminStatus } from "@/app/[locale]/dashboard/settings/actions"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import ReferralButton from "@/components/referral-button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

export function DashboardSidebar() {
    const { refreshAllData } = useData()
    const locale = useCurrentLocale()
    const pathname = usePathname()
    const user = useUserStore(state => state.supabaseUser)
    const timezone = useUserStore(state => state.timezone)
    const setTimezone = useUserStore(state => state.setTimezone)
    const resetUser = useUserStore(state => state.resetUser)
    const [isAdmin, setIsAdmin] = React.useState(false)
    const { isMobile } = useSidebar()

    React.useEffect(() => {
        async function check() {
            const status = await checkAdminStatus()
            setIsAdmin(status)
        }
        check()
    }, [])

    const handleLogout = async () => {
        resetUser()
        const { signOut } = await import("@/server/auth")
        await signOut()
    }

    const groups = [
        {
            label: "Overview",
            items: [
                {
                    href: `/${locale}/dashboard?tab=widgets`,
                    icon: LayoutDashboard,
                    label: "Dashboard",
                },
            ],
        },
        {
            label: "Trading",
            items: [
                {
                    href: `/${locale}/dashboard?tab=table`,
                    icon: TrendingUp,
                    label: "Trades",
                },
                {
                    href: `/${locale}/dashboard?tab=chart`,
                    icon: Sparkles,
                    label: "Chart the Future",
                },
                {
                    href: `/${locale}/dashboard?tab=accounts`,
                    icon: Activity,
                    label: "Accounts",
                },
                {
                    href: `/${locale}/dashboard/trader-profile`,
                    icon: Brain,
                    label: "Trader Profile",
                },
                {
                    href: `/${locale}/dashboard/strategies`,
                    icon: BookOpen,
                    label: "Trade Desk",
                },
            ],
        },
        {
            label: "Analytics",
            items: [
                {
                    href: `/${locale}/dashboard/reports`,
                    icon: BarChart3,
                    label: "Reports",
                },
                {
                    href: `/${locale}/dashboard/behavior`,
                    icon: Brain,
                    label: "Behavior",
                },
            ],
        },
        {
            label: "Community",
            items: [
                {
                    href: `/${locale}/teams/dashboard`,
                    icon: Building2,
                    label: "Team",
                },
                {
                    href: `/${locale}/propfirms`,
                    icon: Globe,
                    label: "Prop Firms",
                },
            ],
        },
        {
            label: "System",
            items: [
                {
                    href: `/${locale}/dashboard/data`,
                    icon: Database,
                    label: "Data",
                },
                {
                    label: "Sync",
                    icon: RefreshCw,
                    onClick: () => refreshAllData({ force: true }),
                },
                {
                    href: `/${locale}/dashboard/billing`,
                    icon: CreditCard,
                    label: "Billing",
                },
                {
                    href: `/${locale}/dashboard/settings`,
                    icon: Settings,
                    label: "Settings",
                },
                ...(isAdmin ? [{
                    href: `/${locale}/admin`,
                    icon: Shield,
                    label: "Admin",
                }] : []),
            ],
        },
    ]

    const timezones = [
        'UTC',
        'Europe/Paris',
        'America/New_York',
        'America/Chicago',
        'America/Los_Angeles',
        'Asia/Tokyo',
        'Asia/Shanghai',
        'Australia/Sydney',
    ]

    return (
        <Sidebar collapsible="icon" className="border-r border-sidebar-border bg-sidebar">
            <SidebarHeader className="h-14 flex items-center px-4 border-b border-sidebar-border">
                <div className="flex items-center gap-2 px-1">
                    <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                        <Command className="size-5" />
                    </div>
                    <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                        <span className="truncate font-semibold text-sidebar-foreground">Qunt Edge</span>
                        <span className="truncate text-xs text-sidebar-foreground/70">Trading Platform</span>
                    </div>
                </div>
            </SidebarHeader>

            <SidebarContent>
                {groups.map((group) => (
                    <SidebarGroup key={group.label}>
                        <SidebarGroupLabel className="text-sidebar-foreground/40">{group.label}</SidebarGroupLabel>
                        <SidebarMenu>
                            {group.items.map((item) => {
                                const isActive = item.href ? pathname === item.href || (item.href.includes('?') && pathname === item.href.split('?')[0]) : false

                                return (
                                    <SidebarMenuItem key={item.label}>
                                        <SidebarMenuButton
                                            asChild={!!item.href}
                                            isActive={isActive}
                                            onClick={item.onClick}
                                            tooltip={item.label}
                                            className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground transition-colors"
                                        >
                                            {item.href ? (
                                                <Link href={item.href}>
                                                    <item.icon className="size-4.5" />
                                                    <span>{item.label}</span>
                                                </Link>
                                            ) : (
                                                <div className="flex items-center gap-2 cursor-pointer w-full">
                                                    <item.icon className="size-4.5" />
                                                    <span>{item.label}</span>
                                                </div>
                                            )}
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                )
                            })}
                        </SidebarMenu>
                    </SidebarGroup>
                ))}
            </SidebarContent>

            <SidebarFooter className="p-2 border-t border-sidebar-border space-y-2">
                <div className="px-2 group-data-[collapsible=icon]:hidden">
                    <ReferralButton />
                </div>

                <div className="px-2 group-data-[collapsible=icon]:hidden">
                    <Select value={timezone} onValueChange={setTimezone}>
                        <SelectTrigger className="h-8 bg-transparent border-sidebar-border text-xs text-sidebar-foreground/70">
                            <SelectValue placeholder="Timezone" />
                        </SelectTrigger>
                        <SelectContent>
                            {timezones.map(tz => (
                                <SelectItem key={tz} value={tz} className="text-xs">
                                    {tz}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <SidebarMenu>
                    <SidebarMenuItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuButton
                                    size="lg"
                                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground mb-2"
                                >
                                    <Avatar className="h-8 w-8 rounded-lg border border-sidebar-border">
                                        <AvatarImage src={user?.user_metadata?.avatar_url} alt={user?.user_metadata?.full_name} />
                                        <AvatarFallback className="rounded-lg bg-sidebar-accent text-sidebar-foreground/50 text-xs">
                                            {user?.user_metadata?.full_name?.charAt(0) || 'U'}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                                        <span className="truncate font-semibold text-sidebar-foreground">
                                            {user?.user_metadata?.full_name || 'User'}
                                        </span>
                                        <span className="truncate text-xs text-sidebar-foreground/50">
                                            {user?.email}
                                        </span>
                                    </div>
                                    <ChevronsUpDown className="ml-auto size-4 text-sidebar-foreground/30 group-data-[collapsible=icon]:hidden" />
                                </SidebarMenuButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg bg-popover border-border text-popover-foreground"
                                side={isMobile ? "bottom" : "right"}
                                align="end"
                                sideOffset={4}
                            >
                                <DropdownMenuLabel className="p-0 font-normal">
                                    <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                                        <Avatar className="h-8 w-8 rounded-lg border border-border">
                                            <AvatarImage src={user?.user_metadata?.avatar_url} alt={user?.user_metadata?.full_name} />
                                            <AvatarFallback className="rounded-lg bg-muted text-muted-foreground text-xs">
                                                {user?.user_metadata?.full_name?.charAt(0) || 'U'}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="grid flex-1 text-left text-sm leading-tight">
                                            <span className="truncate font-semibold text-foreground">
                                                {user?.user_metadata?.full_name || 'User'}
                                            </span>
                                            <span className="truncate text-xs text-muted-foreground">
                                                {user?.email}
                                            </span>
                                        </div>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator className="bg-border" />
                                <DropdownMenuGroup>
                                    <DropdownMenuItem className="focus:bg-accent focus:text-accent-foreground">
                                        <Sparkles className="mr-2 h-4 w-4 text-blue-400" />
                                        <span>Upgrade to Pro</span>
                                    </DropdownMenuItem>
                                </DropdownMenuGroup>
                                <DropdownMenuSeparator className="bg-border" />
                                <DropdownMenuGroup>
                                    <DropdownMenuItem className="focus:bg-accent focus:text-accent-foreground" asChild>
                                        <Link href={`/${locale}/dashboard/settings`}>
                                            <User className="mr-2 h-4 w-4" />
                                            <span>Account</span>
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="focus:bg-accent focus:text-accent-foreground" asChild>
                                        <Link href={`/${locale}/dashboard/billing`}>
                                            <CreditCard className="mr-2 h-4 w-4" />
                                            <span>Billing</span>
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="focus:bg-accent focus:text-accent-foreground" asChild>
                                        <Link href={`/${locale}/dashboard/settings`}>
                                            <Settings2 className="mr-2 h-4 w-4" />
                                            <span>Settings</span>
                                        </Link>
                                    </DropdownMenuItem>
                                </DropdownMenuGroup>
                                <DropdownMenuSeparator className="bg-border" />
                                <DropdownMenuItem onClick={handleLogout} className="focus:bg-destructive/10 focus:text-destructive text-destructive">
                                    <LogOut className="mr-2 h-4 w-4" />
                                    <span>Log out</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}
