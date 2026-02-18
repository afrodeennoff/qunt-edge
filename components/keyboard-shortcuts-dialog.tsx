"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Kbd } from "@/components/ui/kbd"
import { useI18n } from "@/locales/client"

interface KeyboardShortcutsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function KeyboardShortcutsDialog({ open, onOpenChange }: KeyboardShortcutsDialogProps) {
  const t = useI18n()

  const shortcuts = [
    { description: t('dashboard.tabs.widgets'), keys: ["⌘", "D"] },
    { description: t('dashboard.billing'), keys: ["⌘", "B"] },
    { description: t('dashboard.data'), keys: ["⌘", "S"] },
    { description: t('dashboard.support'), keys: ["⌘", "H"] },
    { description: t('dashboard.keyboardShortcuts'), keys: ["⌘", "K"] },
    { description: t('dashboard.logOut'), keys: ["⇧", "⌘", "Q"] },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('dashboard.keyboardShortcuts')}</DialogTitle>
          <DialogDescription>
            {t('dashboard.keyboardShortcutsDescription')}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {shortcuts.map((shortcut) => (
            <div
              key={shortcut.description}
              className="grid grid-cols-2 items-center gap-4"
            >
              <span className="text-sm font-medium leading-none">
                {shortcut.description}
              </span>
              <div className="flex justify-end gap-1">
                {shortcut.keys.map((key) => (
                  <Kbd key={key}>{key}</Kbd>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
