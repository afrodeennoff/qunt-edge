import { tokens } from '@/styles/tokens'
import { cn } from '@/lib/utils'
import { ArrowUpIcon, ArrowDownIcon } from 'lucide-react'

// Terminal-style aesthetic: Deep Navy/Black background, thin subtle border
const cardBase = "bg-[#151B24] border border-[#2A313A] rounded-[12px] shadow-sm p-4 relative overflow-hidden transition-all duration-200 hover:border-[#4B5563]"

export interface MetricCardProps {
  label: string
  value: string | number
  subValue?: string
  trend?: 'up' | 'down' | 'neutral'
  trendValue?: string
  icon?: React.ReactNode
  className?: string
  variant?: 'default' | 'compact' | 'highlight'
}

export function MetricCard({
  label,
  value,
  subValue,
  trend,
  trendValue,
  icon,
  className,
  variant = 'default',
}: MetricCardProps) {

  const isCompact = variant === 'compact'

  return (
    <div className={cn(cardBase, isCompact ? "p-3" : "p-5", className)}>
      {/* Header / Label */}
      <div className="flex justify-between items-start mb-2">
        <span className={cn("text-[#8D98A5] font-mono uppercase tracking-wider", isCompact ? "text-[10px]" : "text-xs")}>
          {label}
        </span>
        {icon && <div className="text-[#626C78] opacity-80">{icon}</div>}
      </div>

      {/* Main Value - IBM Plex Mono */}
      <div className="flex items-baseline gap-2">
        <h3 className={cn(
          "font-mono font-medium text-[#E8EDF2]",
          isCompact ? "text-lg" : "text-2xl",
          variant === 'highlight' && "text-[#225AEB]" // Brand Blue highlight
        )}>
          {value}
        </h3>

        {/* Trend Indicator */}
        {trend && trend !== 'neutral' && (
          <div className={cn(
            "flex items-center text-xs font-mono",
            trend === 'up' ? "text-[#2FD08A]" : "text-[#D84A57]"
          )}>
            {trend === 'up' ? <ArrowUpIcon className="w-3 h-3 mr-0.5" /> : <ArrowDownIcon className="w-3 h-3 mr-0.5" />}
            {trendValue}
          </div>
        )}
      </div>

      {/* Secondary Value */}
      {subValue && (
        <p className="text-[#626C78] text-xs mt-1 font-mono">
          {subValue}
        </p>
      )}

      {/* Subtle Glow Effect on Hover (optional, can be CSS-only) */}
      <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent opacity-0 hover:opacity-100 pointer-events-none transition-opacity duration-500" />
    </div>
  )
}
