
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export const getUserRole = async () => {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
        console.log("Auth Check: No user found", authError?.message)
        return null
    }

    const { data: profile, error: dbError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (dbError || !profile) {
        console.error("Auth Check FAILED:", {
            userId: user.id,
            error: dbError?.message,
            code: dbError?.code,
            hint: dbError?.hint
        })
        return null
    }

    console.log("Auth Check: User role is", profile.role)
    return profile.role
}

export const requireRole = async (allowedRoles: string[]) => {
    const role = await getUserRole()
    if (!role || !allowedRoles.includes(role)) {
        redirect('/login')
    }
    return role
}
