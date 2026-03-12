"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
  DropdownMenuSubContent,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Filter } from "lucide-react"
import { useI18n } from "@/locales/client"
import { PnlFilter } from "./pnl-filter"
import { InstrumentFilter } from "./instrument-filter"
import { AccountFilter } from "./account-filter"
import { useDataIsMobile } from "@/context/providers/data-state-provider"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { useModalStateStore } from "../../../../../store/modal-state-store"

export function FilterDropdown() {
  const t = useI18n()
  const isMobile = useDataIsMobile()
  const [open, setOpen] = useState(false)
  const { accountGroupBoardOpen } = useModalStateStore()
  const effectiveOpen = accountGroupBoardOpen ? false : open

  return (
    <>
      <DropdownMenu
        open={effectiveOpen}
        onOpenChange={(nextOpen) => {
          if (!accountGroupBoardOpen) {
            setOpen(nextOpen)
          }
        }}
      >
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost"
            className={cn(
              "h-10 rounded-full flex items-center justify-center transition-transform active:scale-95",
              isMobile ? "w-10 p-0" : "min-w-[120px] gap-3 px-4"
            )}
          >
            <Filter className="h-4 w-4 shrink-0" />
            {!isMobile && (
              <span className="text-sm font-medium">
                {t('filters.title')}
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              {t('filters.accounts')}
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent className="w-[300px]">
                <AccountFilter showAccountNumbers={true}/>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
          <DropdownMenuSeparator />
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              {t('filters.pnl')}
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <PnlFilter />
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
          <DropdownMenuSeparator />
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              {t('filters.instrument')}
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <InstrumentFilter />
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>

    </>
  )
}
