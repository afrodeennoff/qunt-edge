"use client"

import React from "react"
import { AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface SidebarErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class SidebarErrorBoundary extends React.Component<
  SidebarErrorBoundaryProps,
  State
> {
  constructor(props: SidebarErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Sidebar Error Boundary caught an error:", error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="flex h-full w-full flex-col items-center justify-center p-4 text-center">
          <AlertTriangle className="mb-2 h-12 w-12 text-destructive" />
          <h3 className="mb-2 text-lg font-semibold">Navigation Error</h3>
          <p className="mb-4 text-sm text-muted-foreground">
            {this.state.error?.message || "An error occurred in the navigation"}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.reload()}
          >
            Reload Page
          </Button>
        </div>
      )
    }

    return this.props.children
  }
}

export function useSidebarError() {
  return React.useCallback((error: Error, errorInfo: React.ErrorInfo) => {
    console.error("Sidebar error:", error, errorInfo)
  }, [])
}
