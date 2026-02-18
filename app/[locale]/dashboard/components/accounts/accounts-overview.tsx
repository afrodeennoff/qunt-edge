'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ArrowDown,
  ArrowUp,
  Info,
  ListOrdered,
  Plus,
  X,
  Trash2,
  Settings,
  GripVertical,
  LayoutGrid,
  Table,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useData } from "@/context/data-provider"
import { useI18n } from "@/locales/client"
import { AccountTable } from './account-table'
import { toast } from "sonner"
import { WidgetSize } from '../../types/dashboard'
import { useParams } from 'next/navigation'
import { AccountCard } from './account-card'
import { AccountConfigurator } from './account-configurator'
import { AccountsTableView } from './accounts-table-view'
import { AlertDialogAction, AlertDialogCancel, AlertDialogFooter, AlertDialogDescription, AlertDialogTitle, AlertDialogContent, AlertDialogHeader, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { AlertDialog } from '@/components/ui/alert-dialog'
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Account } from "@/lib/data-types"
import { useUserStore } from '@/store/user-store'
import { useTradesStore } from '@/store/trades-store'
import { useAccountOrderStore } from '@/store/account-order-store'
import { useAccountsViewPreferenceStore } from '@/store/accounts-view-preference-store'
import { useAccountsSortingStore } from '@/store/accounts-sorting-store'
import { savePayoutAction, removeAccountsFromTradesAction } from '@/server/accounts'
import { useModalStateStore } from '@/store/modal-state-store'
import { SortingState } from "@tanstack/react-table"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import { restrictToHorizontalAxis } from '@dnd-kit/modifiers'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable'
import {
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import Decimal from "decimal.js"
import { PayoutDialog, Payout } from './payout-dialog'

interface DailyMetric {
  date: Date
  pnl: number
  totalBalance: number
  percentageOfTarget: number
  isConsistent: boolean
  payout?: {
    id: string
    amount: number
    date: Date
    status: string
  }
}

type SortOption = {
  id: string
  label: string
}

function toValidDate(value: Date | string | null | undefined) {
  if (!value) return null
  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

function getAccountStartDate(account: Account) {
  const tradeDates = (account.trades ?? [])
    .map((trade) => toValidDate(trade.entryDate))
    .filter((date): date is Date => Boolean(date))
    .sort((a, b) => a.getTime() - b.getTime())

  if (tradeDates.length > 0) return tradeDates[0]

  const dailyDates = (account.dailyMetrics ?? [])
    .map((metric) => toValidDate(metric.date))
    .filter((date): date is Date => Boolean(date))
    .sort((a, b) => a.getTime() - b.getTime())

  return dailyDates[0] ?? null
}

function getAccountBalance(account: Account) {
  return account.metrics?.currentBalance ?? account.startingBalance ?? 0
}

function getAccountSortValue(account: Account, ruleId: string) {
  switch (ruleId) {
    case "account":
      return account.number || ""
    case "propfirm":
      return account.propfirm || ""
    case "startDate":
      return getAccountStartDate(account)?.getTime() ?? Number.POSITIVE_INFINITY
    case "funded":
      return account.evaluation === false ? 1 : 0
    case "balance":
      return getAccountBalance(account)
    case "targetProgress":
      return account.metrics?.progress ?? 0
    case "drawdown":
      return account.metrics?.remainingLoss ?? 0
    case "consistency":
      if (!account.metrics?.hasProfitableData) return 0
      return account.metrics.isConsistent || Number(account.consistencyPercentage ?? 0) === 100
        ? 2
        : 1
    case "maxDailyProfit":
      return account.metrics?.highestProfitDay ?? 0
    case "tradingDays":
      return account.metrics?.totalTradingDays ?? 0
    default:
      return ""
  }
}

function compareSortValues(a: unknown, b: unknown, desc: boolean) {
  let result = 0
  if (typeof a === "number" && typeof b === "number") {
    result = a - b
  } else {
    result = String(a).localeCompare(String(b), undefined, {
      sensitivity: "base",
    })
  }
  return desc ? -result : result
}

function SortRuleItem({
  sort,
  label,
  reorderLabel,
  toggleLabel,
  removeLabel,
  onToggleDirection,
  onRemove,
}: {
  sort: SortingState[number]
  label: string
  reorderLabel: string
  toggleLabel: string
  removeLabel: string
  onToggleDirection: () => void
  onRemove: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: sort.id })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-2 rounded-md border bg-background px-2 py-1.5 text-sm",
        isDragging && "opacity-70 shadow-sm"
      )}
    >
      <button
        type="button"
        className="cursor-grab text-muted-foreground active:cursor-grabbing"
        {...attributes}
        {...listeners}
        aria-label={reorderLabel}
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <span className="flex-1 truncate">{label}</span>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={onToggleDirection}
        className="h-7 w-7"
        aria-label={toggleLabel}
      >
        {sort.desc ? (
          <ArrowDown className="h-4 w-4" />
        ) : (
          <ArrowUp className="h-4 w-4" />
        )}
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={onRemove}
        className="h-7 w-7 text-muted-foreground hover:text-foreground"
        aria-label={removeLabel}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  )
}

// Draggable Account Card Component
interface DraggableAccountCardProps {
  account: Account
  onClick: () => void
  size: WidgetSize
  isDragDisabled?: boolean
}

function DraggableAccountCard({
  account,
  onClick,
  size,
  isDragDisabled = false
}: DraggableAccountCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: account.number,
    disabled: isDragDisabled
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "shrink-0",
        isDragging && "z-50"
      )}
    >
      <div className="relative group">
        <AccountCard
          account={account}
          onClick={onClick}
          size={size}
        />
        {!isDragDisabled && (
          <div
            {...attributes}
            {...listeners}
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing p-1 rounded bg-background/80 backdrop-blur-xs border"
          >
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </div>
        )}
      </div>
    </div>
  )
}

export function AccountsOverview({
  size,
  surface = "card",
}: {
  size: WidgetSize
  surface?: "card" | "embedded"
}) {
  const trades = useTradesStore(state => state.trades)
  const user = useUserStore(state => state.user)
  const isLoading = useUserStore(state => state.isLoading)
  const groups = useUserStore(state => state.groups)
  const accounts = useUserStore(state => state.accounts)
  const { accountNumbers, setAccountNumbers, deletePayout, deleteAccount, saveAccount, savePayout } = useData()
  const { getOrderedAccounts, reorderAccounts } = useAccountOrderStore()
  const t = useI18n()
  const params = useParams()
  const locale = params.locale as string
  const { setAccountGroupBoardOpen } = useModalStateStore()
  const { view, setView } = useAccountsViewPreferenceStore()
  const [selectedAccountForTable, setSelectedAccountForTable] = useState<Account | null>(null)
  const [payoutDialogOpen, setPayoutDialogOpen] = useState(false)
  const [selectedPayout, setSelectedPayout] = useState<{
    id: string;
    date: Date;
    amount: number;
    status: string;
  } | undefined>()
  const [isDeleting, setIsDeleting] = useState(false)
  const [canDeleteAccount, setCanDeleteAccount] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [pendingChanges, setPendingChanges] = useState<Partial<Account> | null>(null)
  const [isSavingPayout, setIsSavingPayout] = useState(false)
  const [isDeletingPayout, setIsDeletingPayout] = useState(false)
  const { sorting, setSorting, clearSorting } = useAccountsSortingStore()
  const [sortingMenuOpen, setSortingMenuOpen] = useState(false)
  const [pendingSortId, setPendingSortId] = useState("")
  const shouldUpdateSelectedAccount = useRef(false)

  const sortOptions = useMemo<SortOption[]>(
    () => [
      { id: "group", label: t("accounts.table.group") },
      { id: "account", label: t("accounts.table.account") },
      { id: "propfirm", label: t("accounts.table.propfirm") },
      { id: "startDate", label: t("accounts.table.startDate") },
      { id: "funded", label: t("accounts.table.funded") },
      { id: "balance", label: t("accounts.table.balance") },
      { id: "targetProgress", label: t("accounts.table.targetProgress") },
      { id: "drawdown", label: t("accounts.table.drawdownRemaining") },
      { id: "consistency", label: t("propFirm.card.consistency") },
      { id: "maxDailyProfit", label: t("propFirm.card.highestDailyProfit") },
      { id: "tradingDays", label: t("propFirm.card.tradingDays") },
    ],
    [t]
  )

  const availableSortOptions = useMemo(
    () => sortOptions.filter((option) => !sorting.some((rule) => rule.id === option.id)),
    [sortOptions, sorting]
  )

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (active.id !== over?.id) {
      // Find which group this account belongs to
      const activeAccount = accounts.find(acc => acc.number === active.id)
      if (!activeAccount) return

      let groupId: string
      let groupAccounts: Account[]

      if (activeAccount.groupId) {
        // Account belongs to a group
        const group = groups.find(g => g.id === activeAccount.groupId)
        if (!group) return

        groupId = group.id
        groupAccounts = filteredAccounts.filter(account => {
          return group.accounts.some(a => a.number === account.number);
        })
      } else {
        // Account is ungrouped
        const groupedAccountNumbers = new Set(
          groups.flatMap(group => group.accounts.map(a => a.number))
        )

        groupId = 'ungrouped'
        groupAccounts = filteredAccounts.filter(
          account => !groupedAccountNumbers.has(account.number ?? '')
        )
      }

      const orderedAccounts = getOrderedAccounts(groupId, groupAccounts)
      const oldIndex = orderedAccounts.findIndex(account => account.number === active.id)
      const newIndex = orderedAccounts.findIndex(account => account.number === over?.id)

      if (oldIndex !== -1 && newIndex !== -1) {
        const reorderedAccounts = arrayMove(orderedAccounts, oldIndex, newIndex)
        const accountNumbers = reorderedAccounts.map(acc => acc.number)

        reorderAccounts(groupId, accountNumbers)

        toast.success(t('propFirm.dragAndDrop.reorderSuccess'))
      }
    }
  }

  // Enable delete button when an account is selected
  useEffect(() => {
    setCanDeleteAccount(!!selectedAccountForTable)
  }, [selectedAccountForTable])

  // Update selected account when accounts data is refreshed (e.g., after adding a payout)
  useEffect(() => {
    if (shouldUpdateSelectedAccount.current && selectedAccountForTable) {
      const updatedAccount = accounts.find(acc => acc.number === selectedAccountForTable.number)
      if (updatedAccount) {
        // Update with the full account including recalculated metrics and daily metrics
        setSelectedAccountForTable(updatedAccount)
      }
      shouldUpdateSelectedAccount.current = false
    }
  }, [accounts, selectedAccountForTable])

  const { filteredAccounts, unconfiguredAccounts } = useMemo(() => {
    const uniqueAccounts = new Set(trades.map(trade => trade.accountNumber))
    // Find the hidden group
    const hiddenGroup = groups.find(g => g.name === "Hidden Accounts")
    const hiddenAccountNumbers = hiddenGroup ? new Set(hiddenGroup.accounts.map(a => a.number)) : new Set()

    const configuredAccounts: Account[] = []
    const unconfiguredAccounts: string[] = []

    Array.from(uniqueAccounts)
      .filter(accountNumber =>
        (accountNumbers.length === 0 || accountNumbers.includes(accountNumber)) &&
        !hiddenAccountNumbers.has(accountNumber)
      )
      .forEach(accountNumber => {
        const dbAccount = accounts.find(acc => acc.number === accountNumber)

        if (dbAccount) {
          // Account is configured - use it with all its pre-computed metrics
          configuredAccounts.push(dbAccount)
        } else {
          // Account exists in trades but not configured in database
          unconfiguredAccounts.push(accountNumber)
        }
      })

    return { filteredAccounts: configuredAccounts, unconfiguredAccounts }
  }, [trades, accounts, accountNumbers, groups])

  const { sortedGroupEntries, sortedUngroupedAccounts } = useMemo(() => {
    const groupSortRule = sorting.find((rule) => rule.id === "group")
    const accountSortRules = sorting.filter((rule) => rule.id !== "group")

    const sortAccounts = (groupId: string, groupAccounts: Account[]) => {
      if (accountSortRules.length === 0) {
        return getOrderedAccounts(groupId, groupAccounts) as Account[]
      }
      return [...groupAccounts].sort((a, b) => {
        for (const rule of accountSortRules) {
          const aValue = getAccountSortValue(a, rule.id)
          const bValue = getAccountSortValue(b, rule.id)
          const compare = compareSortValues(aValue, bValue, rule.desc)
          if (compare !== 0) return compare
        }
        return 0
      })
    }

    const groupEntries = groups
      .map((group) => {
        const groupAccounts = filteredAccounts.filter((account) =>
          group.accounts.some((a) => a.number === account.number)
        )
        if (groupAccounts.length === 0) return null
        return {
          group,
          accounts: sortAccounts(group.id, groupAccounts),
        }
      })
      .filter((value): value is { group: typeof groups[number]; accounts: Account[] } =>
        Boolean(value)
      )

    if (groupSortRule) {
      groupEntries.sort((a, b) =>
        compareSortValues(a.group.name, b.group.name, groupSortRule.desc)
      )
    } else if (accountSortRules.length > 0) {
      groupEntries.sort((a, b) => {
        const aAccount = a.accounts[0]
        const bAccount = b.accounts[0]
        if (!aAccount && !bAccount) return 0
        if (!aAccount) return 1
        if (!bAccount) return -1
        for (const rule of accountSortRules) {
          const aValue = getAccountSortValue(aAccount, rule.id)
          const bValue = getAccountSortValue(bAccount, rule.id)
          const compare = compareSortValues(aValue, bValue, rule.desc)
          if (compare !== 0) return compare
        }
        return 0
      })
    }

    const groupedAccountNumbers = new Set(
      groups.flatMap((group) => group.accounts.map((a) => a.number))
    )
    const ungroupedAccounts = filteredAccounts.filter(
      (account) => !groupedAccountNumbers.has(account.number ?? "")
    )
    const sortedUngrouped = sortAccounts("ungrouped", ungroupedAccounts)

    return {
      sortedGroupEntries: groupEntries,
      sortedUngroupedAccounts: sortedUngrouped,
    }
  }, [filteredAccounts, getOrderedAccounts, groups, sorting])

  const dailyMetrics = useMemo(() => {
    if (!selectedAccountForTable) return []
    // Use pre-computed daily metrics from account
    return selectedAccountForTable.dailyMetrics || []
  }, [selectedAccountForTable])

  const handleAddPayout = async (payout: Payout) => {
    console.log('handleAddPayout', payout)
    if (!selectedAccountForTable || !user) return

    try {
      setIsSavingPayout(true)

      if (selectedPayout) {
        // Update existing payout
        await savePayout({
          ...payout,
          amount: new Decimal(payout.amount),
          id: selectedPayout.id, // Use existing payout ID
          accountNumber: selectedAccountForTable.number,
          createdAt: selectedPayout.date, // Keep original creation date
          accountId: selectedAccountForTable.id
        })
      } else {
        // Add new payout
        await savePayout({
          ...payout,
          amount: new Decimal(payout.amount),
          id: '', // Will be generated by the server
          accountNumber: selectedAccountForTable.number,
          createdAt: new Date(),
          accountId: selectedAccountForTable.id
        })
      }

      // Mark for local selection update; data is already updated optimistically
      shouldUpdateSelectedAccount.current = true

      setPayoutDialogOpen(false)
      setSelectedPayout(undefined)

      toast.success(selectedPayout ? t('propFirm.payout.updateSuccess') : t('propFirm.payout.success'), {
        description: selectedPayout ? t('propFirm.payout.updateSuccessDescription') : t('propFirm.payout.successDescription'),
      })
    } catch (error) {
      console.error('Failed to handle payout:', error)
      toast.error(t('propFirm.payout.error'), {
        description: t('propFirm.payout.errorDescription'),
      })
    } finally {
      setIsSavingPayout(false)
    }
  }

  const handleDeletePayout = async () => {
    if (!selectedAccountForTable || !user || !selectedPayout) return

    try {
      setIsDeletingPayout(true)

      await deletePayout(selectedPayout.id)

      // Mark for local selection update; data is already updated optimistically
      shouldUpdateSelectedAccount.current = true

      setPayoutDialogOpen(false)
      setSelectedPayout(undefined)

      toast.success(t('propFirm.payout.deleteSuccess'), {
        description: t('propFirm.payout.deleteSuccessDescription'),
      })
    } catch (error) {
      console.error('Failed to delete payout:', error)
      toast.error(t('propFirm.payout.deleteError'), {
        description: t('propFirm.payout.deleteErrorDescription'),
      })
    } finally {
      setIsDeletingPayout(false)
    }
  }

  const handleDelete = async () => {
    if (!user || !selectedAccountForTable || !canDeleteAccount) return

    try {
      setIsDeleting(true)
      // Delete both account configuration and all associated trades
      await removeAccountsFromTradesAction([selectedAccountForTable.number])
      // DataProvider updates accounts/trades optimistically; no full refresh
      setSelectedAccountForTable(null)

      toast.success(t('propFirm.toast.deleteSuccess'), {
        description: t('propFirm.toast.deleteSuccessDescription'),
      })
    } catch (error) {
      console.error('Failed to delete account:', error)
      toast.error(t('propFirm.toast.deleteError'), {
        description: t('propFirm.toast.deleteErrorDescription'),
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const handleSave = async () => {
    if (!user || !selectedAccountForTable || !pendingChanges) return

    try {
      setIsSaving(true)
      const accountUpdate = {
        ...selectedAccountForTable,
        userId: user.id,
        ...pendingChanges,
        startingBalance: pendingChanges?.startingBalance ?? selectedAccountForTable.startingBalance,
        profitTarget: pendingChanges?.profitTarget ?? selectedAccountForTable.profitTarget,
        drawdownThreshold: pendingChanges?.drawdownThreshold ?? selectedAccountForTable.drawdownThreshold,
        consistencyPercentage: pendingChanges?.consistencyPercentage ?? selectedAccountForTable.consistencyPercentage,
        propfirm: pendingChanges?.propfirm ?? selectedAccountForTable.propfirm,
        resetDate: 'resetDate' in pendingChanges
          ? (pendingChanges.resetDate instanceof Date ? pendingChanges.resetDate : null)
          : selectedAccountForTable.resetDate,
        shouldConsiderTradesBeforeReset: pendingChanges?.shouldConsiderTradesBeforeReset ?? selectedAccountForTable.shouldConsiderTradesBeforeReset ?? true,
        trailingDrawdown: pendingChanges?.trailingDrawdown ?? selectedAccountForTable.trailingDrawdown,
        trailingStopProfit: pendingChanges?.trailingStopProfit ?? selectedAccountForTable.trailingStopProfit,
        accountSize: pendingChanges?.accountSize ?? selectedAccountForTable.accountSize,
        accountSizeName: pendingChanges?.accountSizeName ?? selectedAccountForTable.accountSizeName,
        price: pendingChanges?.price ?? selectedAccountForTable.price,
        priceWithPromo: pendingChanges?.priceWithPromo ?? selectedAccountForTable.priceWithPromo,
        evaluation: pendingChanges?.evaluation ?? selectedAccountForTable.evaluation,
        minDays: pendingChanges?.minDays ?? selectedAccountForTable.minDays,
        dailyLoss: pendingChanges?.dailyLoss ?? selectedAccountForTable.dailyLoss,
        rulesDailyLoss: pendingChanges?.rulesDailyLoss ?? selectedAccountForTable.rulesDailyLoss,
        trailing: pendingChanges?.trailing ?? selectedAccountForTable.trailing,
        tradingNewsAllowed: pendingChanges?.tradingNewsAllowed ?? selectedAccountForTable.tradingNewsAllowed,
        activationFees: pendingChanges?.activationFees ?? selectedAccountForTable.activationFees,
        isRecursively: pendingChanges?.isRecursively ?? selectedAccountForTable.isRecursively,
        balanceRequired: pendingChanges?.balanceRequired ?? selectedAccountForTable.balanceRequired,
        minTradingDaysForPayout: pendingChanges?.minTradingDaysForPayout ?? selectedAccountForTable.minTradingDaysForPayout,
        groupId: 'groupId' in pendingChanges
          ? (pendingChanges.groupId ?? null)
          : (selectedAccountForTable.groupId ?? null)
      }
      await saveAccount(accountUpdate)

      // Update the selected account
      setSelectedAccountForTable(accountUpdate)

      setPendingChanges(null)

      toast.success(t('propFirm.toast.setupSuccess'), {
        description: t('propFirm.toast.setupSuccessDescription'),
      })
    } catch (error) {
      console.error('Failed to setup account:', error)
      toast.error(t('propFirm.toast.setupError'), {
        description: t('propFirm.toast.setupErrorDescription'),
      })
    } finally {
      setIsSaving(false)
    }
  }


  return (
    <Card
      className={cn(
        "w-full h-full flex flex-col",
        surface === "embedded" && "border-transparent bg-transparent shadow-none"
      )}
    >
      <CardHeader
        className={cn(
          "flex flex-row items-center justify-between space-y-0 border-b shrink-0",
          size === 'small' ? "p-2 h-10" : "p-3 sm:p-4 h-14"
        )}
      >
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-1.5">
            <CardTitle
              className={cn(
                "line-clamp-1",
                size === 'small' ? "text-sm" : "text-base"
              )}
            >
              {t('propFirm.title')}
            </CardTitle>
            <TooltipProvider>
              <UITooltip>
                <TooltipTrigger asChild>
                  <Info className={cn(
                    "text-muted-foreground hover:text-foreground transition-colors cursor-help",
                    size === 'small' ? "h-3.5 w-3.5" : "h-4 w-4"
                  )} />
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p>{t('propFirm.description')}</p>
                </TooltipContent>
              </UITooltip>
            </TooltipProvider>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAccountGroupBoardOpen(true)}
              className={cn(
                "gap-1.5",
                size === "small" ? "h-7 px-2 text-xs" : "h-8"
              )}
            >
              <Settings className="h-3.5 w-3.5" />
              <span className={cn(size === "small" && "sr-only")}>
                {t("filters.manageAccounts")}
              </span>
            </Button>
            <Popover open={sortingMenuOpen} onOpenChange={setSortingMenuOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    "gap-1.5",
                    size === "small" ? "h-7 px-2 text-xs" : "h-8"
                  )}
                >
                  <ListOrdered className="h-3.5 w-3.5" />
                  <span className={cn(size === "small" && "sr-only")}>
                    {sorting.length > 0
                      ? t("table.sortingRules", { count: sorting.length })
                      : t("table.sorting")}
                  </span>
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-80 p-3">
                <div className="space-y-3">
                  {sorting.length === 0 ? (
                    <div className="text-sm text-muted-foreground">
                      {t("table.noSorting")}
                    </div>
                  ) : (
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={(event: DragEndEvent) => {
                        const { active, over } = event
                        if (!over || active.id === over.id) return
                        const oldIndex = sorting.findIndex(
                          (rule) => rule.id === active.id
                        )
                        const newIndex = sorting.findIndex(
                          (rule) => rule.id === over.id
                        )
                        if (oldIndex === -1 || newIndex === -1) return
                        setSorting((prev) => arrayMove(prev, oldIndex, newIndex))
                      }}
                    >
                      <SortableContext
                        items={sorting.map((rule) => rule.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                          {sorting.map((rule) => {
                            const label =
                              sortOptions.find(
                                (option) => option.id === rule.id
                              )?.label ?? rule.id
                            return (
                              <SortRuleItem
                                key={rule.id}
                                sort={rule}
                                label={label}
                                reorderLabel={t("table.reorderSort")}
                                toggleLabel={
                                  rule.desc
                                    ? t("table.sortDescending")
                                    : t("table.sortAscending")
                                }
                                removeLabel={t("table.removeSort")}
                                onToggleDirection={() =>
                                  setSorting((prev) =>
                                    prev.map((item) =>
                                      item.id === rule.id
                                        ? { ...item, desc: !item.desc }
                                        : item
                                    )
                                  )
                                }
                                onRemove={() =>
                                  setSorting((prev) =>
                                    prev.filter((item) => item.id !== rule.id)
                                  )
                                }
                              />
                            )
                          })}
                        </div>
                      </SortableContext>
                    </DndContext>
                  )}
                  <div className="flex items-center gap-2">
                    <Select
                      value={pendingSortId}
                      onValueChange={(value) => {
                        const nextValue = value === "__none" ? "" : value
                        setPendingSortId(nextValue)
                        if (nextValue) {
                          setSorting((prev) => [
                            ...prev,
                            { id: nextValue, desc: false },
                          ])
                          setPendingSortId("")
                        }
                      }}
                    >
                      <SelectTrigger className="h-8 flex-1">
                        <SelectValue placeholder={t("table.pickSortColumn")} />
                      </SelectTrigger>
                      <SelectContent>
                        {availableSortOptions.length === 0 ? (
                          <SelectItem value="__none" disabled>
                            {t("table.noMoreSortOptions")}
                          </SelectItem>
                        ) : (
                          availableSortOptions.map((option) => (
                            <SelectItem key={option.id} value={option.id}>
                              {option.label}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearSorting}
                      disabled={sorting.length === 0}
                    >
                      {t("table.clearSorting")}
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
            <Tabs value={view} onValueChange={(value) => setView(value as "cards" | "table")}>
              <TabsList
                className={cn(
                  "gap-1",
                  size === "small" ? "h-7 px-1" : "h-8 px-1"
                )}
              >
                <TabsTrigger
                  value="cards"
                  className={cn(
                    "gap-1.5",
                    size === "small" ? "h-6 px-2 text-xs" : "h-7"
                  )}
                >
                  <LayoutGrid className="h-3.5 w-3.5" />
                  <span className={cn(size === "small" && "sr-only")}>
                    {t("accounts.view.charts")}
                  </span>
                </TabsTrigger>
                <TabsTrigger
                  value="table"
                  className={cn(
                    "gap-1.5",
                    size === "small" ? "h-6 px-2 text-xs" : "h-7"
                  )}
                >
                  <Table className="h-3.5 w-3.5" />
                  <span className={cn(size === "small" && "sr-only")}>
                    {t("accounts.view.table")}
                  </span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </CardHeader>

      {/* Unconfigured accounts banner */}
      {(unconfiguredAccounts.length > 0 && !isLoading) && (
        <div className="border-b border-border bg-secondary/20 backdrop-blur-sm">
          <div className="px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  {t('propFirm.status.needsConfiguration')}
                </span>
              </div>
              <div className="flex gap-2 overflow-x-auto">
                {unconfiguredAccounts.map((accountNumber, index) => (
                  <div
                    key={accountNumber}
                    className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-background border border-border"
                  >
                    <span className="text-[10px] font-bold text-foreground">
                      {accountNumber}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-5 w-5 p-0 hover:bg-muted"
                      onClick={() => {
                        // Create a minimal account object for configuration
                        const tempAccount = {
                          id: '',
                          userId: user?.id || '',
                          number: accountNumber,
                          propfirm: '',
                          startingBalance: 0,
                          profitTarget: 0,
                          drawdownThreshold: 0,
                          consistencyPercentage: 30,
                          resetDate: null,
                          payouts: [],
                          balanceToDate: 0
                        }
                        // Use type assertion to work around the type issues
                        setSelectedAccountForTable(tempAccount as any)
                      }}
                    >
                      <Settings className="h-3 w-3 text-muted-foreground hover:text-foreground transition-colors" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <CardContent
        className={cn(
          "flex-1 overflow-hidden",
          view === "table" && "p-0"
        )}
      >
        <div
          className="flex-1 overflow-y-auto h-full"
        >
          {filteredAccounts.length === 0 && unconfiguredAccounts.length === 0 && !isLoading ? (
            <div className="flex flex-col items-center justify-center h-full py-10 text-muted-foreground">
              <Table className="h-10 w-10 mb-4 opacity-20" />
              <p className="text-sm">{t('modals.noTrades.description')}</p>
            </div>
          ) : view === "cards" ? (
            <div className="mt-4">
              <div className="space-y-6">
                {sortedGroupEntries.map(({ group, accounts: orderedAccounts }, groupIndex) => {
                  // Generate a consistent color for each group based on group index
                  const groupColors = [
                    'border-primary/20 bg-primary/[0.02]',
                    'border-muted-foreground/20 bg-muted-foreground/[0.02]',
                    'border-border bg-card',
                    'border-primary/10 bg-primary/[0.01]',
                    'border-secondary bg-secondary/10',
                    'border-foreground/10 bg-foreground/[0.02]',
                  ];

                  const groupColorClass = groupColors[groupIndex % groupColors.length];

                  return (
                    <div
                      key={group.id}
                      className={cn(
                        "relative border-l-4 rounded-r-lg",
                        groupColorClass,
                        "transition-all duration-200 hover:shadow-md"
                      )}
                    >
                      {/* Group header with subtle styling */}
                      <div className="px-4 py-3 border-b border-border/40">
                        <div className="flex items-center justify-between">
                          <h3 className="text-[10px] font-bold text-muted-foreground tracking-[0.2em] uppercase">
                            {group.name}
                          </h3>
                          <div className="text-[9px] font-bold text-muted-foreground bg-background/50 px-2 py-0.5 rounded-full border border-border/40">
                            {orderedAccounts.length} {orderedAccounts.length === 1 ? 'ACCOUNT' : 'ACCOUNTS'}
                          </div>
                        </div>
                      </div>

                      {/* Cards container with optimized spacing */}
                      <div className="p-4 pt-3">
                        <DndContext
                          sensors={sensors}
                          collisionDetection={closestCenter}
                          onDragEnd={handleDragEnd}
                          modifiers={[restrictToHorizontalAxis]}
                        >
                          <SortableContext
                            items={orderedAccounts.map(acc => acc.number)}
                            strategy={horizontalListSortingStrategy}
                          >
                            <div className="flex gap-3 overflow-x-auto pb-2 min-h-fit">
                              {orderedAccounts.map(account => {
                                if (!account.number) return null;
                                return (
                                  <DraggableAccountCard
                                    key={account.number}
                                    account={account as Account}
                                    onClick={() => setSelectedAccountForTable(account as Account)}
                                    size={size}
                                  />
                                )
                              }).filter(Boolean)}
                            </div>
                          </SortableContext>
                        </DndContext>
                      </div>
                    </div>
                  );
                })}

                {/* Show ungrouped accounts */}
                {(() => {
                  if (sortedUngroupedAccounts.length === 0) return null;

                  return (
                    <div
                      className={cn(
                        "relative border-l-4 border-border bg-secondary/5 rounded-r-lg",
                        "transition-all duration-300 hover:shadow-md hover:bg-secondary/10"
                      )}
                    >
                      {/* Ungrouped header */}
                      <div className="px-4 py-3 border-b border-border/40">
                        <div className="flex items-center justify-between">
                          <h3 className="text-[10px] font-bold text-muted-foreground tracking-[0.2em] uppercase">
                            {t('propFirm.ungrouped')}
                          </h3>
                          <div className="text-[9px] font-bold text-muted-foreground bg-background/50 px-2 py-0.5 rounded-full border border-border/40">
                            {sortedUngroupedAccounts.length} {sortedUngroupedAccounts.length === 1 ? 'ACCOUNT' : 'ACCOUNTS'}
                          </div>
                        </div>
                      </div>

                      {/* Cards container */}
                      <div className="p-4 pt-3">
                        <DndContext
                          sensors={sensors}
                          collisionDetection={closestCenter}
                          onDragEnd={handleDragEnd}
                          modifiers={[restrictToHorizontalAxis]}
                        >
                          <SortableContext
                            items={sortedUngroupedAccounts.map(acc => acc.number)}
                            strategy={horizontalListSortingStrategy}
                          >
                            <div className="flex gap-3 overflow-x-auto pb-2 min-h-fit">
                              {sortedUngroupedAccounts.map(account => {
                                if (!account.number) return null;
                                return (
                                  <DraggableAccountCard
                                    key={account.number}
                                    account={account as Account}
                                    onClick={() => setSelectedAccountForTable(account as Account)}
                                    size={size}
                                  />
                                )
                              }).filter(Boolean)}
                            </div>
                          </SortableContext>
                        </DndContext>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          ) : (
            <AccountsTableView
              accounts={filteredAccounts}
              groups={groups}
              onSelectAccount={(account) => setSelectedAccountForTable(account)}
              sorting={sorting}
              onSortingChange={setSorting}
            />
          )}
        </div>

        <Dialog
          open={!!selectedAccountForTable}
          onOpenChange={(open) => !open && setSelectedAccountForTable(null)}
        >
          <DialogContent className="max-w-7xl h-[80vh] flex flex-col overflow-y-auto">
            <DialogHeader className="pb-4 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <DialogTitle>{t('propFirm.configurator.title', { accountNumber: selectedAccountForTable?.number })}</DialogTitle>
                  <DialogDescription>{t('propFirm.configurator.description')}</DialogDescription>
                </div>
                <div className="flex items-center gap-2 pr-4">

                  <Button
                    variant="default"
                    onClick={handleSave}
                    disabled={pendingChanges === null}
                  >
                    {isSaving ? t('common.saving') : t('common.save')}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedPayout(undefined)
                      setPayoutDialogOpen(true)
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {t('propFirm.payout.add')}
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="destructive"
                        size="sm"
                        disabled={isDeleting || !canDeleteAccount}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        {t('propFirm.common.delete')}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>{t('propFirm.delete.title')}</AlertDialogTitle>
                        <AlertDialogDescription>
                          {t('propFirm.delete.description', { account: selectedAccountForTable?.number })}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>{t('propFirm.common.cancel')}</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDelete}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          {isDeleting ? t('propFirm.common.deleting') : t('propFirm.common.delete')}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </DialogHeader>

            <div className="p-6 pt-4 flex-1 overflow-y-auto">
              {selectedAccountForTable && (
                <Tabs
                  defaultValue={selectedAccountForTable.profitTarget === 0 ? "configurator" : "table"}
                  className="w-full"
                >
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="table">{t('propFirm.table.title')}</TabsTrigger>
                    <TabsTrigger value="configurator">{t('propFirm.table.configurator')}</TabsTrigger>
                  </TabsList>
                  <TabsContent value="table" className="mt-4">
                    <AccountTable
                      accountNumber={selectedAccountForTable.number}
                      startingBalance={selectedAccountForTable.startingBalance}
                      profitTarget={selectedAccountForTable.profitTarget}
                      dailyMetrics={dailyMetrics}
                      consistencyPercentage={selectedAccountForTable.consistencyPercentage ?? 30}
                      resetDate={selectedAccountForTable.resetDate ? new Date(selectedAccountForTable.resetDate) : undefined}
                      onDeletePayout={async (payoutId) => {
                        try {
                          await deletePayout(payoutId)

                          shouldUpdateSelectedAccount.current = true

                          toast.success(t('propFirm.payout.deleteSuccess'), {
                            description: t('propFirm.payout.deleteSuccessDescription'),
                          })
                        } catch (error) {
                          console.error('Failed to delete payout:', error)
                          toast.error(t('propFirm.payout.deleteError'), {
                            description: t('propFirm.payout.deleteErrorDescription'),
                          })
                        }
                      }}
                      onEditPayout={(payout) => {
                        setSelectedPayout({
                          id: payout.id,
                          date: new Date(payout.date),
                          amount: payout.amount,
                          status: payout.status
                        })
                        setPayoutDialogOpen(true)
                      }}
                    />
                  </TabsContent>
                  <TabsContent value="configurator" className="mt-4">
                    <AccountConfigurator
                      account={selectedAccountForTable}
                      pendingChanges={pendingChanges as Partial<Account> | null}
                      setPendingChanges={setPendingChanges}
                      isSaving={isSaving}
                    />
                  </TabsContent>
                </Tabs>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>

      <PayoutDialog
        open={payoutDialogOpen}
        onOpenChange={(open) => {
          setPayoutDialogOpen(open)
          if (!open) {
            setSelectedPayout(undefined)
          }
        }}
        accountNumber={selectedAccountForTable?.number ?? ''}
        existingPayout={selectedPayout}
        onSubmit={handleAddPayout}
        onDelete={selectedPayout ? handleDeletePayout : undefined}
        isLoading={isSavingPayout}
        isDeleting={isDeletingPayout}
      />
    </Card>
  )
}
