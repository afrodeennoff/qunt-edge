import { cn } from "@/lib/utils"

type Option = { label: string; value: string }

export interface SegmentedControlProps {
  options: Option[] | string[]
  value: string
  onChange: (value: string) => void
  className?: string
}

export function SegmentedControl({ options, value, onChange, className }: SegmentedControlProps) {
  const normalized: Option[] = Array.isArray(options)
    ? options.map((item) => (typeof item === "string" ? { label: item, value: item } : item))
    : []

  return (
    <div className={cn("inline-flex rounded-md border border-border/70 bg-card/60 p-0.5", className)}>
      {normalized.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={cn(
            "rounded px-2 py-1 text-[11px] font-semibold transition-colors",
            value === option.value ? "bg-primary/20 text-foreground" : "text-muted-foreground hover:text-foreground",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
