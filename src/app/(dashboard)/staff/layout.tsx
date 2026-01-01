
import { requireRole } from "@/lib/auth"
import { ReactNode } from "react"
import { DashboardSidebar } from "@/components/layout/DashboardSidebar"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { LogOut } from "lucide-react"
import { ThemeToggle } from "@/components/layout/ThemeToggle"

export default async function StaffLayout({
    children,
}: {
    children: ReactNode
}) {
    await requireRole(['admin', 'staff'])

    async function signOut() {
        "use server"
        const supabase = await createClient()
        await supabase.auth.signOut()
        redirect("/login")
    }

    return (
        <div className="flex min-h-screen w-full">
            <DashboardSidebar role="staff" />
            <div className="flex flex-col flex-1">
                <header className="flex h-14 items-center border-b bg-muted/40 px-6 lg:h-[60px]">
                    <div className="flex-1"></div>
                    <div className="flex-[2] text-center">
                        <h2 className="text-lg font-bold tracking-tight text-primary">Doctor availability & Shift Planner</h2>
                    </div>
                    <div className="flex flex-1 items-center justify-end gap-4">
                        <ThemeToggle />
                        <form action={signOut}>
                            <button className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
                                <LogOut className="h-4 w-4" />
                                Sign Out
                            </button>
                        </form>
                    </div>
                </header>
                <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-muted/10">
                    {children}
                </main>
            </div>
        </div>
    )
}
