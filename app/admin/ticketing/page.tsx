"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, addDoc, doc, updateDoc, onSnapshot } from "firebase/firestore";
import { Plane, Plus, Search, HelpCircle, ShieldAlert, Check } from "lucide-react";

type TicketRecord = {
    id: string;
    pnr: string;
    passengerName: string;
    airline: string;
    routing: string;
    cabin: "Economy" | "Premium" | "Business" | "First";
    ticketStatus: "Issued" | "Reissued" | "Cancelled" | "Pending";
    cost: number;
    sellPrice: number;
    reissueNotes: string;
    createdAt: string;
};

export default function AdminTicketingPage() {
    const [tickets, setTickets] = useState<TicketRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        pnr: "",
        passengerName: "",
        airline: "",
        routing: "",
        cabin: "Economy" as TicketRecord["cabin"],
        ticketStatus: "Issued" as TicketRecord["ticketStatus"],
        cost: 0,
        sellPrice: 0,
        reissueNotes: "",
    });

    useEffect(() => {
        const q = query(collection(db, "tickets"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data: TicketRecord[] = [];
            snapshot.forEach((docSnap) => {
                const item = docSnap.data();
                data.push({
                    id: docSnap.id,
                    pnr: item.pnr || "N/A",
                    passengerName: item.passengerName || "",
                    airline: item.airline || "",
                    routing: item.routing || "",
                    cabin: item.cabin || "Economy",
                    ticketStatus: item.ticketStatus || "Issued",
                    cost: Number(item.cost) || 0,
                    sellPrice: Number(item.sellPrice) || 0,
                    reissueNotes: item.reissueNotes || "",
                    createdAt: item.createdAt || new Date().toISOString(),
                });
            });
            data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            setTickets(data);
            setLoading(false);
        }, (error) => {
            console.error("Error reading tickets:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleReissueRequest = async (id: string, actionType: "Reissued" | "Cancelled") => {
        const notes = prompt(`Enter ${actionType} details / refund calculations:`);
        if (notes === null) return;
        try {
            await updateDoc(doc(db, "tickets", id), {
                ticketStatus: actionType,
                reissueNotes: notes,
            });
            alert(`Ticket status updated to ${actionType}!`);
        } catch (err) {
            console.error("Error updating ticket:", err);
        }
    };

    const handleCreateTicket = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.pnr || !formData.passengerName || !formData.airline) {
            alert("PNR, Passenger Name, and Airline are required.");
            return;
        }

        try {
            await addDoc(collection(db, "tickets"), {
                ...formData,
                createdAt: new Date().toISOString(),
            });
            setShowModal(false);
            setFormData({
                pnr: "",
                passengerName: "",
                airline: "",
                routing: "",
                cabin: "Economy",
                ticketStatus: "Issued",
                cost: 0,
                sellPrice: 0,
                reissueNotes: "",
            });
            alert("Ticket issued record logged successfully!");
        } catch (err) {
            console.error("Error creating ticket:", err);
            alert("Failed to log ticket.");
        }
    };

    const filteredTickets = tickets.filter(t => {
        const matchesSearch =
            t.pnr.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.passengerName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === "All" || t.ticketStatus === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="space-y-8 font-sans">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                        <Plane className="text-[#e68932]" />
                        Flight Ticketing Ops
                    </h1>
                    <p className="mt-2 text-gray-400">Audit flight booking fares, track GDS PNR codes, and manage ticket cancellations or reissues.</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#e68932] px-6 py-3 font-semibold text-white hover:opacity-90 transition active:scale-95 text-sm"
                >
                    <Plus size={18} />
                    Issue Ticket
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white/5 p-4 rounded-3xl border border-white/10">
                <div className="relative w-full md:max-w-sm">
                    <Search className="absolute left-4 top-3 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search by passenger, GDS PNR code..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="h-11 w-full rounded-2xl border-none bg-white/5 pl-11 pr-4 text-sm text-white outline-none focus:bg-white/10 transition"
                    />
                </div>
                <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
                    {["All", "Issued", "Reissued", "Cancelled", "Pending"].map((status) => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`px-5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition flex-shrink-0 ${
                                statusFilter === status ? "bg-[#e68932] text-white" : "bg-white/5 text-gray-400 hover:text-white"
                            }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            {/* Grid Table */}
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-white">
                        <thead className="border-b border-white/10 bg-black/40 text-xs font-semibold uppercase tracking-wider text-gray-400">
                            <tr>
                                <th className="px-6 py-4">GDS PNR</th>
                                <th className="px-6 py-4">Passenger</th>
                                <th className="px-6 py-4">Airline / Route</th>
                                <th className="px-6 py-4">Cabin Class</th>
                                <th className="px-6 py-4 text-right">Fare Sell Price</th>
                                <th className="px-6 py-4">Reissue Notes</th>
                                <th className="px-6 py-4 text-center">Status</th>
                                <th className="px-6 py-4 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-sm">
                            {loading ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-12 text-center text-gray-400">Loading flight ticketing logs...</td>
                                </tr>
                            ) : filteredTickets.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-12 text-center text-gray-400">No ticket records registered.</td>
                                </tr>
                            ) : (
                                filteredTickets.map((t) => (
                                    <tr key={t.id} className="transition hover:bg-white/5">
                                        <td className="px-6 py-4 font-mono font-bold text-gray-200">
                                            {t.pnr}
                                        </td>
                                        <td className="px-6 py-4 font-semibold text-white">
                                            {t.passengerName}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-gray-300">{t.airline}</div>
                                            <div className="text-xs text-gray-500 mt-0.5">{t.routing || "DXB - LHR"}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-block rounded bg-white/15 px-2.5 py-1 text-xs font-semibold">
                                                {t.cabin}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right font-bold text-[#e68932]">
                                            AED {t.sellPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className="px-6 py-4 text-xs text-gray-400 max-w-xs truncate" title={t.reissueNotes}>
                                            {t.reissueNotes || "—"}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`inline-block text-[10px] px-2.5 py-1 font-bold uppercase tracking-wider rounded-full ${
                                                t.ticketStatus === "Issued"
                                                    ? "bg-green-500/20 text-green-400"
                                                    : t.ticketStatus === "Reissued"
                                                    ? "bg-blue-500/20 text-blue-400"
                                                    : t.ticketStatus === "Cancelled"
                                                    ? "bg-red-500/20 text-red-400"
                                                    : "bg-yellow-500/20 text-yellow-400"
                                            }`}>
                                                {t.ticketStatus}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {t.ticketStatus !== "Cancelled" && (
                                                <div className="flex gap-1.5 justify-center">
                                                    <button
                                                        onClick={() => handleReissueRequest(t.id, "Reissued")}
                                                        className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500 hover:text-white transition text-xs font-bold"
                                                    >
                                                        Reissue
                                                    </button>
                                                    <button
                                                        onClick={() => handleReissueRequest(t.id, "Cancelled")}
                                                        className="px-2 py-1 bg-red-500/20 text-red-400 rounded hover:bg-red-500 hover:text-white transition text-xs font-bold"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
                    <div className="bg-[#071120] text-white w-full max-w-lg rounded-3xl p-8 border border-white/10 shadow-2xl relative max-h-[90vh] overflow-y-auto">
                        <h2 className="text-2xl font-bold mb-6 text-[#e68932]">Record Flight Ticket</h2>

                        <form onSubmit={handleCreateTicket} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-gray-400 font-bold uppercase tracking-wider">PNR Code (Record Locator)</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="GDS reference ID"
                                        value={formData.pnr}
                                        onChange={(e) => setFormData({ ...formData, pnr: e.target.value })}
                                        className="mt-1 h-11 w-full rounded-xl border-none bg-white/5 px-4 text-sm text-white font-mono outline-none focus:bg-white/10"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-400 font-bold uppercase tracking-wider">Passenger Full Name</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Surname/Givenname"
                                        value={formData.passengerName}
                                        onChange={(e) => setFormData({ ...formData, passengerName: e.target.value })}
                                        className="mt-1 h-11 w-full rounded-xl border-none bg-white/5 px-4 text-sm text-white outline-none focus:bg-white/10"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-gray-400 font-bold uppercase tracking-wider">Airline Carrier</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Emirates Airlines"
                                        value={formData.airline}
                                        onChange={(e) => setFormData({ ...formData, airline: e.target.value })}
                                        className="mt-1 h-11 w-full rounded-xl border-none bg-white/5 px-4 text-sm text-white outline-none focus:bg-white/10"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-400 font-bold uppercase tracking-wider">Flight Routing</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. DXB - LHR - DXB"
                                        value={formData.routing}
                                        onChange={(e) => setFormData({ ...formData, routing: e.target.value })}
                                        className="mt-1 h-11 w-full rounded-xl border-none bg-white/5 px-4 text-sm text-white outline-none focus:bg-white/10"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-gray-400 font-bold uppercase tracking-wider">Cabin Class</label>
                                    <select
                                        value={formData.cabin}
                                        onChange={(e) => setFormData({ ...formData, cabin: e.target.value as any })}
                                        className="mt-1 h-11 w-full rounded-xl border-none bg-white/5 px-4 text-sm text-white outline-none focus:bg-white/10"
                                    >
                                        <option value="Economy" className="bg-[#071120]">Economy</option>
                                        <option value="Premium" className="bg-[#071120]">Premium Economy</option>
                                        <option value="Business" className="bg-[#071120]">Business</option>
                                        <option value="First" className="bg-[#071120]">First Class</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-400 font-bold uppercase tracking-wider">Booking Status</label>
                                    <select
                                        value={formData.ticketStatus}
                                        onChange={(e) => setFormData({ ...formData, ticketStatus: e.target.value as any })}
                                        className="mt-1 h-11 w-full rounded-xl border-none bg-white/5 px-4 text-sm text-white outline-none focus:bg-white/10"
                                    >
                                        <option value="Issued" className="bg-[#071120]">Issued</option>
                                        <option value="Pending" className="bg-[#071120]">Pending Confirmation</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-gray-400 font-bold uppercase tracking-wider">Cost Price (AED)</label>
                                    <input
                                        type="number"
                                        placeholder="0"
                                        value={formData.cost || ""}
                                        onChange={(e) => setFormData({ ...formData, cost: Number(e.target.value) })}
                                        className="mt-1 h-11 w-full rounded-xl border-none bg-white/5 px-4 text-sm text-white outline-none focus:bg-white/10"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-400 font-bold uppercase tracking-wider">Sell Price (AED)</label>
                                    <input
                                        type="number"
                                        placeholder="0"
                                        value={formData.sellPrice || ""}
                                        onChange={(e) => setFormData({ ...formData, sellPrice: Number(e.target.value) })}
                                        className="mt-1 h-11 w-full rounded-xl border-none bg-white/5 px-4 text-sm text-white outline-none focus:bg-white/10"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-white/10 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="rounded-xl bg-white/10 hover:bg-white/20 text-white px-5 py-2.5 font-semibold text-xs transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="rounded-xl bg-[#e68932] text-white hover:opacity-90 px-5 py-2.5 font-semibold transition text-xs"
                                >
                                    Record Ticket
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
