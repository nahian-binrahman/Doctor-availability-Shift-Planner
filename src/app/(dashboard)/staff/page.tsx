
import { redirect } from "next/navigation"

export default function StaffPage() {
    redirect("/admin/appointments")
    // For this simple demo, Staff can use the same appointment management as Admin
    // but the RLS will handle the permissions. 
    // Since I put Staff and Admin in the same route groups for some things, 
    // I will just redirect them to the appointments list.
}
