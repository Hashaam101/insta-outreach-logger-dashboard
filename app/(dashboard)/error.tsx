'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertCircle, RefreshCcw } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Dashboard Error:', error)
  }, [error])

  return (
    <div className="flex h-[400px] w-full flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
        <AlertCircle className="h-10 w-10 text-red-600 dark:text-red-400" />
      </div>
      <h2 className="mt-6 text-2xl font-bold tracking-tight">Something went wrong!</h2>
      <p className="mt-2 max-w-xs text-sm text-muted-foreground">
        We encountered an error while fetching the dashboard data. This might be due to a database connection timeout.
      </p>
      <div className="mt-8 flex gap-4">
        <Button onClick={() => reset()} className="gap-2">
          <RefreshCcw className="h-4 w-4" />
          Try again
        </Button>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Refresh Page
        </Button>
      </div>
      {error.digest && (
        <p className="mt-4 text-xs text-muted-foreground font-mono">
          Error ID: {error.digest}
        </p>
      )}
    </div>
  )
}
