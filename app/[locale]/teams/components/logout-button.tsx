'use client'

import { DropdownMenuItem, DropdownMenuShortcut } from "@/components/ui/dropdown-menu"
import { LogOut } from "lucide-react"
import { signOut } from "@/server/auth"
import { useI18n } from "@/locales/client"
import { useUserStore } from "@/store/user-store"

export function LogoutButton() {
  const t = useI18n()
  const resetUser = useUserStore(state => state.resetUser)

  return (
    <DropdownMenuItem
      onClick={async () => {
        resetUser()
        await signOut()
      }}
      className="flex items-center"
    >
      <LogOut className="mr-2 h-4 w-4" />
      <span>{t('dashboard.logOut')}</span>
      <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
    </DropdownMenuItem>
  )
}
