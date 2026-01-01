
import { getDoctors, getAllProfiles, toggleDoctorStatus } from "./actions"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { DoctorForm } from "./DoctorForm"
import { UserPlus, UserCog, Power, PowerOff } from "lucide-react"

export default async function DoctorsPage() {
    const [doctors, allProfiles] = await Promise.all([
        getDoctors(),
        getAllProfiles()
    ])

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-primary">Doctors</h1>
                    <p className="text-muted-foreground">
                        Manage your clinic's doctors, schedules, and active status.
                    </p>
                </div>

                <Dialog>
                    <DialogTrigger asChild>
                        <Button>
                            <UserPlus className="mr-2 h-4 w-4" />
                            Add/Promote Doctor
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>Promote Staff to Doctor</DialogTitle>
                            <DialogDescription>
                                Select a registered user to assign them the doctor role.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4 max-h-[400px] overflow-auto">
                            {allProfiles.filter(p => p.role !== 'doctor').map(profile => (
                                <div key={profile.id} className="flex items-center justify-between p-2 border rounded-lg">
                                    <div>
                                        <p className="font-medium">{profile.full_name}</p>
                                        <p className="text-xs text-muted-foreground">{profile.email}</p>
                                    </div>
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button size="sm" variant="outline">Select</Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>Set Doctor Details for {profile.full_name}</DialogTitle>
                                            </DialogHeader>
                                            <DoctorForm userId={profile.id} />
                                        </DialogContent>
                                    </Dialog>
                                </div>
                            ))}
                            {allProfiles.filter(p => p.role !== 'doctor').length === 0 && (
                                <p className="text-center text-muted-foreground py-4">No other staff members found.</p>
                            )}
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="rounded-md border bg-card overflow-hidden">
                <Table>
                    <TableHeader className="bg-muted/50">
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Specialty</TableHead>
                            <TableHead>Slot (min)</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Color</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {doctors.map((doctor) => {
                            const docData = doctor.doctors?.[0]
                            const isActive = docData?.is_active ?? true

                            return (
                                <TableRow key={doctor.id} className={!isActive ? "opacity-60 bg-muted/20" : ""}>
                                    <TableCell className="font-medium">
                                        <div>
                                            {doctor.full_name}
                                            <div className="text-xs text-muted-foreground">{doctor.email}</div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="border-primary/30">
                                            {docData?.specialization || "N/A"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <span className="font-mono">{docData?.slot_duration || 30}</span>
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={isActive ? "default" : "destructive"}
                                            className={isActive ? "bg-green-600/10 text-green-500 border-green-600/20 hover:bg-green-600/20" : ""}
                                        >
                                            {isActive ? "Active" : "Inactive"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <div
                                                className="h-4 w-4 rounded-full border shadow-sm"
                                                style={{ backgroundColor: docData?.color_code || "#000" }}
                                            />
                                            <span className="text-xs font-mono text-muted-foreground">{docData?.color_code}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <form action={async () => {
                                                'use server'
                                                await toggleDoctorStatus(doctor.id, isActive)
                                            }}>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className={isActive ? "text-muted-foreground hover:text-destructive" : "text-green-500 hover:text-green-600"}
                                                    title={isActive ? "Deactivate" : "Activate"}
                                                >
                                                    {isActive ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
                                                </Button>
                                            </form>

                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="hover:text-primary">
                                                        <UserCog className="h-4 w-4" />
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent>
                                                    <DialogHeader>
                                                        <DialogTitle>Edit Doctor: {doctor.full_name}</DialogTitle>
                                                    </DialogHeader>
                                                    <DoctorForm
                                                        userId={doctor.id}
                                                        defaultValues={{
                                                            specialization: docData?.specialization || "",
                                                            phone: docData?.phone || "",
                                                            color_code: docData?.color_code || "#3b82f6",
                                                            slot_duration: docData?.slot_duration || 30,
                                                            is_active: isActive
                                                        }}
                                                    />
                                                </DialogContent>
                                            </Dialog>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                        {doctors.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    No doctors found. Promote staff members to doctors above.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
