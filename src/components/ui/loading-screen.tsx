
import { Loader2 } from "lucide-react"

export function LoadingScreen() {
    return (
        <div className="flex h-[400px] w-full items-center justify-center">
            <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-sm font-medium text-muted-foreground animate-pulse">Loading workspace...</p>
            </div>
        </div>
    )
}
