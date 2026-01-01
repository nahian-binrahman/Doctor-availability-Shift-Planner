
import { createClient } from "@/lib/supabase/server"

export default async function DebugPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    let profile = null
    let error = null

    if (user) {
        const { data, error: dbError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()
        profile = data
        error = dbError
    }

    return (
        <div className="p-8 font-mono text-sm space-y-4">
            <h1 className="text-xl font-bold">Auth Debugger</h1>
            <div className="border p-4 rounded bg-muted/20">
                <p className="font-bold">User Status:</p>
                <pre>{JSON.stringify(user || 'No User Found', null, 2)}</pre>
            </div>
            <div className="border p-4 rounded bg-muted/20">
                <p className="font-bold">Profile Status:</p>
                <pre>{JSON.stringify(profile || 'No Profile Found', null, 2)}</pre>
            </div>
            {error && (
                <div className="border p-4 rounded bg-destructive/10 text-destructive">
                    <p className="font-bold">Database Error:</p>
                    <pre>{JSON.stringify(error, null, 2)}</pre>
                </div>
            )}
            <div className="flex gap-4">
                <a href="/login" className="text-blue-500 underline">Go to Login</a>
                <form action={async () => {
                    'use server'
                    const s = await createClient()
                    await s.auth.signOut()
                }}>
                    <button className="text-red-500 underline">Sign Out</button>
                </form>
            </div>
        </div>
    )
}
