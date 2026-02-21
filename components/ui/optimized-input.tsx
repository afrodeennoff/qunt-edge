'use client'

import React, { useState, useCallback, useEffect, forwardRef } from 'react'
import { Input } from '@/components/ui/input'
import { useDebouncedCallback } from '@/lib/performance/render-optimization'

interface OptimizedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  debounceMs?: number
  onDebouncedChange?: (value: string) => void
  showLoadingIndicator?: boolean
}

export const OptimizedInput = forwardRef<HTMLInputElement, OptimizedInputProps>(
  ({ debounceMs = 300, onDebouncedChange, showLoadingIndicator = false, onChange, ...props }, ref) => {
    const [localValue, setLocalValue] = useState(props.value || props.defaultValue || '')
    const [isDebouncing, setIsDebouncing] = useState(false)

    useEffect(() => {
      setLocalValue(props.value || props.defaultValue || '')
    }, [props.value, props.defaultValue])

    const debouncedOnChange = useDebouncedCallback((value: string) => {
      setIsDebouncing(false)
      onDebouncedChange?.(value)
    }, debounceMs)

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      setLocalValue(value)
      setIsDebouncing(true)
      
      onChange?.(e)
      debouncedOnChange(value)
    }, [onChange, debouncedOnChange])

    return (
      <div className="relative">
        <Input
          ref={ref}
          {...props}
          value={localValue}
          onChange={handleChange}
        />
        {showLoadingIndicator && isDebouncing && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        )}
      </div>
    )
  }
)

OptimizedInput.displayName = 'OptimizedInput'
