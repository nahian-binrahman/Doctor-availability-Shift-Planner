
'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function getLeaves() {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('doctor_leaves')
        .select(`
            *,
            doctor:profiles!doctor_id(full_name)
        `)
        .order('start_date', { ascending: true })

    if (error) throw error
    return data
}

export async function addLeave(data: {
    doctor_id: string,
    start_date: string,
    end_date: string,
    reason: string
}) {
    // Basic validation
    if (new Date(data.start_date) > new Date(data.end_date)) {
        return { error: "End date cannot be before start date" }
    }

    const supabase = await createClient()
    const { error } = await supabase
        .from('doctor_leaves')
        .insert(data)

    if (error) return { error: error.message }

    revalidatePath('/admin/leaves')
    return { success: true }
}

export async function deleteLeave(id: string) {
    const supabase = await createClient()
    const { error } = await supabase
        .from('doctor_leaves')
        .delete()
        .eq('id', id)

    if (error) return { error: error.message }

    revalidatePath('/admin/leaves')
    return { success: true }
}
