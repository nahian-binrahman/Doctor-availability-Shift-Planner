
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
        console.error(error)
    }, [error])

    return (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-6 text-center animate-in fade-in zoom-in duration-300">
            <div className="bg-destructive/10 p-4 rounded-full">
                <AlertCircle className="h-12 w-12 text-destructive" />
            </div>
            <div className="space-y-2">
                <h2 className="text-2xl font-bold tracking-tight">Something went wrong!</h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                    We encountered an unexpected error while preparing your dashboard.
                    Please try refreshing or contact support if the issue persists.
                </p>
                {error.message && (
                    <code className="text-xs bg-muted p-2 rounded block mt-4 font-mono">
                        {error.message}
                    </code>
                )}
            </div>
            <Button onClick={() => reset()} className="gap-2">
                <RefreshCcw className="h-4 w-4" />
                Try again
            </Button>
        </div>
    )
}
