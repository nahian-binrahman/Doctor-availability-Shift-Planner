
'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { createAuditLog } from "@/lib/audit"

export async function getDoctors() {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('profiles')
        .select(`
      id,
      full_name,
      email,
      role,
      doctors (
        specialization,
        phone,
        color_code,
        slot_duration,
        is_active
      )
    `)
        .eq('role', 'doctor')

    if (error) throw error
    return data
}

export async function getAllProfiles() {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('full_name')

    if (error) throw error
    return data
}

export async function updateDoctorProfile(userId: string, data: {
    specialization: string,
    phone: string,
    color_code: string,
    slot_duration: number,
    is_active?: boolean
}) {
    const supabase = await createClient()

    // 1. Ensure the user's role is set to doctor in profiles
    const { error: profileError } = await supabase
        .from('profiles')
        .update({ role: 'doctor' })
        .eq('id', userId)

    if (profileError) return { error: profileError.message }

    // 2. Upsert the doctor-specific info
    const { error: doctorError } = await supabase
        .from('doctors')
        .upsert({
            id: userId,
            specialization: data.specialization,
            phone: data.phone,
            color_code: data.color_code,
            slot_duration: data.slot_duration,
            is_active: data.is_active ?? true
        })

    if (doctorError) return { error: doctorError.message }

    await createAuditLog('update_doctor', 'doctor', userId, data)

    revalidatePath('/admin/doctors')
    return { success: true }
}

export async function toggleDoctorStatus(userId: string, currentStatus: boolean) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('doctors')
        .update({ is_active: !currentStatus })
        .eq('id', userId)

    if (error) return { error: error.message }

    await createAuditLog('toggle_doctor_status', 'doctor', userId, { is_active: !currentStatus })

    revalidatePath('/admin/doctors')
    return { success: true }
}

export async function removeDoctorRole(userId: string) {
    const supabase = await createClient()

    const { error: docError } = await supabase
        .from('doctors')
        .delete()
        .eq('id', userId)

    if (docError) return { error: docError.message }

    const { error: profileError } = await supabase
        .from('profiles')
        .update({ role: 'staff' })
        .eq('id', userId)

    if (profileError) return { error: profileError.message }

    revalidatePath('/admin/doctors')
    return { success: true }
}
