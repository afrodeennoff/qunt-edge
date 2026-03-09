'use client'

import { useEffect } from 'react'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[Dashboard Error Boundary]', error)
  }, [error])

  return (
    <main className="flex min-h-[60vh] items-center justify-center p-6">
      <section className="w-full max-w-lg rounded-lg border bg-background p-6 shadow-sm">
        <h1 className="text-lg font-semibold">Dashboard failed to load</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {error.message || 'A dashboard error occurred.'}
        </p>
        <div className="mt-4 flex gap-2">
          <button
            className="rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground"
            onClick={reset}
            type="button"
          >
            Reload dashboard
          </button>
          <button
            className="rounded-md border px-3 py-2 text-sm"
            onClick={() => window.location.assign('/')}
            type="button"
          >
            Go home
          </button>
        </div>
      </section>
    </main>
  )
}
