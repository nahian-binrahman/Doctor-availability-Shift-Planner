
import { getAppointments, updateAppointmentStatus } from "./actions"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogDescription,
} from "@/components/ui/dialog"
import { AppointmentForm } from "./AppointmentForm"
import { CalendarCheck, Plus, Clock, User, CheckCircle2, XCircle, MoreVertical } from "lucide-react"
import { format, isAfter, isBefore, startOfToday } from "date-fns"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"

export default async function AppointmentsPage() {
    const appointments = await getAppointments()
    const today = startOfToday()

    const upcoming = appointments.filter(a => isAfter(new Date(a.start_time), today) || format(new Date(a.start_time), 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd'))
    const past = appointments.filter(a => isBefore(new Date(a.start_time), today) && format(new Date(a.start_time), 'yyyy-MM-dd') !== format(today, 'yyyy-MM-dd'))

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-primary">Appointments</h1>
                    <p className="text-muted-foreground">
                        Schedule and track patient consultations with smart conflict detection.
                    </p>
                </div>

                <Dialog>
                    <DialogTrigger asChild>
                        <Button className="shadow-lg shadow-primary/10">
                            <Plus className="mr-2 h-4 w-4" />
                            New Appointment
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle className="text-2xl text-primary font-bold">Book Appointment</DialogTitle>
                            <DialogDescription>
                                System will automatically check for doctor availability, leaves, and overlapping bookings.
                            </DialogDescription>
                        </DialogHeader>
                        <AppointmentForm />
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-8">
                {/* Active/Upcoming Section */}
                <Card className="border-primary/20 bg-primary/5">
                    <CardHeader className="pb-3 border-b border-primary/10">
                        <CardTitle className="text-lg flex items-center gap-2 text-primary font-bold">
                            <CalendarCheck className="h-5 w-5" />
                            Scheduled Sessions
                        </CardTitle>
                        <CardDescription>Upcoming and today's confirmed bookings</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-hidden">
                            <Table>
                                <TableHeader className="bg-muted/30">
                                    <TableRow>
                                        <TableHead className="pl-6">Patient</TableHead>
                                        <TableHead>Doctor</TableHead>
                                        <TableHead>Time Slot</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right pr-6">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {upcoming.map((app) => (
                                        <TableRow key={app.id} className="hover:bg-primary/5 transition-colors">
                                            <TableCell className="pl-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                                        {app.patient_name.substring(0, 2).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-sm">{app.patient_name}</p>
                                                        <p className="text-[10px] text-muted-foreground italic truncate max-w-[150px]">
                                                            {app.notes || "No notes"}
                                                        </p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="text-[10px] font-bold py-0 h-5 border-primary/30 text-primary">
                                                    {app.doctor?.full_name}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-xs font-mono font-bold">
                                                        {format(new Date(app.start_time), 'MMM d, yyyy')}
                                                    </span>
                                                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                                        <Clock className="h-3 w-3" />
                                                        {format(new Date(app.start_time), 'hh:mm a')} - {format(new Date(app.end_time), 'hh:mm a')}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    className={`
                                                        text-[10px] uppercase tracking-tighter
                                                        ${app.status === 'scheduled' ? 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20' : ''}
                                                        ${app.status === 'completed' ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20' : ''}
                                                        ${app.status === 'cancelled' ? 'bg-destructive/10 text-destructive hover:bg-destructive/20' : ''}
                                                    `}
                                                >
                                                    {app.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right pr-6">
                                                <div className="flex justify-end gap-1">
                                                    {app.status === 'scheduled' && (
                                                        <>
                                                            <form action={async () => {
                                                                'use server'
                                                                await updateAppointmentStatus(app.id, 'completed')
                                                            }}>
                                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-green-500 hover:bg-green-500/10" title="Complete">
                                                                    <CheckCircle2 className="h-4 w-4" />
                                                                </Button>
                                                            </form>
                                                            <form action={async () => {
                                                                'use server'
                                                                await updateAppointmentStatus(app.id, 'cancelled')
                                                            }}>
                                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" title="Cancel">
                                                                    <XCircle className="h-4 w-4" />
                                                                </Button>
                                                            </form>
                                                        </>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {upcoming.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={5} className="h-32 text-center text-muted-foreground italic">
                                                No appointments scheduled for today or later.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>

                {/* History Section */}
                <div className="space-y-4">
                    <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground px-2">Historical Records</h2>
                    <div className="rounded-xl border bg-card/50 overflow-hidden opacity-80">
                        <Table>
                            <TableBody>
                                {past.map((app) => (
                                    <TableRow key={app.id} className="text-xs">
                                        <TableCell className="pl-6 font-medium">{app.patient_name}</TableCell>
                                        <TableCell className="text-muted-foreground">{app.doctor?.full_name}</TableCell>
                                        <TableCell className="font-mono">
                                            {format(new Date(app.start_time), 'MM/dd')} | {format(new Date(app.start_time), 'hh:mm a')}
                                        </TableCell>
                                        <TableCell>
                                            <span className={`capitalize ${app.status === 'completed' ? 'text-green-500' : 'text-muted-foreground'}`}>
                                                {app.status}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right pr-6">
                                            <Button variant="ghost" size="icon" className="h-6 w-6">
                                                <MoreVertical className="h-3 w-3" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>
        </div>
    )
}
