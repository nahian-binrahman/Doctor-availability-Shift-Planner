
"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
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
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { updateDoctorProfile } from "./actions"

const doctorSchema = z.object({
    specialization: z.string().min(2, "Specialization is required"),
    phone: z.string().min(5, "Phone number is required"),
    color_code: z.string().regex(/^#[0-9A-F]{6}$/i, "Must be a valid hex color"),
    slot_duration: z.coerce.number().min(5, "Minimum slot duration is 5 minutes").max(120, "Maximum slot duration is 120 minutes"),
    is_active: z.boolean().default(true),
})

interface DoctorFormProps {
    userId: string
    defaultValues?: z.infer<typeof doctorSchema>
    onSuccess?: () => void
}

export function DoctorForm({ userId, defaultValues, onSuccess }: DoctorFormProps) {
    const [loading, setLoading] = useState(false)

    const form = useForm<z.infer<typeof doctorSchema>>({
        resolver: zodResolver(doctorSchema),
        defaultValues: defaultValues || {
            specialization: "",
            phone: "",
            color_code: "#3b82f6",
            slot_duration: 30,
            is_active: true,
        },
    })

    async function onSubmit(values: z.infer<typeof doctorSchema>) {
        setLoading(true)
        const result = await updateDoctorProfile(userId, values)
        setLoading(false)

        if (result.error) {
            toast.error(result.error)
        } else {
            toast.success("Doctor details saved")
            onSuccess?.()
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="specialization"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Specialty</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g. Cardiologist" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Phone Number</FormLabel>
                                <FormControl>
                                    <Input placeholder="+1 234 567 890" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="slot_duration"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Slot Duration (min)</FormLabel>
                                <FormControl>
                                    <Input type="number" {...field} />
                                </FormControl>
                                <FormDescription>Minutes per appointment</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="color_code"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Calendar Color</FormLabel>
                            <FormControl>
                                <div className="flex gap-2">
                                    <Input type="color" className="w-12 h-10 p-1 cursor-pointer" {...field} />
                                    <Input placeholder="#000000" {...field} />
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="is_active"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                            <div className="space-y-0.5">
                                <FormLabel>Status</FormLabel>
                                <FormDescription>
                                    Whether the doctor is currently active
                                </FormDescription>
                            </div>
                            <FormControl>
                                <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />

                <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Saving..." : "Save Doctor Profile"}
                </Button>
            </form>
        </Form>
    )
}
