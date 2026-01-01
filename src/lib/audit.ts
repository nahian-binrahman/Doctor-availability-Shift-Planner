
import { createClient } from "./supabase/server"

export async function createAuditLog(action: string, entity_type: string, entity_id: string, details: any = {}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return

    await supabase.from('audit_logs').insert({
        admin_id: user.id,
        action,
        entity_type,
        entity_id,
        details
    })
}
