
'use server'

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export async function signInAction(values: any) {
    const supabase = await createClient()

    const { data, error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
    })

    if (error) {
        return { error: error.message }
    }

    // Fetch profile to determine role
    let { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single()

    // FAIL-SAFE: If profile is missing (trigger failed), create it now
    if (!profile || profileError) {
        console.log(`Auto-creating missing profile for ${data.user.id}`)
        const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .upsert({
                id: data.user.id,
                email: data.user.email,
                full_name: data.user.email?.split('@')[0] || 'User',
                role: 'staff' // Default role
            })
            .select('role')
            .single()

        if (createError) {
            console.error("Critical: Could not auto-create profile", createError.message)
        } else {
            profile = newProfile
        }
    }

    const role = profile?.role || 'staff'

    // LOG FOR DEBUGGING
    console.log(`Login Success: User ${data.user.id}, Role: ${role}`)

    // Direct server-side redirect
    if (role === 'admin') redirect('/admin')
    if (role === 'doctor') redirect('/doctor')
    redirect('/staff')
}
