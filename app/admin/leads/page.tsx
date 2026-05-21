"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { db } from "@/lib/firebase";

import {
    collection,
    getDocs,
    query,
    orderBy,
    doc,
    updateDoc,
} from "firebase/firestore";

type Lead = {
    id: string;
    name: string;
    phone: string;
    whatsapp: string;
    email: string;
    nationality: string;
    currentCountry: string;
    passport: string;
    source: string;
    visaType: string;
    destination: string;
    travelDate: string;
    travelers: string;
    budget: string;
    travelHistory: string;
    rejectionHistory: string;
    message: string;
    status: string;
    assignedTo: string;
    revenue: number;
    createdAt?: any;
};

export default function LeadsPage() {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeads = async () => {
            try {
                const q = query(
                    collection(db, "leads"),
                    orderBy("createdAt", "desc")
                );

                const querySnapshot = await getDocs(q);

                const leadsData: Lead[] = [];

                querySnapshot.forEach((docItem) => {
                    const data = docItem.data();

                    leadsData.push({
                        id: docItem.id,
                        name: data.name || "",
                        phone: data.phone || "",
                        whatsapp: data.whatsapp || "",
                        email: data.email || "",
                        nationality: data.nationality || "",
                        currentCountry: data.currentCountry || "",
                        passport: data.passport || "",
                        source: data.source || "",
                        visaType: data.visaType || "",
                        destination: data.destination || "",
                        travelDate: data.travelDate || "",
                        travelers: data.travelers || "",
                        budget: data.budget || "",
                        travelHistory: data.travelHistory || "",
                        rejectionHistory: data.rejectionHistory || "",
                        message: data.message || "",
                        status: data.status || "New",
                        assignedTo: data.assignedTo || "",
                        revenue: Number(data.revenue) || 0,
                        createdAt: data.createdAt?.toDate() || new Date(),
                    });
                });

                setLeads(leadsData);

            } catch (error) {
                console.log(error);
            } finally {
                setLoading(false);
            }
        };

        fetchLeads();
    }, []);

    // UPDATE STATUS
    const updateLeadStatus = async (
        id: string,
        status: string
    ) => {
        try {
            const leadRef = doc(db, "leads", id);

            await updateDoc(leadRef, {
                status,
            });

            setLeads((prev) =>
                prev.map((lead) =>
                    lead.id === id
                        ? { ...lead, status }
                        : lead
                )
            );

        } catch (error) {
            console.log(error);
        }
    };

    // STATUS COLORS
    const getStatusStyles = (status: string) => {
        const s = status.toLowerCase();
        if (["new"].includes(s)) return "bg-blue-100 text-blue-700";
        if (["interested", "hot"].includes(s)) return "bg-pink-100 text-pink-700";
        if (["follow-up"].includes(s)) return "bg-yellow-100 text-yellow-700";
        if (["documents pending", "payment pending"].includes(s)) return "bg-orange-100 text-orange-700";
        if (["appointment scheduled", "submitted"].includes(s)) return "bg-purple-100 text-purple-700";
        if (["approved"].includes(s)) return "bg-green-100 text-green-700";
        if (["rejected", "closed"].includes(s)) return "bg-red-100 text-red-700";
        return "bg-gray-100 text-gray-700";
    };

    // DASHBOARD METRICS
    const totalLeads = leads.length;
    
    // Check if created today
    const today = new Date();
    const newLeadsToday = leads.filter(l => {
        const d = new Date(l.createdAt);
        return d.getDate() === today.getDate() &&
               d.getMonth() === today.getMonth() &&
               d.getFullYear() === today.getFullYear();
    }).length;

    const hotLeads = leads.filter(l => l.status.toLowerCase() === "interested").length;
    const pendingFollowUps = leads.filter(l => l.status.toLowerCase() === "follow-up").length;
    const visaCasesInProgress = leads.filter(l => 
        ["documents pending", "payment pending", "appointment scheduled", "submitted"].includes(l.status.toLowerCase())
    ).length;

    const approvedLeads = leads.filter(l => l.status.toLowerCase() === "approved").length;
    const conversionRate = totalLeads > 0 ? Math.round((approvedLeads / totalLeads) * 100) : 0;
    
    const revenue = leads.reduce((acc, lead) => acc + lead.revenue, 0);

    return (
        <div className="min-h-screen bg-[#f4f7fb] p-6 md:p-10">

            {/* HEADER */}
            <div className="mt-16 mb-10">
                <p className="text-sm uppercase tracking-[4px] text-[#00C2FF]">
                    ESHAARE CRM
                </p>
                <h1 className="mt-2 text-4xl font-bold text-black">
                    Leads Dashboard
                </h1>
            </div>

            {/* DASHBOARD STATS */}
            <div className="mb-10 grid grid-cols-2 gap-4 md:grid-cols-4 lg:gap-6">
                <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                    <p className="text-sm text-gray-500">Total Leads</p>
                    <h2 className="mt-2 text-3xl font-bold text-black">{totalLeads}</h2>
                </div>
                <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                    <p className="text-sm text-gray-500">New Leads Today</p>
                    <h2 className="mt-2 text-3xl font-bold text-[#00C2FF]">{newLeadsToday}</h2>
                </div>
                <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                    <p className="text-sm text-gray-500">Hot Leads</p>
                    <h2 className="mt-2 text-3xl font-bold text-pink-500">{hotLeads}</h2>
                </div>
                <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                    <p className="text-sm text-gray-500">Pending Follow-ups</p>
                    <h2 className="mt-2 text-3xl font-bold text-yellow-500">{pendingFollowUps}</h2>
                </div>
                <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                    <p className="text-sm text-gray-500">Cases in Progress</p>
                    <h2 className="mt-2 text-3xl font-bold text-purple-500">{visaCasesInProgress}</h2>
                </div>
                <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                    <p className="text-sm text-gray-500">Conversion Rate</p>
                    <h2 className="mt-2 text-3xl font-bold text-green-500">{conversionRate}%</h2>
                </div>
                <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                    <p className="text-sm text-gray-500">Total Revenue</p>
                    <h2 className="mt-2 text-3xl font-bold text-black">${revenue.toLocaleString()}</h2>
                </div>
            </div>

            {/* TABLE */}
            <div className="overflow-hidden border border-gray-200 bg-white shadow-[0_15px_40px_rgba(0,0,0,0.05)] rounded-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[1200px]">
                        <thead className="bg-[#071120] text-white">
                            <tr>
                                <th className="px-6 py-5 text-left text-sm font-semibold">Customer</th>
                                <th className="px-6 py-5 text-left text-sm font-semibold">Contact Info</th>
                                <th className="px-6 py-5 text-left text-sm font-semibold">Inquiry Details</th>
                                <th className="px-6 py-5 text-left text-sm font-semibold">Assigned To</th>
                                <th className="px-6 py-5 text-left text-sm font-semibold">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-16 text-center text-lg text-gray-500">Loading Leads...</td>
                                </tr>
                            ) : leads.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-16 text-center text-lg text-gray-500">No Leads Found</td>
                                </tr>
                            ) : (
                                leads.map((lead, index) => (
                                    <tr key={lead.id} className={`border-b border-gray-100 transition hover:bg-[#f9fbff] ${index % 2 === 0 ? "bg-white" : "bg-gray-50/40"}`}>
                                        <td className="px-6 py-6">
                                            <div>
                                                <Link href={`/admin/leads/${lead.id}`} className="font-semibold text-black hover:text-[#00C2FF]">
                                                    {lead.name}
                                                </Link>
                                                <p className="mt-1 text-xs text-gray-500">ID: {lead.id.slice(0, 8)}</p>
                                                <p className="mt-1 text-xs text-gray-500">Source: {lead.source || "Website"}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6">
                                            <p className="text-sm text-gray-700">{lead.phone}</p>
                                            <p className="text-sm text-gray-500">{lead.email}</p>
                                        </td>
                                        <td className="px-6 py-6">
                                            <div className="flex flex-col gap-1">
                                                <span className="inline-flex w-fit rounded-full bg-[#00C2FF]/10 px-3 py-1 text-xs font-semibold text-[#00C2FF]">
                                                    {lead.destination || "Not specified"}
                                                </span>
                                                <span className="text-xs text-gray-500">{lead.visaType || "General"}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6 text-sm text-gray-700">
                                            {lead.assignedTo || "Unassigned"}
                                        </td>
                                        <td className="px-6 py-6">
                                            <select
                                                value={lead.status}
                                                onChange={(e) => updateLeadStatus(lead.id, e.target.value)}
                                                className={`rounded-xl border-0 px-3 py-2 text-sm font-semibold outline-none ${getStatusStyles(lead.status)}`}
                                            >
                                                <option value="New">New</option>
                                                <option value="Interested">Interested</option>
                                                <option value="Follow-up">Follow-up</option>
                                                <option value="Documents Pending">Documents Pending</option>
                                                <option value="Payment Pending">Payment Pending</option>
                                                <option value="Appointment Scheduled">Appointment Scheduled</option>
                                                <option value="Submitted">Submitted</option>
                                                <option value="Approved">Approved</option>
                                                <option value="Rejected">Rejected</option>
                                                <option value="Closed">Closed</option>
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