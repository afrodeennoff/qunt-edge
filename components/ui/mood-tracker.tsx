"use client"

import React from "react"
import * as HoverCardPrimitives from "@radix-ui/react-hover-card"
import { cn } from "@/lib/utils"

interface TrackerBlockProps {
  key?: string | number
  color?: string
  hoverEffect?: boolean
  defaultBackgroundColor?: string
}

interface BlockInternalProps extends TrackerBlockProps {
  index: number
  selectedIndex: number | null
  hoveredIndex: number | null
  onHover: (index: number | null) => void
  onClick: (index: number) => void
  blockColor: string
  isHighlighted: boolean
  animationDelay: number
}

const Block = ({
  color,
  defaultBackgroundColor,
  hoverEffect,
  index,
  selectedIndex,
  hoveredIndex,
  onHover,
  onClick,
  blockColor,
  isHighlighted,
  animationDelay,
}: BlockInternalProps) => {
  const [open, setOpen] = React.useState(false)

  const shouldAnimate = selectedIndex !== null && index <= selectedIndex

  return (
    <HoverCardPrimitives.Root open={open} onOpenChange={setOpen} openDelay={0} closeDelay={0}>
      <HoverCardPrimitives.Trigger onClick={() => setOpen(true)} asChild>
        <div
          className="size-full overflow-hidden px-[0.5px] transition first:rounded-l-[4px] first:pl-0 last:rounded-r-[4px] last:pr-0 sm:px-px cursor-pointer"
          onMouseEnter={() => onHover(index)}
          onMouseLeave={() => onHover(null)}
          onClick={() => onClick(index)}
        >
          <div
            className={cn(
              "size-full rounded-[1px] transition-all duration-300",
              blockColor,
              hoverEffect ? "hover:opacity-80" : "",
              shouldAnimate && "animate-pulse",
            )}
            style={{
              animationDelay: shouldAnimate ? `${animationDelay}ms` : undefined,
              animationDuration: shouldAnimate ? "600ms" : undefined,
              animationIterationCount: shouldAnimate ? "1" : undefined,
            }}
          />
        </div>
      </HoverCardPrimitives.Trigger>
    </HoverCardPrimitives.Root>
  )
}

Block.displayName = "Block"

interface TrackerProps extends React.HTMLAttributes<HTMLDivElement> {
  data: TrackerBlockProps[]
  defaultBackgroundColor?: string
  hoverEffect?: boolean
  onSelectionChange?: (index: number) => void
  // Optional externally-controlled selected index for initial/controlled state
  valueIndex?: number | null
}

// Grayscale progression for strict monochrome mode.
const COLOR_SCALE = [
  "bg-[hsl(var(--chart-8))]",
  "bg-[hsl(var(--chart-7))]",
  "bg-[hsl(var(--chart-6))]",
  "bg-[hsl(var(--chart-5))]",
  "bg-[hsl(var(--chart-4))]",
  "bg-[hsl(var(--chart-3))]",
  "bg-[hsl(var(--chart-2))]",
] as const

const Tracker = React.forwardRef<HTMLDivElement, TrackerProps>(
  (
    { data = [], defaultBackgroundColor = "bg-gray-300", className, hoverEffect, onSelectionChange, valueIndex, ...props },
    forwardedRef,
  ) => {
    const [selectedIndex, setSelectedIndex] = React.useState<number | null>(null)
    const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null)
    const [animationKey, setAnimationKey] = React.useState(0)

    // Sync internal selection with external valueIndex when provided
    React.useEffect(() => {
      if (typeof valueIndex === 'number') {
        setSelectedIndex(valueIndex)
      } else if (valueIndex === null) {
        setSelectedIndex(null)
      }
    }, [valueIndex])

    const getBlockColor = React.useCallback(
      (blockIndex: number, activeIndex: number | null, totalBlocks: number) => {
        if (activeIndex === null) {
          return defaultBackgroundColor
        }

        if (blockIndex > activeIndex) {
          return "bg-[hsl(var(--chart-1)/0.22)]"
        }

        const safeIndex = activeIndex <= 0 ? 0 : activeIndex
        const intensity = Math.floor((blockIndex / safeIndex) * 6)
        return COLOR_SCALE[Math.min(intensity, 6)]
      },
      [defaultBackgroundColor],
    )

    const handleClick = (index: number) => {
      setSelectedIndex(index)
      setAnimationKey((prev) => prev + 1)
      onSelectionChange?.(index)
    }

    const handleHover = (index: number | null) => {
      setHoveredIndex(index)
    }

    const activeIndex = hoveredIndex !== null ? hoveredIndex : selectedIndex
    const totalBlocks = data.length

    return (
      <div ref={forwardedRef} className={cn("group flex h-8 w-full items-center", className)} {...props}>
        {data.map((blockProps, index) => {
          const { key: blockKey, ...restBlockProps } = blockProps
          const blockColor = getBlockColor(index, activeIndex, totalBlocks)
          const isHighlighted = activeIndex !== null && index > activeIndex
          const animationDelay = index * 20 // Faster animation

          return (
            <Block
              key={`${blockKey ?? index}-${animationKey}`}
              index={index}
              selectedIndex={selectedIndex}
              hoveredIndex={hoveredIndex}
              onHover={handleHover}
              onClick={handleClick}
              blockColor={blockColor}
              isHighlighted={isHighlighted}
              animationDelay={animationDelay}
              defaultBackgroundColor={defaultBackgroundColor}
              hoverEffect={hoverEffect}
              {...restBlockProps}
            />
          )
        })}
      </div>
    )
  },
)

Tracker.displayName = "Tracker"

export { Tracker, type TrackerBlockProps }
