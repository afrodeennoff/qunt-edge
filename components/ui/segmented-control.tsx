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
    <div className={cn("inline-flex rounded-md border border-white/10 bg-black/25 p-0.5", className)}>
      {normalized.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={cn(
            "rounded px-2 py-1 text-[11px] font-semibold transition-colors",
            value === option.value ? "bg-cyan-400/20 text-cyan-200" : "text-slate-400 hover:text-slate-200",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
