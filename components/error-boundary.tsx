'use client'

import React, { Component, ReactNode } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface ErrorBoundaryProps {
    children: ReactNode
    fallback?: React.ComponentType<FallbackProps>
    onError?: (error: Error, errorInfo: React.ErrorInfo) => void
    resetKeys?: Array<string | number>
}

interface ErrorBoundaryState {
    hasError: boolean
    error: Error | null
    errorInfo: React.ErrorInfo | null
}

export interface FallbackProps {
    error: Error | null
    resetError: () => void
    errorInfo: React.ErrorInfo | null
}

/**
 * Enterprise-grade Error Boundary Component
 * 
 * Features:
 * - Catches React errors in child components
 * - Prevents entire app crash
 * - Logs errors to monitoring service
 * - Provides user-friendly error UI
 * - Allows error recovery
 * 
 * Usage:
 * <ErrorBoundary>
 *   <YourComponent />
 * </ErrorBoundary>
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props)
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
        }
    }

    static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
        return {
            hasError: true,
            error,
        }
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        // Log error to monitoring service
        console.error('ErrorBoundary caught error:', error, errorInfo)

        // Call custom error handler if provided
        this.props.onError?.(error, errorInfo)

        // In production, send to Sentry/monitoring
        if (typeof window !== 'undefined' && window.Sentry) {
            window.Sentry.captureException(error, {
                contexts: {
                    react: {
                        componentStack: errorInfo.componentStack,
                    },
                },
            })
        }

        this.setState({
            errorInfo,
        })
    }

    componentDidUpdate(prevProps: ErrorBoundaryProps) {
        // Reset error state when resetKeys change
        if (
            this.state.hasError &&
            this.props.resetKeys &&
            prevProps.resetKeys &&
            !this.arraysEqual(prevProps.resetKeys, this.props.resetKeys)
        ) {
            this.resetError()
        }
    }

    arraysEqual(arr1: Array<string | number>, arr2: Array<string | number>): boolean {
        return arr1.length === arr2.length && arr1.every((value, index) => value === arr2[index])
    }

    resetError = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null,
        })
    }

    render() {
        if (this.state.hasError) {
            // Use custom fallback if provided
            if (this.props.fallback) {
                const FallbackComponent = this.props.fallback
                return (
                    <FallbackComponent
                        error={this.state.error}
                        errorInfo={this.state.errorInfo}
                        resetError={this.resetError}
                    />
                )
            }

            // Default fallback UI
            return <DefaultErrorFallback error={this.state.error} resetError={this.resetError} />
        }

        return this.props.children
    }
}

/**
 * Default Error Fallback Component
 * Provides user-friendly error UI with recovery options
 */
function DefaultErrorFallback({ error, resetError }: { error: Error | null; resetError: () => void }) {
    const router = useRouter()

    return (
        <div className="flex items-center justify-center min-h-[400px] p-4">
            <Card className="w-full max-w-lg border-destructive/50">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-destructive" />
                        <CardTitle>Something went wrong</CardTitle>
                    </div>
                    <CardDescription>
                        An error occurred while rendering this component
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {error && (
                        <div className="rounded-lg bg-muted p-4">
                            <p className="text-sm font-mono text-muted-foreground break-all">
                                {error.message}
                            </p>
                        </div>
                    )}
                    <p className="text-sm text-muted-foreground">
                        This error has been logged and our team has been notified. You can try the following:
                    </p>
                </CardContent>
                <CardFooter className="flex flex-col sm:flex-row gap-2">
                    <Button onClick={resetError} variant="default" className="w-full sm:w-auto">
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Try Again
                    </Button>
                    <Button onClick={() => router.push('/')} variant="outline" className="w-full sm:w-auto">
                        <Home className="mr-2 h-4 w-4" />
                        Go Home
                    </Button>
                    <Button onClick={() => window.location.reload()} variant="outline" className="w-full sm:w-auto">
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Reload Page
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}

/**
 * Widget-specific Error Fallback
 * Used for dashboard widgets that can fail independently
 */
export function WidgetErrorFallback({ error, resetError }: FallbackProps) {
    return (
        <Card className="h-full border-destructive/30">
            <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                    <CardTitle className="text-sm">Widget Error</CardTitle>
                </div>
            </CardHeader>
            <CardContent>
                <p className="text-xs text-muted-foreground mb-3">
                    This widget failed to load. Other widgets should still work normally.
                </p>
                <Button onClick={resetError} size="sm" variant="outline" className="w-full">
                    <RefreshCw className="mr-2 h-3 w-3" />
                    Retry
                </Button>
            </CardContent>
        </Card>
    )
}

/**
 * Import Flow Error Fallback
 * Used for trade import wizard
 */
export function ImportErrorFallback({ error, resetError }: FallbackProps) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[300px] p-8 text-center">
            <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
            <h3 className="text-lg font-semibold mb-2">Import Failed</h3>
            <p className="text-sm text-muted-foreground mb-4 max-w-md">
                {error?.message || 'An error occurred while importing your trades. Your data has not been modified.'}
            </p>
            <div className="flex gap-2">
                <Button onClick={resetError} variant="default">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Try Again
                </Button>
                <Button onClick={() => window.location.reload()} variant="outline">
                    Start Over
                </Button>
            </div>
        </div>
    )
}

/**
 * Settings Error Fallback
 * Used for settings pages
 */
export function SettingsErrorFallback({ error, resetError }: FallbackProps) {
    const router = useRouter()

    return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-destructive" />
                        <CardTitle>Settings Error</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                        An error occurred while loading your settings. Your changes may not have been saved.
                    </p>
                    {error && (
                        <div className="rounded-lg bg-destructive/10 p-3">
                            <p className="text-xs font-mono text-destructive">
                                {error.message}
                            </p>
                        </div>
                    )}
                </CardContent>
                <CardFooter className="flex gap-2">
                    <Button onClick={resetError} variant="default" className="flex-1">
                        Retry
                    </Button>
                    <Button onClick={() => router.push('/dashboard')} variant="outline" className="flex-1">
                        Go to Dashboard
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}

// Type augmentation for Sentry
declare global {
    interface Window {
        Sentry?: {
            captureException: (error: Error, context?: any) => void
        }
    }
}
