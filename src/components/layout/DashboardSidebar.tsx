
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
    Users,
    Clock,
    CalendarOff,
    Calendar,
    CalendarDays,
    LayoutDashboard
} from "lucide-react"

const adminItems = [
    { title: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { title: "Doctors", href: "/admin/doctors", icon: Users },
    { title: "Availability", href: "/admin/availability", icon: Clock },
    { title: "Leaves", href: "/admin/leaves", icon: CalendarOff },
    { title: "Appointments", href: "/admin/appointments", icon: Calendar },
]

const staffItems = [
    { title: "Dashboard", href: "/staff", icon: LayoutDashboard },
    { title: "Appointments", href: "/staff/appointments", icon: Calendar },
    { title: "Doctors", href: "/staff/doctors", icon: Users },
]

const doctorItems = [
    { title: "My Schedule", href: "/doctor", icon: LayoutDashboard },
    { title: "Appointments", href: "/doctor/appointments", icon: Calendar },
    { title: "My Leaves", href: "/doctor/leaves", icon: CalendarOff },
]

export function DashboardSidebar({ role }: { role: 'admin' | 'staff' | 'doctor' }) {
    const pathname = usePathname()

    const items = role === 'admin' ? adminItems : role === 'staff' ? staffItems : doctorItems
    const title = role.charAt(0).toUpperCase() + role.slice(1) + " Panel"

    return (
        <div className="flex h-screen w-64 flex-col border-r bg-background">
            <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
                <Link href="/" className="flex items-center gap-2 font-bold text-primary">
                    <span className="text-sm tracking-widest uppercase">{title}</span>
                </Link>
            </div>
            <div className="flex-1 overflow-auto py-2">
                <nav className="grid items-start px-2 text-sm font-medium lg:px-4 space-y-1">
                    {items.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary",
                                pathname === item.href
                                    ? "bg-muted text-primary"
                                    : "text-muted-foreground"
                            )}
                        >
                            <item.icon className="h-4 w-4" />
                            {item.title}
                        </Link>
                    ))}
                </nav>
            </div>
        </div>
    )
}
