"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

interface SortControlsProps {
  sortLabel: string
  sortOptions: {
    accounts: string
    paidPayout: string
    refusedPayout: string
    accountValue: string
  }
}

export function SortControls({ sortLabel, sortOptions }: SortControlsProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentSort = searchParams.get("sort") || "accounts"

  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === "accounts") {
      params.delete("sort")
    } else {
      params.set("sort", value)
    }
    router.push(`?${params.toString()}`, { scroll: false })
  }

  return (
    <div className="flex items-center gap-2">
      <Label htmlFor="sort-select" className="text-xs font-semibold tracking-wide text-white/60">
        {sortLabel}
      </Label>
      <Select value={currentSort} onValueChange={handleSortChange}>
        <SelectTrigger
          id="sort-select"
          className="w-[200px] border-white/10 bg-black/40 text-white/90 shadow-none backdrop-blur-sm hover:bg-white/5 focus:ring-1 focus:ring-white/15"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="border-white/10 bg-black/95 text-white/90">
          <SelectItem value="accounts">{sortOptions.accounts}</SelectItem>
          <SelectItem value="paidPayout">{sortOptions.paidPayout}</SelectItem>
          <SelectItem value="refusedPayout">{sortOptions.refusedPayout}</SelectItem>
          <SelectItem value="accountValue">{sortOptions.accountValue}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}


