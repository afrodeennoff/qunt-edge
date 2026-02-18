'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  CalendarIcon,
  Clock,
  CheckCircle,
  XCircle,
  DollarSign,
  Trash2,
  Save,
  Plus,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { format, Locale } from "date-fns"
import { enUS, fr } from 'date-fns/locale'
import { useParams } from 'next/navigation'
import { useI18n } from "@/locales/client"
import { AlertDialogAction, AlertDialogCancel, AlertDialogFooter, AlertDialogDescription, AlertDialogTitle, AlertDialogContent, AlertDialogHeader, AlertDialogTrigger, AlertDialog } from '@/components/ui/alert-dialog'

const localeMap: { [key: string]: Locale } = {
  en: enUS,
  fr: fr
}

export interface Payout {
  date: Date
  amount: number
  status: string
}

export interface PayoutDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  accountNumber: string
  existingPayout?: {
    id: string
    date: Date
    amount: number
    status: string
  }
  onSubmit: (payout: Payout) => Promise<void>
  onDelete?: () => Promise<void>
  isLoading?: boolean
  isDeleting?: boolean
}

export function PayoutDialog({
  open,
  onOpenChange,
  accountNumber,
  existingPayout,
  onSubmit,
  onDelete,
  isLoading = false,
  isDeleting = false
}: PayoutDialogProps) {
  const params = useParams()
  const locale = params.locale as string
  const dateLocale = locale === 'fr' ? fr : undefined
  const [date, setDate] = useState<Date>(existingPayout?.date ?? new Date())
  const [amount, setAmount] = useState<number>(existingPayout?.amount ?? 0)
  const [inputValue, setInputValue] = useState<string>(existingPayout?.amount?.toString() ?? "")
  const [status, setStatus] = useState<string>(existingPayout?.status ?? 'PENDING')
  const [dateInputValue, setDateInputValue] = useState<string>("")
  const t = useI18n()

  // Combined loading state for both saving and deleting
  const isProcessing = isLoading || isDeleting

  useEffect(() => {
    if (existingPayout) {
      setDate(existingPayout.date)
      setAmount(existingPayout.amount)
      setInputValue(existingPayout.amount.toString())
      setStatus(existingPayout.status)
      setDateInputValue(format(existingPayout.date, 'yyyy-MM-dd'))
    } else {
      const today = new Date()
      setDate(today)
      setAmount(0)
      setInputValue("")
      setStatus('PENDING')
      setDateInputValue(format(today, 'yyyy-MM-dd'))
    }
  }, [existingPayout, open])

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInputValue(value)
    const numericValue = value ? Number(value) : 0
    if (!isNaN(numericValue)) {
      setAmount(numericValue)
    }
  }

  const handleDateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setDateInputValue(value)

    // Try to parse the date
    const parsedDate = new Date(value)
    if (!isNaN(parsedDate.getTime())) {
      // Set the time to noon to prevent timezone issues
      parsedDate.setHours(12, 0, 0, 0)
      setDate(parsedDate)
    }
  }

  const handleCalendarDateSelect = (newDate: Date | undefined) => {
    if (newDate) {
      // Set the time to noon to prevent timezone issues
      const adjustedDate = new Date(newDate);
      adjustedDate.setHours(12, 0, 0, 0);
      setDate(adjustedDate);
      setDateInputValue(format(adjustedDate, 'yyyy-MM-dd'));
    }
  }

  const statusOptions = [
    { value: 'PENDING', label: t('propFirm.payout.statuses.pending'), icon: <Clock className="h-4 w-4" /> },
    { value: 'VALIDATED', label: t('propFirm.payout.statuses.validated'), icon: <CheckCircle className="h-4 w-4" /> },
    { value: 'REFUSED', label: t('propFirm.payout.statuses.refused'), icon: <XCircle className="h-4 w-4" /> },
    { value: 'PAID', label: t('propFirm.payout.statuses.paid'), icon: <DollarSign className="h-4 w-4" /> }
  ]

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px] flex flex-col h-full max-h-screen">
        <SheetHeader className="shrink-0">
          <SheetTitle>{existingPayout ? t('propFirm.payout.edit') : t('propFirm.payout.add')}</SheetTitle>
          <SheetDescription>
            {existingPayout ? t('propFirm.payout.editDescription') : t('propFirm.payout.addDescription')} {accountNumber}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto space-y-6 py-6 min-h-0">
          {/* Amount Input with Currency Symbol */}
          <div className="space-y-2">
            <Label htmlFor="amount">{t('propFirm.payout.amount')}</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="amount"
                type="number"
                className="pl-9"
                value={inputValue}
                onChange={handleAmountChange}
                placeholder="0.00"
                disabled={isProcessing}
              />
            </div>
          </div>

          {/* Date Selection with Inline Calendar */}
          <div className="space-y-3">
            <Label>{t('propFirm.payout.date')}</Label>

            {/* Quick Date Selection */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const today = new Date()
                  today.setHours(12, 0, 0, 0)
                  setDate(today)
                  setDateInputValue(format(today, 'yyyy-MM-dd'))
                }}
                className="text-xs"
                disabled={isProcessing}
              >
                {t('propFirm.payout.today')}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const yesterday = new Date()
                  yesterday.setDate(yesterday.getDate() - 1)
                  yesterday.setHours(12, 0, 0, 0)
                  setDate(yesterday)
                  setDateInputValue(format(yesterday, 'yyyy-MM-dd'))
                }}
                className="text-xs"
                disabled={isProcessing}
              >
                {t('propFirm.payout.yesterday')}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const lastWeek = new Date()
                  lastWeek.setDate(lastWeek.getDate() - 7)
                  lastWeek.setHours(12, 0, 0, 0)
                  setDate(lastWeek)
                  setDateInputValue(format(lastWeek, 'yyyy-MM-dd'))
                }}
                className="text-xs"
                disabled={isProcessing}
              >
                {t('propFirm.payout.lastWeek')}
              </Button>
            </div>

            {/* Selected Date Display */}
            <div className="p-3 bg-muted/30 rounded-md border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{t('propFirm.payout.selectedDate')}</p>
                  <p className="text-sm text-muted-foreground">
                    {format(date, 'PPP', { locale: localeMap[params.locale as string] })}
                  </p>
                </div>
                <CalendarIcon className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>

            {/* Inline Calendar with Custom Header */}
            <div className="border rounded-md bg-background max-h-[400px] flex flex-col">
              {/* Custom Month/Year Header */}
              <div className="p-3 border-b bg-muted/20 shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const newDate = new Date(date)
                        newDate.setMonth(newDate.getMonth() - 1)
                        setDate(newDate)
                      }}
                      className="h-7 w-7 p-0 hover:bg-muted"
                      disabled={isProcessing}
                    >
                      <ChevronLeft className="h-3 w-3" />
                    </Button>
                    <div className="text-center">
                      <h3 className="text-base font-semibold">
                        {format(date, 'MMMM', { locale: localeMap[params.locale as string] })}
                      </h3>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const newDate = new Date(date)
                        newDate.setMonth(newDate.getMonth() + 1)
                        setDate(newDate)
                      }}
                      className="h-7 w-7 p-0 hover:bg-muted"
                      disabled={isProcessing}
                    >
                      <ChevronRight className="h-3 w-3" />
                    </Button>
                  </div>

                  {/* Year Navigation */}
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const newDate = new Date(date)
                        const currentDay = newDate.getDate()
                        const currentMonth = newDate.getMonth()
                        newDate.setFullYear(newDate.getFullYear() - 1)
                        // Ensure the date is valid (e.g., Feb 29 in leap year)
                        if (newDate.getDate() !== currentDay) {
                          newDate.setDate(0) // Go to last day of previous month
                        }
                        setDate(newDate)
                      }}
                      className="h-7 w-7 p-0 hover:bg-muted"
                      disabled={isProcessing}
                    >
                      <ChevronLeft className="h-3 w-3" />
                    </Button>
                    <span className="text-base font-semibold min-w-12 text-center">
                      {date.getFullYear()}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const newDate = new Date(date)
                        const currentDay = newDate.getDate()
                        const currentMonth = newDate.getMonth()
                        newDate.setFullYear(newDate.getFullYear() + 1)
                        // Ensure the date is valid (e.g., Feb 29 in leap year)
                        if (newDate.getDate() !== currentDay) {
                          newDate.setDate(0) // Go to last day of previous month
                        }
                        setDate(newDate)
                      }}
                      className="h-7 w-7 p-0 hover:bg-muted"
                      disabled={isProcessing}
                    >
                      <ChevronRight className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Calendar Grid */}
              <div className="p-2 flex-1 overflow-y-auto">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={handleCalendarDateSelect}
                  month={date}
                  onMonthChange={setDate}
                  locale={localeMap[params.locale as string]}
                  showOutsideDays={false}
                  fixedWeeks={false}
                  className="w-full"
                  classNames={{
                    months: "flex flex-col space-y-2",
                    month: "space-y-2",
                    caption: "hidden", // Hide default caption since we have custom header
                    nav: "hidden", // Hide default nav since we have custom navigation
                    table: "w-full border-collapse space-y-1",
                    head_row: "flex",
                    head_cell: "text-muted-foreground rounded-md w-8 font-normal text-[0.75rem]",
                    row: "flex w-full mt-1",
                    cell: "h-8 w-8 text-center text-xs p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                    day: "h-8 w-8 p-0 font-normal aria-selected:opacity-100 hover:bg-accent hover:text-accent-foreground rounded-md transition-colors text-xs",
                    day_range_end: "day-range-end",
                    day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground rounded-md",
                    day_today: "bg-accent text-accent-foreground font-semibold",
                    day_outside: "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
                    day_disabled: "text-muted-foreground opacity-50",
                    day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
                    day_hidden: "invisible",
                  }}
                />
              </div>
            </div>
          </div>

          {/* Status Selection */}
          <div className="space-y-2">
            <Label htmlFor="status">{t('propFirm.payout.status')}</Label>
            <div className="grid grid-cols-2 gap-2">
              {statusOptions.map((option) => (
                <Button
                  key={option.value}
                  type="button"
                  variant={status === option.value ? "default" : "outline"}
                  className="justify-start text-sm"
                  onClick={() => setStatus(option.value)}
                  disabled={isProcessing}
                >
                  {option.icon}
                  <span className="ml-2 truncate">{option.label}</span>
                </Button>
              ))}
            </div>
          </div>
        </div>

        <SheetFooter className="shrink-0 flex-col-reverse sm:flex-row gap-2 pt-4 border-t mt-auto">
          {existingPayout && onDelete && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  size="sm"
                  className="w-full sm:w-auto"
                  disabled={isProcessing}
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {t('common.deleting')}
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4 mr-2" />
                      {t('propFirm.payout.delete')}
                    </>
                  )}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t('propFirm.payout.delete')}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {t('propFirm.payout.deleteConfirm')} ${existingPayout.amount.toFixed(2)} on {format(existingPayout.date, 'PP', { locale: dateLocale })}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={onDelete}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    disabled={isProcessing}
                  >
                    {isDeleting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {t('common.deleting')}
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4 mr-2" />
                        {t('propFirm.payout.delete')}
                      </>
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          <Button
            onClick={() => onSubmit({ date, amount, status })}
            disabled={amount <= 0 || isProcessing}
            size="sm"
            className="w-full sm:w-auto"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {t('common.saving')}
              </>
            ) : existingPayout ? (
              <>
                <Save className="w-4 h-4 mr-2" />
                {t('propFirm.payout.update')}
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                {t('propFirm.payout.save')}
              </>
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
