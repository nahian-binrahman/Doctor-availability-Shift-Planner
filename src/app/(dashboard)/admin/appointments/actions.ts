
'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { format, getDay, addMinutes, isBefore, startOfToday } from "date-fns"
import { createAuditLog } from "@/lib/audit"

export async function getAppointments() {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('appointments')
        .select(`
        *,
        doctor:profiles(full_name)
      `)
        .order('start_time', { ascending: true })

    if (error) throw error
    return data
}

export async function createAppointment(data: {
    doctor_id: string,
    patient_name: string,
    start_time: string,
    duration: number, // in minutes
    notes?: string
}) {
    const supabase = await createClient()
    const start = new Date(data.start_time)
    const end = addMinutes(start, data.duration)

    // 0. Prevent booking in the past
    if (isBefore(start, startOfToday())) {
        return { error: "Cannot book appointments in the past." }
    }

    // 1. Check for Leaves
    const { data: leaves } = await supabase
        .from('doctor_leaves')
        .select('*')
        .eq('doctor_id', data.doctor_id)
        .lte('start_date', format(start, 'yyyy-MM-dd'))
        .gte('end_date', format(start, 'yyyy-MM-dd'))

    if (leaves && leaves.length > 0) {
        return { error: "Doctor is on leave on this day." }
    }

    // 2. Check for Availability Slot
    const dayOfWeek = getDay(start)
    const timeStr = format(start, 'HH:mm:ss')
    const endTimeStr = format(end, 'HH:mm:ss')

    const { data: slots } = await supabase
        .from('availability_slots')
        .select('*')
        .eq('doctor_id', data.doctor_id)
        .eq('day_of_week', dayOfWeek)
        .lte('start_time', timeStr)
        .gte('end_time', endTimeStr)

    if (!slots || slots.length === 0) {
        return { error: "Requested time is outside of doctor's available shift." }
    }

    // 3. Check for Overlapping Appointments
    // Logic: (NewStart < ExistingEnd) AND (NewEnd > ExistingStart)
    const { data: overlaps, error: overlapError } = await supabase
        .from('appointments')
        .select('id')
        .eq('doctor_id', data.doctor_id)
        .neq('status', 'cancelled')
        .lt('start_time', end.toISOString())
        .gt('end_time', start.toISOString())

    if (overlapError) return { error: overlapError.message }

    if (overlaps && overlaps.length > 0) {
        return { error: "Time slot already booked for another appointment." }
    }

    // 4. Create Appointment
    const { error: insertError } = await supabase
        .from('appointments')
        .insert({
            doctor_id: data.doctor_id,
            patient_name: data.patient_name,
            start_time: start.toISOString(),
            end_time: end.toISOString(),
            notes: data.notes,
            status: 'scheduled'
        })

    if (insertError) return { error: insertError.message }

    await createAuditLog('create_appointment', 'appointment', data.doctor_id, {
        patient: data.patient_name,
        time: data.start_time
    })

    revalidatePath('/admin/appointments')
    return { success: true }
}

export async function updateAppointmentStatus(id: string, status: string) {
    const supabase = await createClient()
    const { error } = await supabase
        .from('appointments')
        .update({ status })
        .eq('id', id)

    if (error) return { error: error.message }

    await createAuditLog('update_appointment_status', 'appointment', id, { status })

    revalidatePath('/admin/appointments')
    return { success: true }
}
