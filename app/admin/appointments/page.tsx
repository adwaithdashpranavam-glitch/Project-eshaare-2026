"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import {
    collection,
    getDocs,
    query,
    orderBy,
    doc,
    updateDoc,
} from "firebase/firestore";

type Appointment = {
    id: string;
    customerName: string;
    phone: string;
    visaType: string;
    date: string;
    time: string;
    status: string;
};

export default function AppointmentsAdminPage() {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAppointments = async () => {
            try {
                const q = query(
                    collection(db, "appointments"),
                    orderBy("createdAt", "desc")
                );

                const querySnapshot = await getDocs(q);

                const data: Appointment[] = [];
                querySnapshot.forEach((docItem) => {
                    const docData = docItem.data();
                    data.push({
                        id: docItem.id,
                        customerName: docData.customerName || "",
                        phone: docData.phone || "",
                        visaType: docData.visaType || "",
                        date: docData.date || "",
                        time: docData.time || "",
                        status: docData.status || "pending",
                    });
                });

                setAppointments(data);
            } catch (error) {
                console.log(error);
            } finally {
                setLoading(false);
            }
        };

        fetchAppointments();
    }, []);

    const updateStatus = async (id: string, status: string) => {
        try {
            const appointmentRef = doc(db, "appointments", id);
            await updateDoc(appointmentRef, { status });

            setAppointments((prev) =>
                prev.map((app) =>
                    app.id === id ? { ...app, status } : app
                )
            );
        } catch (error) {
            console.log(error);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "pending": return "bg-yellow-500/20 text-yellow-400";
            case "confirmed": return "bg-blue-500/20 text-blue-400";
            case "completed": return "bg-green-500/20 text-green-400";
            case "cancelled": return "bg-red-500/20 text-red-400";
            default: return "bg-gray-500/20 text-gray-400";
        }
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white">Appointments</h1>
                    <p className="mt-2 text-gray-400">Manage client consultation bookings</p>
                </div>
                <div className="rounded-xl bg-white/5 border border-white/10 px-6 py-4">
                    <p className="text-sm text-gray-400">Total Appointments</p>
                    <h2 className="mt-1 text-2xl font-bold text-white">{appointments.length}</h2>
                </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-white">
                        <thead className="border-b border-white/10 bg-black/40">
                            <tr>
                                <th className="px-6 py-4 font-semibold">Client Name</th>
                                <th className="px-6 py-4 font-semibold">Contact Info</th>
                                <th className="px-6 py-4 font-semibold">Visa/Service Type</th>
                                <th className="px-6 py-4 font-semibold">Date & Time</th>
                                <th className="px-6 py-4 font-semibold">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400">Loading Appointments...</td>
                                </tr>
                            ) : appointments.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400">No Appointments Found</td>
                                </tr>
                            ) : (
                                appointments.map((app) => (
                                    <tr key={app.id} className="transition hover:bg-white/5">
                                        <td className="px-6 py-4">
                                            <div className="font-medium">{app.customerName}</div>
                                            <div className="text-sm text-gray-500 mt-1">ID: {app.id.slice(0, 8)}</div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-300">{app.phone}</td>
                                        <td className="px-6 py-4">
                                            <span className="inline-block rounded-lg bg-white/10 px-3 py-1 text-sm">
                                                {app.visaType}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-gray-300">{app.date}</div>
                                            <div className="text-sm text-gray-500 mt-1">{app.time}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <select
                                                value={app.status}
                                                onChange={(e) => updateStatus(app.id, e.target.value)}
                                                className={`rounded-xl border-none outline-none px-3 py-1 text-sm font-medium ${getStatusColor(app.status)}`}
                                            >
                                                <option value="pending" className="bg-[#071120] text-white">Pending</option>
                                                <option value="confirmed" className="bg-[#071120] text-white">Confirmed</option>
                                                <option value="completed" className="bg-[#071120] text-white">Completed</option>
                                                <option value="cancelled" className="bg-[#071120] text-white">Cancelled</option>
                                            </select>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
