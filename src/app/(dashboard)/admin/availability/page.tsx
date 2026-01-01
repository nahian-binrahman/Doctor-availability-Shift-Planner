
"use client"

import { useState, useEffect } from "react"
import { getDoctors } from "../doctors/actions"
import { getDoctorAvailability, addAvailabilitySlot, deleteAvailabilitySlot } from "./actions"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Plus, Trash2, Clock, CalendarDays, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog"

const DAYS = [
    "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
]

export default function AvailabilityPage() {
    const [doctors, setDoctors] = useState<any[]>([])
    const [selectedDoctorId, setSelectedDoctorId] = useState<string>("")
    const [slots, setSlots] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [targetDay, setTargetDay] = useState<number | null>(null)

    const [newStartTime, setNewStartTime] = useState("09:00")
    const [newEndTime, setNewEndTime] = useState("17:00")

    // Fetch doctors on mount
    useEffect(() => {
        getDoctors().then(docs => {
            const activeDocs = docs.filter(d => d.doctors?.[0]?.is_active !== false)
            setDoctors(activeDocs)
        })
    }, [])

    // Fetch slots when doctor selection changes
    useEffect(() => {
        if (selectedDoctorId) {
            loadSlots()
        } else {
            setSlots([])
        }
    }, [selectedDoctorId])

    async function loadSlots() {
        setLoading(true)
        try {
            const data = await getDoctorAvailability(selectedDoctorId)
            setSlots(data)
        } catch (error) {
            toast.error("Failed to load availability")
        } finally {
            setLoading(false)
        }
    }

    async function handleAddSlot() {
        if (targetDay === null) return

        setLoading(true)
        const res = await addAvailabilitySlot({
            doctor_id: selectedDoctorId,
            day_of_week: targetDay,
            start_time: newStartTime,
            end_time: newEndTime
        })
        setLoading(false)

        if (res.error) {
            toast.error(res.error)
        } else {
            toast.success("Slot added successfully")
            setIsAddModalOpen(false)
            loadSlots()
        }
    }

    async function handleDeleteSlot(id: string) {
        const res = await deleteAvailabilitySlot(id)
        if (res.error) {
            toast.error(res.error)
        } else {
            toast.success("Slot removed")
            loadSlots()
        }
    }

    const openAddModal = (dayIndex: number) => {
        setTargetDay(dayIndex)
        setIsAddModalOpen(true)
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight text-primary">Weekly Availability</h1>
                <p className="text-muted-foreground">
                    Define recurring weekly shift hours for each doctor. These slots define when appointments can be booked.
                </p>
            </div>

            <Card className="border-primary/20 bg-primary/5">
                <CardHeader className="pb-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <CalendarDays className="h-5 w-5 text-primary" />
                        Select Doctor to Manage
                    </CardTitle>
                    <CardDescription>Only active doctors are shown in this list</CardDescription>
                </CardHeader>
                <CardContent>
                    <Select onValueChange={setSelectedDoctorId} value={selectedDoctorId}>
                        <SelectTrigger className="w-full md:w-[400px] bg-background">
                            <SelectValue placeholder="Choose a doctor..." />
                        </SelectTrigger>
                        <SelectContent>
                            {doctors.map(doc => (
                                <SelectItem key={doc.id} value={doc.id}>
                                    <div className="flex items-center gap-2">
                                        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: doc.doctors?.[0]?.color_code || '#ccc' }} />
                                        <span>{doc.full_name}</span>
                                        <span className="text-xs text-muted-foreground">({doc.doctors?.[0]?.specialization})</span>
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </CardContent>
            </Card>

            {selectedDoctorId ? (
                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
                    {DAYS.map((dayName, index) => {
                        const daySlots = slots.filter(s => s.day_of_week === index)
                        return (
                            <Card key={dayName} className="flex flex-col border-muted hover:border-primary/30 transition-colors">
                                <CardHeader className="pb-3 bg-muted/30">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-base font-bold text-primary">{dayName}</CardTitle>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 rounded-full text-primary hover:bg-primary/10"
                                            onClick={() => openAddModal(index)}
                                        >
                                            <Plus className="h-5 w-5" />
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="flex-1 p-4">
                                    <div className="space-y-3">
                                        {daySlots.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center py-8 text-center opacity-40">
                                                <Clock className="h-8 w-8 mb-2" />
                                                <p className="text-xs font-medium">No shifts defined</p>
                                            </div>
                                        ) : (
                                            daySlots.map(slot => (
                                                <div key={slot.id} className="group relative flex items-center justify-between p-3 rounded-xl bg-card border border-border/50 hover:shadow-md transition-all">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 rounded-lg bg-primary/10">
                                                            <Clock className="h-4 w-4 text-primary" />
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-bold">
                                                                {slot.start_time.substring(0, 5)} - {slot.end_time.substring(0, 5)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 opacity-0 group-hover:opacity-100 text-destructive hover:bg-destructive/10 transition-opacity"
                                                        onClick={() => handleDeleteSlot(slot.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center h-[400px] border-2 border-dashed rounded-2xl bg-muted/5">
                    <div className="p-4 rounded-full bg-muted/20 mb-4">
                        <AlertCircle className="h-10 w-10 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold">No Doctor Selected</h3>
                    <p className="text-muted-foreground max-w-xs text-center">
                        Please select a doctor from the dropdown above to view or manage their weekly shift schedule.
                    </p>
                </div>
            )}

            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="text-primary flex items-center gap-2">
                            Add Availability - {targetDay !== null && DAYS[targetDay]}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-6 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-bold">Start Time</label>
                                <Input
                                    type="time"
                                    value={newStartTime}
                                    onChange={(e) => setNewStartTime(e.target.value)}
                                    className="font-mono"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold">End Time</label>
                                <Input
                                    type="time"
                                    value={newEndTime}
                                    onChange={(e) => setNewEndTime(e.target.value)}
                                    className="font-mono"
                                />
                            </div>
                        </div>
                        <div className="bg-primary/5 p-4 rounded-lg flex items-start gap-3">
                            <AlertCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                            <p className="text-xs text-muted-foreground">
                                Ensure this slot does not overlap with existing shifts on this day. The slot duration set in the doctor profile will be used for booking logic.
                            </p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleAddSlot} disabled={loading}>
                            {loading ? "Adding..." : "Add Shift Range"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
