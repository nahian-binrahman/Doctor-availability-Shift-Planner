
import { createClient } from "@/lib/supabase/server"
import { format, isAfter, startOfToday } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table"
import { CalendarDays, Clock, User, ClipboardList } from "lucide-react"

export default async function DoctorDashboard() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { data: appointments } = await supabase
        .from('appointments')
        .select('*')
        .eq('doctor_id', user?.id)
        .order('start_time', { ascending: true })

    const today = startOfToday()
    const upcoming = appointments?.filter(a => isAfter(new Date(a.start_time), today)) || []

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight text-primary">Doctor Workspace</h1>
                <p className="text-muted-foreground">Welcome back! Here is your upcoming patient schedule.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <Card className="bg-primary/5 border-primary/20">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-bold flex items-center gap-2">
                            <CalendarDays className="h-4 w-4 text-primary" />
                            Active Bookings
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{upcoming.length}</div>
                        <p className="text-xs text-muted-foreground mt-1">Confirmed for this week</p>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-muted shadow-sm">
                <CardHeader className="border-b bg-muted/20">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <CardTitle className="text-xl font-bold text-primary">Patient Schedule</CardTitle>
                            <CardDescription>Visual list of all scheduled consultations</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/10">
                                <TableHead className="pl-6">Consultation Time</TableHead>
                                <TableHead>Patient Details</TableHead>
                                <TableHead>Current Status</TableHead>
                                <TableHead className="pr-6">Clinical Notes</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {appointments?.map((app) => (
                                <TableRow key={app.id} className="hover:bg-primary/5 transition-all">
                                    <TableCell className="pl-6 font-medium">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-sm font-bold">{format(new Date(app.start_time), 'MMM d, yyyy')}</span>
                                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                {format(new Date(app.start_time), 'h:mm a')}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                                                {app.patient_name.substring(0, 2).toUpperCase()}
                                            </div>
                                            <span className="font-bold text-sm">{app.patient_name}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={app.status === 'scheduled' ? 'default' : 'secondary'}
                                            className={app.status === 'scheduled' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' : ''}
                                        >
                                            {app.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="pr-6 max-w-[250px] truncate text-muted-foreground italic text-sm">
                                        {app.notes || "No clinical notes attached."}
                                    </TableCell>
                                </TableRow>
                            ))}
                            {(!appointments || appointments.length === 0) && (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-64 text-center">
                                        <div className="flex flex-col items-center justify-center gap-3 opacity-40">
                                            <ClipboardList className="h-12 w-12" />
                                            <div className="space-y-1">
                                                <p className="text-lg font-bold uppercase tracking-widest">No Appointments Found</p>
                                                <p className="text-sm">Your schedule is currently clear for the upcoming days.</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
