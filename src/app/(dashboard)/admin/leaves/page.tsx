
import { getLeaves, deleteLeave } from "./actions"
import { getDoctors } from "../doctors/actions"
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
} from "@/components/ui/dialog"
import { CalendarOff, Trash2, CalendarDays, History } from "lucide-react"
import { format, isAfter, isBefore, startOfToday } from "date-fns"
import { LeaveForm } from "./LeaveForm"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

export default async function LeavesPage() {
    const [leaves, doctors] = await Promise.all([
        getLeaves(),
        getDoctors()
    ])

    const today = startOfToday()
    const upcomingLeaves = leaves.filter(l => isAfter(new Date(l.end_date), today) || format(new Date(l.end_date), 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd'))
    const pastLeaves = leaves.filter(l => isBefore(new Date(l.end_date), today) && format(new Date(l.end_date), 'yyyy-MM-dd') !== format(today, 'yyyy-MM-dd'))

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-primary">Doctor Leaves</h1>
                    <p className="text-muted-foreground">
                        Manage time off and exceptions to doctor availability.
                    </p>
                </div>

                <Dialog>
                    <DialogTrigger asChild>
                        <Button className="shadow-lg hover:shadow-primary/20 transition-all">
                            <CalendarOff className="mr-2 h-4 w-4" />
                            Log New Leave
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle className="text-primary">Add Doctor Leave</DialogTitle>
                        </DialogHeader>
                        <LeaveForm doctors={doctors} />
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-8">
                {/* Upcoming Leaves */}
                <Card className="border-primary/20 bg-primary/5">
                    <CardHeader className="flex flex-row items-center gap-2">
                        <CalendarDays className="h-5 w-5 text-primary" />
                        <CardTitle className="text-xl text-primary font-bold">Upcoming & Current Leaves</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-xl border bg-card overflow-hidden shadow-sm">
                            <Table>
                                <TableHeader className="bg-muted/50">
                                    <TableRow>
                                        <TableHead>Doctor</TableHead>
                                        <TableHead>Range</TableHead>
                                        <TableHead>Reason</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {upcomingLeaves.map((leave) => (
                                        <TableRow key={leave.id} className="hover:bg-muted/30 transition-colors">
                                            <TableCell className="font-bold">{leave.doctor?.full_name}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-mono text-xs bg-muted px-2 py-1 rounded">
                                                        {format(new Date(leave.start_date), 'MMM d, yyyy')}
                                                    </span>
                                                    <span className="text-muted-foreground">→</span>
                                                    <span className="font-mono text-xs bg-muted px-2 py-1 rounded">
                                                        {format(new Date(leave.end_date), 'MMM d, yyyy')}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="max-w-[200px] truncate text-muted-foreground italic">
                                                {leave.reason || "No reason provided"}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <form action={async () => {
                                                    'use server'
                                                    await deleteLeave(leave.id)
                                                }}>
                                                    <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10">
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </form>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {upcomingLeaves.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={4} className="h-24 text-center text-muted-foreground italic">
                                                No upcoming leaves found.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>

                {/* Past Leaves */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 px-2">
                        <History className="h-4 w-4 text-muted-foreground" />
                        <h2 className="text-lg font-semibold text-muted-foreground">Past History</h2>
                    </div>
                    <div className="rounded-xl border bg-card/50 overflow-hidden">
                        <Table>
                            <TableBody>
                                {pastLeaves.map((leave) => (
                                    <TableRow key={leave.id} className="opacity-60 grayscale-[0.5]">
                                        <TableCell className="font-medium text-sm">{leave.doctor?.full_name}</TableCell>
                                        <TableCell className="text-xs">
                                            {format(new Date(leave.start_date), 'MMM d')} - {format(new Date(leave.end_date), 'MMM d, yyyy')}
                                        </TableCell>
                                        <TableCell className="text-xs italic truncate max-w-[150px]">{leave.reason}</TableCell>
                                        <TableCell className="text-right">
                                            <form action={async () => {
                                                'use server'
                                                await deleteLeave(leave.id)
                                            }}>
                                                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive">
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>
                                            </form>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {pastLeaves.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-12 text-center text-xs text-muted-foreground italic">
                                            No past records.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>
        </div>
    )
}
