
'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { createAuditLog } from "@/lib/audit"

export async function getDoctorAvailability(doctorId: string) {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('availability_slots')
        .select('*')
        .eq('doctor_id', doctorId)
        .order('day_of_week', { ascending: true })
        .order('start_time', { ascending: true })

    if (error) throw error
    return data
}

export async function addAvailabilitySlot(data: {
    doctor_id: string,
    day_of_week: number,
    start_time: string,
    end_time: string
}) {
    const supabase = await createClient()

    // 1. Basic validation
    if (data.start_time >= data.end_time) {
        return { error: "End time must be after start time" }
    }

    // 2. Check for overlaps
    const { data: existingSlots, error: fetchError } = await supabase
        .from('availability_slots')
        .select('start_time, end_time')
        .eq('doctor_id', data.doctor_id)
        .eq('day_of_week', data.day_of_week)

    if (fetchError) return { error: fetchError.message }

    const hasOverlap = existingSlots?.some(slot => {
        // Condition: (StartA < EndB) and (EndA > StartB)
        return data.start_time < slot.end_time && data.end_time > slot.start_time
    })

    if (hasOverlap) {
        return { error: "This time range overlaps with an existing slot on this day" }
    }

    // 3. Insert
    const { error } = await supabase
        .from('availability_slots')
        .insert(data)

    if (error) return { error: error.message }

    await createAuditLog('add_availability', 'availability_slot', data.doctor_id, data)

    revalidatePath('/admin/availability')
    return { success: true }
}

export async function deleteAvailabilitySlot(slotId: string) {
    const supabase = await createClient()
    const { error } = await supabase
        .from('availability_slots')
        .delete()
        .eq('id', slotId)

    if (error) return { error: error.message }

    await createAuditLog('delete_availability', 'availability_slot', slotId)

    revalidatePath('/admin/availability')
    return { success: true }
}
