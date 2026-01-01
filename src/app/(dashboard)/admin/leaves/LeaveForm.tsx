
"use client"

import { useState } from "react"
import { addLeave } from "./actions"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
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
import { Loader2 } from "lucide-react"

const formSchema = z.object({
    doctor_id: z.string().min(1, "Select a doctor"),
    start_date: z.string().min(1, "Pick start date"),
    end_date: z.string().min(1, "Pick end date"),
    reason: z.string().optional(),
})

export function LeaveForm({ doctors, onSuccess }: { doctors: any[], onSuccess?: () => void }) {
    const [loading, setLoading] = useState(false)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            reason: "",
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setLoading(true)
        const res = await addLeave({
            ...values,
            reason: values.reason || ""
        })
        setLoading(false)

        if (res.error) {
            toast.error(res.error)
        } else {
            toast.success("Leave logged successfully")
            form.reset()
            onSuccess?.()
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="doctor_id"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Doctor</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a doctor" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {doctors.map(doc => (
                                        <SelectItem key={doc.id} value={doc.id}>{doc.full_name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="start_date"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Start Date</FormLabel>
                                <FormControl>
                                    <Input type="date" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="end_date"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>End Date</FormLabel>
                                <FormControl>
                                    <Input type="date" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <FormField
                    control={form.control}
                    name="reason"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Reason (Optional)</FormLabel>
                            <FormControl>
                                <Input placeholder="Personal leave, conference, etc." {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" className="w-full" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Log Leave
                </Button>
            </form>
        </Form>
    )
}
