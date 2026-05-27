"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { db } from "@/lib/firebase";
import { PlusCircle, Search, Filter, ShieldCheck, Mail, PhoneCall } from "lucide-react";

import {
    collection,
    getDocs,
    query,
    updateDoc,
    doc,
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
    supplier?: string;
    createdAt?: any;
    priority?: string;
};

export default function LeadsPage() {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");

    useEffect(() => {
        const fetchLeads = async () => {
            try {
                const q = query(collection(db, "leads"));
                const querySnapshot = await getDocs(q);

                const leadsData: Lead[] = [];

                querySnapshot.forEach((docItem) => {
                    const data = docItem.data();

                    // Parse createdAt safely
                    let createdAtDate = new Date();
                    if (data.createdAt) {
                        try {
                            if (typeof data.createdAt.toDate === "function") {
                                createdAtDate = data.createdAt.toDate();
                            } else if (data.createdAt.seconds) {
                                createdAtDate = new Date(data.createdAt.seconds * 1000);
                            } else {
                                createdAtDate = new Date(data.createdAt);
                            }
                        } catch (e) {
                            console.error("Error parsing lead createdAt:", e);
                        }
                    }

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
                        visaType: data.visaType || data.serviceType || "",
                        destination: data.destination || "",
                        travelDate: data.travelDate || data.appointmentDate || "",
                        travelers: data.travelers || "",
                        budget: data.budget || "",
                        travelHistory: data.travelHistory || "",
                        rejectionHistory: data.rejectionHistory || "",
                        message: data.message || "",
                        status: data.status || "New",
                        assignedTo: data.assignedTo || "",
                        revenue: Number(data.revenue) || 0,
                        supplier: data.supplier || "",
                        createdAt: createdAtDate,
                        priority: data.priority || "Medium",
                    });
                });

                // Client-side sorting (newest first)
                leadsData.sort((a, b) => {
                    const timeA = a.createdAt instanceof Date && !isNaN(a.createdAt.getTime()) ? a.createdAt.getTime() : 0;
                    const timeB = b.createdAt instanceof Date && !isNaN(b.createdAt.getTime()) ? b.createdAt.getTime() : 0;
                    return timeB - timeA;
                });

                setLeads(leadsData);

            } catch (error) {
                console.error("Error fetching leads:", error);
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
            console.error("Error updating lead status:", error);
        }
    };

    // STATUS COLORS (Tailored for dark theme)
    const getStatusStyles = (status: string) => {
        const s = status.toLowerCase();
        if (["new"].includes(s)) return "bg-blue-500/20 text-blue-400 border border-blue-500/30";
        if (["interested", "hot"].includes(s)) return "bg-pink-500/20 text-pink-400 border border-pink-500/30";
        if (["follow-up"].includes(s)) return "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30";
        if (["documents pending", "payment pending"].includes(s)) return "bg-orange-500/20 text-orange-400 border border-orange-500/30";
        if (["appointment scheduled", "submitted"].includes(s)) return "bg-purple-500/20 text-purple-400 border border-purple-500/30";
        if (["approved"].includes(s)) return "bg-green-500/20 text-green-400 border border-green-500/30";
        if (["rejected", "closed"].includes(s)) return "bg-red-500/20 text-red-400 border border-red-500/30";
        return "bg-gray-500/20 text-gray-400 border border-gray-500/30";
    };

    const getPriorityStyles = (priority?: string) => {
        const p = priority?.toLowerCase();
        if (p === "high") return "text-red-400 bg-red-500/10 border border-red-500/20";
        if (p === "low") return "text-gray-400 bg-gray-500/10 border border-gray-500/20";
        return "text-yellow-400 bg-yellow-500/10 border border-yellow-500/20";
    };

    // FILTERED LEADS
    const filteredLeads = leads.filter(l => {
        const matchesSearch = l.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              l.phone.includes(searchTerm) || 
                              l.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === "All" || l.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    // DASHBOARD METRICS
    const totalLeads = leads.length;
    const today = new Date();
    const newLeadsToday = leads.filter(l => {
        const d = new Date(l.createdAt);
        return d.getDate() === today.getDate() &&
               d.getMonth() === today.getMonth() &&
               d.getFullYear() === today.getFullYear();
    }).length;

    const hotLeads = leads.filter(l => l.status.toLowerCase() === "interested").length;
    const pendingFollowUps = leads.filter(l => l.status.toLowerCase() === "follow-up").length;
    const approvedLeads = leads.filter(l => l.status.toLowerCase() === "approved").length;
    const conversionRate = totalLeads > 0 ? Math.round((approvedLeads / totalLeads) * 100) : 0;
    const revenue = leads.reduce((acc, lead) => acc + lead.revenue, 0);

    return (
        <div className="space-y-8 font-sans">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                        Leads Inbox
                    </h1>
                    <p className="mt-2 text-gray-400">
                        Qualify, assign, and track client visa inquiries and holiday tour leads.
                    </p>
                </div>
            </div>

            {/* STATS MATRIX */}
            <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
                <div className="rounded-3xl bg-white/5 p-5 border border-white/10">
                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Total Leads</p>
                    <h2 className="mt-3 text-3xl font-bold text-white">{totalLeads}</h2>
                </div>
                <div className="rounded-3xl bg-white/5 p-5 border border-white/10">
                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">New Today</p>
                    <h2 className="mt-3 text-3xl font-bold text-[#00C2FF]">{newLeadsToday}</h2>
                </div>
                <div className="rounded-3xl bg-white/5 p-5 border border-white/10">
                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Hot Leads</p>
                    <h2 className="mt-3 text-3xl font-bold text-pink-400">{hotLeads}</h2>
                </div>
                <div className="rounded-3xl bg-white/5 p-5 border border-white/10">
                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Conversion</p>
                    <h2 className="mt-3 text-3xl font-bold text-green-400">{conversionRate}%</h2>
                </div>
                <div className="rounded-3xl bg-white/5 p-5 border border-white/10 col-span-2 md:col-span-1">
                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Total Billed</p>
                    <h2 className="mt-3 text-3xl font-bold text-[#e68932]">AED {revenue.toLocaleString()}</h2>
                </div>
            </div>

            {/* TOOLBAR CONTROLS */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white/5 border border-white/10 p-5 rounded-3xl">
                {/* Search field */}
                <div className="relative w-full md:max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search lead name, phone, or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="h-11 w-full rounded-xl border-none bg-white/5 pl-11 pr-4 text-sm text-white outline-none focus:bg-white/10"
                    />
                </div>

                {/* Filter buttons */}
                <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
                    {["All", "New", "Interested", "Follow-up", "Documents Pending", "Payment Pending", "Approved"].map((filter) => (
                        <button
                            key={filter}
                            onClick={() => setStatusFilter(filter)}
                            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                                statusFilter === filter ? "bg-[#e68932] text-white" : "bg-white/5 text-gray-400 hover:text-white"
                            }`}
                        >
                            {filter}
                        </button>
                    ))}
                </div>
            </div>

            {/* DENSE TABLE */}
            <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-white">
                        <thead className="border-b border-white/10 bg-black/40 text-xs font-semibold uppercase tracking-wider text-gray-400">
                            <tr>
                                <th className="px-6 py-4">Lead No / Name</th>
                                <th className="px-6 py-4">Contact Info</th>
                                <th className="px-6 py-4">Inquiry Details</th>
                                <th className="px-6 py-4">Priority</th>
                                <th className="px-6 py-4">Assigned To</th>
                                <th className="px-6 py-4">Status Stage</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-sm">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-400">Loading Leads...</td>
                                </tr>
                            ) : filteredLeads.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-400">No matching leads found.</td>
                                </tr>
                            ) : (
                                filteredLeads.map((lead) => (
                                    <tr key={lead.id} className="transition hover:bg-white/5">
                                        <td className="px-6 py-4">
                                            <div>
                                                <Link href={`/admin/leads/${lead.id}`} className="font-semibold text-white hover:text-[#00C2FF] flex items-center gap-1.5">
                                                    {lead.name}
                                                </Link>
                                                <p className="mt-1 text-xs text-gray-500 font-mono">LD-{lead.id.slice(0, 8).toUpperCase()}</p>
                                                <p className="mt-0.5 text-xs text-gray-500">Source: {lead.source || "Website"}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-xs font-medium space-y-1">
                                            <div className="flex items-center gap-1 text-gray-300">
                                                <PhoneCall size={12} className="text-gray-500" />
                                                {lead.phone}
                                            </div>
                                            <div className="flex items-center gap-1 text-gray-400">
                                                <Mail size={12} className="text-gray-500" />
                                                {lead.email || "No Email"}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs bg-[#00C2FF]/10 text-[#00C2FF] px-2 py-0.5 rounded font-semibold border border-[#00C2FF]/15">
                                                    {lead.destination || "Dubai"}
                                                </span>
                                                <span className="text-xs text-gray-400">{lead.visaType || "Visa Consultation"}</span>
                                            </div>
                                            {lead.budget && (
                                                <p className="text-xs text-gray-500">Budget: AED {lead.budget}</p>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${getPriorityStyles(lead.priority)}`}>
                                                {lead.priority || "Medium"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-xs text-gray-300">
                                            {lead.assignedTo || "Unassigned"}
                                        </td>
                                        <td className="px-6 py-4">
                                            <select
                                                value={lead.status}
                                                onChange={(e) => updateLeadStatus(lead.id, e.target.value)}
                                                className={`rounded-xl border-none outline-none px-3 py-1.5 text-xs font-semibold ${getStatusStyles(lead.status)}`}
                                            >
                                                <option value="New" className="bg-[#071120] text-white">New</option>
                                                <option value="Interested" className="bg-[#071120] text-white">Interested</option>
                                                <option value="Follow-up" className="bg-[#071120] text-white">Follow-up</option>
                                                <option value="Documents Pending" className="bg-[#071120] text-white">Documents Pending</option>
                                                <option value="Payment Pending" className="bg-[#071120] text-white">Payment Pending</option>
                                                <option value="Appointment Scheduled" className="bg-[#071120] text-white">Appointment Scheduled</option>
                                                <option value="Submitted" className="bg-[#071120] text-white">Submitted</option>
                                                <option value="Approved" className="bg-[#071120] text-white">Approved</option>
                                                <option value="Rejected" className="bg-[#071120] text-white">Rejected</option>
                                                <option value="Closed" className="bg-[#071120] text-white">Closed</option>
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