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
    limit,
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
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        const fetchAppointments = async () => {
            try {
                // Limit query to 100 documents to avoid loading too much data
                const q = query(collection(db, "appointments"), limit(100));
                const querySnapshot = await getDocs(q);

                const data: (Appointment & { createdAtDate?: Date })[] = [];
                querySnapshot.forEach((docItem) => {
                    const docData = docItem.data();
                    
                    // Parse createdAt to a Date object safely
                    let createdAtDate: Date | undefined = undefined;
                    if (docData.createdAt) {
                        try {
                            if (typeof docData.createdAt.toDate === "function") {
                                createdAtDate = docData.createdAt.toDate();
                            } else if (docData.createdAt.seconds) {
                                createdAtDate = new Date(docData.createdAt.seconds * 1000);
                            } else {
                                createdAtDate = new Date(docData.createdAt);
                            }
                        } catch (e) {
                            console.error("Error parsing createdAt:", e);
                        }
                    }

                    // Schema Fallbacks
                    const customerName = docData.customerName || docData.name || "Anonymous Client";
                    const visaType = docData.visaType || docData.serviceType || "General Consultation";
                    
                    // Format Date fallback from createdAt if not explicitly set
                    let date = docData.date || "";
                    if (!date && createdAtDate) {
                        date = createdAtDate.toLocaleDateString();
                    }

                    // Time fallback
                    let time = docData.time || docData.preferredTime || "";
                    if (!time && docData.details) {
                        const match = docData.details.match(/Preferred time:\s*(.*)$/i);
                        if (match) {
                            time = match[1];
                        }
                    }
                    if (!time) {
                        time = "Anytime";
                    }

                    data.push({
                        id: docItem.id,
                        customerName,
                        phone: docData.phone || "",
                        visaType,
                        date,
                        time,
                        status: docData.status || "pending",
                        createdAtDate
                    });
                });

                // Client-side sorting (newest first)
                data.sort((a, b) => {
                    const timeA = a.createdAtDate?.getTime() || 0;
                    const timeB = b.createdAtDate?.getTime() || 0;
                    return timeB - timeA;
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

    // Pagination calculations
    const itemsPerPage = 10;
    const totalPages = Math.ceil(appointments.length / itemsPerPage) || 1;
    const paginatedAppts = appointments.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

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
                                paginatedAppts.map((app) => (
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

                {/* PAGINATION FOOTER CONTROLS */}
                {appointments.length > 0 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/10 bg-black/25 px-6 py-4 text-xs text-white">
                        <span className="text-gray-400">
                            Showing <span className="font-semibold text-white">{Math.min((currentPage - 1) * itemsPerPage + 1, appointments.length)}</span> to <span className="font-semibold text-white">{Math.min(currentPage * itemsPerPage, appointments.length)}</span> of <span className="font-semibold text-white">{appointments.length}</span> appointments
                        </span>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="rounded-lg bg-white/5 border border-white/10 px-3.5 py-2 hover:bg-white/10 text-white disabled:opacity-40 transition font-semibold"
                            >
                                Previous
                            </button>
                            <span className="flex items-center px-2 text-gray-300">
                                Page {currentPage} of {totalPages}
                            </span>
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="rounded-lg bg-white/5 border border-white/10 px-3.5 py-2 hover:bg-white/10 text-white disabled:opacity-40 transition font-semibold"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
