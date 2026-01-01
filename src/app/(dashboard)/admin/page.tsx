
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Calendar, Clock, AlertTriangle } from "lucide-react"

export default async function AdminDashboard() {
    const supabase = await createClient()

    const [
        { count: doctorCount },
        { count: appointmentCount },
        { data: recentAppointments }
    ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'doctor'),
        supabase.from('appointments').select('*', { count: 'exact', head: true }).eq('status', 'scheduled'),
        supabase.from('appointments').select(`
        id, 
        patient_name, 
        start_time, 
        doctor:profiles(full_name)
    `).order('start_time', { ascending: true }).limit(5)
    ])

    const stats = [
        {
            title: "Total Doctors",
            value: doctorCount || 0,
            icon: Users,
            description: "Active clinic doctors"
        },
        {
            title: "Active Appointments",
            value: appointmentCount || 0,
            icon: Calendar,
            description: "Scheduled for upcoming days"
        },
        {
            title: "Waitlist",
            value: "0",
            icon: Clock,
            description: "Patients waiting"
        },
        {
            title: "Critical Overlaps",
            value: "0",
            icon: AlertTriangle,
            description: "Conflicts detected"
        }
    ]

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h1 className="text-3xl font-bold tracking-tight text-primary">Dashboard Overview</h1>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                    <Card key={stat.title} className="hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-bold text-primary">
                                {stat.title}
                            </CardTitle>
                            <stat.icon className="h-4 w-4 text-primary" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-extrabold">{stat.value}</div>
                            <p className="text-xs text-foreground/70 mt-1">{stat.description}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Appointments</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {recentAppointments?.map((app: any) => (
                                <div key={app.id} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                                    <div>
                                        <p className="text-sm font-medium">{app.patient_name}</p>
                                        <p className="text-xs text-muted-foreground">with {app.doctor?.full_name}</p>
                                    </div>
                                    <div className="text-xs font-mono text-muted-foreground">
                                        {new Date(app.start_time).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                            ))}
                            {(!recentAppointments || recentAppointments.length === 0) && (
                                <p className="text-sm text-muted-foreground text-center py-4">No recent appointments</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Placeholder for system health or notification */}
                <Card>
                    <CardHeader>
                        <CardTitle>System Notifications</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col h-full items-center justify-center py-8 text-center bg-muted/20 rounded-lg">
                            <AlertTriangle className="h-8 w-8 text-yellow-500 mb-2 opacity-50" />
                            <p className="text-sm text-muted-foreground italic">No system issues reported</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
