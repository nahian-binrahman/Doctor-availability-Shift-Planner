
"use client"

import { useState, useEffect } from "react"
import { getDoctors } from "../doctors/actions"
import { createAppointment } from "./actions"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import { Loader2, Calendar, User, Clock, FileText } from "lucide-react"

const formSchema = z.object({
    doctor_id: z.string().min(1, "Select a doctor"),
    patient_name: z.string().min(2, "Patient name is required"),
    start_time: z.string().min(1, "Pick a date and time"),
    duration: z.string(),
    notes: z.string().optional(),
})

export function AppointmentForm({ onSuccess }: { onSuccess?: () => void }) {
    const [doctors, setDoctors] = useState<any[]>([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        getDoctors().then(docs => {
            setDoctors(docs.filter(d => d.doctors?.[0]?.is_active !== false))
        })
    }, [])

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            patient_name: "",
            notes: "",
            duration: "30",
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setLoading(true)
        const res = await createAppointment({
            ...values,
            duration: parseInt(values.duration)
        })
        setLoading(false)

        if (res.error) {
            toast.error(res.error)
        } else {
            toast.success("Appointment booked successfully!")
            form.reset()
            onSuccess?.()
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="doctor_id"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="flex items-center gap-2">
                                <User className="h-4 w-4 text-primary" />
                                Assigned Doctor
                            </FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger className="bg-muted/50 border-primary/20">
                                        <SelectValue placeholder="Select a doctor" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {doctors.map(doc => (
                                        <SelectItem key={doc.id} value={doc.id}>
                                            <div className="flex items-center gap-2">
                                                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: doc.doctors?.[0]?.color_code }} />
                                                <span>{doc.full_name}</span>
                                                <span className="text-[10px] text-muted-foreground uppercase tracking-widest ml-2">
                                                    {doc.doctors?.[0]?.specialization}
                                                </span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="patient_name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="flex items-center gap-2">
                                <User className="h-4 w-4 text-primary" />
                                Patient Full Name
                            </FormLabel>
                            <FormControl>
                                <Input placeholder="Enter patient name..." className="bg-muted/50 border-primary/20" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                        control={form.control}
                        name="start_time"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-primary" />
                                    Date & Start Time
                                </FormLabel>
                                <FormControl>
                                    <Input type="datetime-local" className="bg-muted/50 border-primary/20" {...field} />
                                </FormControl>
                                <FormDescription className="text-[10px]">Must fall within doctor's availability</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="duration"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-primary" />
                                    Consultation Time
                                </FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value.toString()}>
                                    <FormControl>
                                        <SelectTrigger className="bg-muted/50 border-primary/20">
                                            <SelectValue />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="15">15 Minutes</SelectItem>
                                        <SelectItem value="30">30 Minutes</SelectItem>
                                        <SelectItem value="45">45 Minutes</SelectItem>
                                        <SelectItem value="60">1 Hour</SelectItem>
                                        <SelectItem value="90">1.5 Hours</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-primary" />
                                Appointment Notes
                            </FormLabel>
                            <FormControl>
                                <Input placeholder="Brief reason for the visit..." className="bg-muted/50 border-primary/20" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button type="submit" className="w-full shadow-lg" disabled={loading}>
                    {loading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Checking Conflicts...
                        </>
                    ) : (
                        "Confirm & Book Appointment"
                    )}
                </Button>
            </form>
        </Form>
    )
}
