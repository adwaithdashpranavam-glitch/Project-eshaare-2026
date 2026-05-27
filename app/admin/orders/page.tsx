"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, addDoc, onSnapshot } from "firebase/firestore";
import { ClipboardList, Plus, Search, Tag, AlertTriangle, ShieldCheck } from "lucide-react";

type OrderItem = {
    itemType: "Visa" | "Flight" | "Hotel" | "Transfer";
    description: string;
    supplierRef: string;
    passengerName: string;
    amount: number;
};

type Order = {
    id: string;
    orderNo: string;
    clientName: string;
    travelDate: string;
    grossAmount: number;
    balanceAmount: number;
    status: "Draft" | "Confirmed" | "Fulfilled" | "Cancelled";
    items: OrderItem[];
    createdAt: string;
};

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        clientName: "",
        travelDate: "",
        grossAmount: 0,
        balanceAmount: 0,
        status: "Draft" as Order["status"],
        itemType: "Visa" as OrderItem["itemType"],
        itemDesc: "",
        itemSupplierRef: "",
        itemPassenger: "",
    });

    useEffect(() => {
        const q = query(collection(db, "orders"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data: Order[] = [];
            snapshot.forEach((docSnap) => {
                const item = docSnap.data();
                data.push({
                    id: docSnap.id,
                    orderNo: item.orderNo || "N/A",
                    clientName: item.clientName || "Unknown",
                    travelDate: item.travelDate || "",
                    grossAmount: Number(item.grossAmount) || 0,
                    balanceAmount: Number(item.balanceAmount) || 0,
                    status: item.status || "Draft",
                    items: item.items || [],
                    createdAt: item.createdAt || new Date().toISOString(),
                });
            });
            // Sort by newest
            data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            setOrders(data);
            setLoading(false);
        }, (error) => {
            console.error("Error reading orders:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleCreateOrder = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.clientName || !formData.grossAmount) {
            alert("Client Name and Gross Amount are required.");
            return;
        }

        try {
            const orderNo = "ORD-" + Math.floor(100000 + Math.random() * 900000);
            const items: OrderItem[] = [
                {
                    itemType: formData.itemType,
                    description: formData.itemDesc || "General Booking Services",
                    supplierRef: formData.itemSupplierRef || "N/A",
                    passengerName: formData.itemPassenger || formData.clientName,
                    amount: formData.grossAmount,
                }
            ];

            await addDoc(collection(db, "orders"), {
                orderNo,
                clientName: formData.clientName,
                travelDate: formData.travelDate,
                grossAmount: Number(formData.grossAmount) || 0,
                balanceAmount: Number(formData.balanceAmount) || 0,
                status: formData.status,
                items,
                createdAt: new Date().toISOString(),
            });

            setShowModal(false);
            setFormData({
                clientName: "",
                travelDate: "",
                grossAmount: 0,
                balanceAmount: 0,
                status: "Draft",
                itemType: "Visa",
                itemDesc: "",
                itemSupplierRef: "",
                itemPassenger: "",
            });
            alert(`Order ${orderNo} created successfully!`);
        } catch (error) {
            console.error("Error creating order:", error);
            alert("Failed to create booking order.");
        }
    };

    const filteredOrders = orders.filter((ord) => {
        const matchesSearch =
            ord.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            ord.orderNo.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === "All" || ord.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="space-y-8 font-sans">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                        <ClipboardList className="text-[#e68932]" />
                        Orders & Bookings Manager
                    </h1>
                    <p className="mt-2 text-gray-400">Track confirmed travel sales, hotel vouchers, GDS flight ticket logs, and supplier codes.</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#e68932] px-6 py-3 font-semibold text-white hover:opacity-90 transition active:scale-95 text-sm"
                >
                    <Plus size={18} />
                    Create Order
                </button>
            </div>

            {/* Quick Balance Warning Banner */}
            {orders.some(o => o.balanceAmount > 0 && o.status === "Confirmed") && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-3xl p-5 flex items-center gap-4 text-sm font-medium">
                    <AlertTriangle className="text-red-400 flex-shrink-0" size={24} />
                    <div>
                        <p className="font-semibold text-white">Pending Order Balances Alert</p>
                        <p className="text-xs text-gray-400 mt-0.5">Several confirmed orders still have outstanding balances due. Check the payment history pages to settle accounts.</p>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white/5 p-4 rounded-3xl border border-white/10">
                <div className="relative w-full md:max-w-sm">
                    <Search className="absolute left-4 top-3 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search by client name, order number..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="h-11 w-full rounded-2xl border-none bg-white/5 pl-11 pr-4 text-sm text-white outline-none focus:bg-white/10 transition"
                    />
                </div>
                <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
                    {["All", "Draft", "Confirmed", "Fulfilled", "Cancelled"].map((status) => (
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

            {/* Orders list Table */}
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-white">
                        <thead className="border-b border-white/10 bg-black/40 text-xs font-semibold uppercase tracking-wider text-gray-400">
                            <tr>
                                <th className="px-6 py-4">Order Ref</th>
                                <th className="px-6 py-4">Client Name</th>
                                <th className="px-6 py-4">Travel Date</th>
                                <th className="px-6 py-4">Line Items Summary</th>
                                <th className="px-6 py-4 text-right">Gross Total (AED)</th>
                                <th className="px-6 py-4 text-right">Balance Due (AED)</th>
                                <th className="px-6 py-4 text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-sm">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-gray-400">Loading bookings registry...</td>
                                </tr>
                            ) : filteredOrders.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-gray-400">No confirmed booking orders found.</td>
                                </tr>
                            ) : (
                                filteredOrders.map((ord) => (
                                    <tr key={ord.id} className="transition hover:bg-white/5">
                                        <td className="px-6 py-4 font-mono font-bold text-gray-200">
                                            {ord.orderNo}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-white">{ord.clientName}</div>
                                            <div className="text-[10px] text-gray-500 mt-0.5">Created: {new Date(ord.createdAt).toLocaleDateString()}</div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-300">
                                            {ord.travelDate ? new Date(ord.travelDate).toLocaleDateString() : "N/A"}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-1.5">
                                                {ord.items.map((item, idx) => (
                                                    <div key={idx} className="flex flex-col gap-0.5 text-xs">
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="bg-white/10 px-2 py-0.5 rounded text-[10px] font-bold text-gray-300 uppercase">{item.itemType}</span>
                                                            <span className="text-gray-300 font-semibold">{item.passengerName}</span>
                                                        </div>
                                                        <div className="text-[10px] text-gray-500 pl-1 font-mono">Ref: {item.supplierRef || "N/A"}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right font-semibold text-white">
                                            {ord.grossAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className={`px-6 py-4 text-right font-bold ${ord.balanceAmount > 0 ? "text-red-400" : "text-green-400"}`}>
                                            {ord.balanceAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`inline-block text-[10px] px-2.5 py-1 font-bold uppercase tracking-wider rounded-full ${
                                                ord.status === "Fulfilled"
                                                    ? "bg-green-500/20 text-green-400"
                                                    : ord.status === "Confirmed"
                                                    ? "bg-blue-500/20 text-blue-400"
                                                    : ord.status === "Cancelled"
                                                    ? "bg-red-500/20 text-red-400"
                                                    : "bg-gray-500/20 text-gray-400"
                                            }`}>
                                                {ord.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create Order Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
                    <div className="bg-[#071120] text-white w-full max-w-lg rounded-3xl p-8 border border-white/10 shadow-2xl relative max-h-[90vh] overflow-y-auto">
                        <h2 className="text-2xl font-bold mb-6 text-[#e68932]">Record Booking Order</h2>

                        <form onSubmit={handleCreateOrder} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-gray-400 font-bold uppercase tracking-wider">Client Name</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Full name"
                                        value={formData.clientName}
                                        onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                                        className="mt-1 h-11 w-full rounded-xl border-none bg-white/5 px-4 text-sm text-white outline-none focus:bg-white/10"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-400 font-bold uppercase tracking-wider">Departure Date</label>
                                    <input
                                        type="date"
                                        value={formData.travelDate}
                                        onChange={(e) => setFormData({ ...formData, travelDate: e.target.value })}
                                        className="mt-1 h-11 w-full rounded-xl border-none bg-white/5 px-4 text-xs text-white outline-none focus:bg-white/10"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-gray-400 font-bold uppercase tracking-wider">Gross Total (AED)</label>
                                    <input
                                        type="number"
                                        required
                                        placeholder="AED amount"
                                        value={formData.grossAmount || ""}
                                        onChange={(e) => setFormData({ ...formData, grossAmount: Number(e.target.value) })}
                                        className="mt-1 h-11 w-full rounded-xl border-none bg-white/5 px-4 text-sm text-white outline-none focus:bg-white/10"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-400 font-bold uppercase tracking-wider">Outstanding Balance (AED)</label>
                                    <input
                                        type="number"
                                        placeholder="AED amount"
                                        value={formData.balanceAmount || ""}
                                        onChange={(e) => setFormData({ ...formData, balanceAmount: Number(e.target.value) })}
                                        className="mt-1 h-11 w-full rounded-xl border-none bg-white/5 px-4 text-sm text-white outline-none focus:bg-white/10"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-gray-400 font-bold uppercase tracking-wider">Order Status</label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                                        className="mt-1 h-11 w-full rounded-xl border-none bg-white/5 px-4 text-sm text-white outline-none focus:bg-white/10"
                                    >
                                        <option value="Draft" className="bg-[#071120]">Draft</option>
                                        <option value="Confirmed" className="bg-[#071120]">Confirmed</option>
                                        <option value="Fulfilled" className="bg-[#071120]">Fulfilled</option>
                                        <option value="Cancelled" className="bg-[#071120]">Cancelled</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-400 font-bold uppercase tracking-wider">Product Category</label>
                                    <select
                                        value={formData.itemType}
                                        onChange={(e) => setFormData({ ...formData, itemType: e.target.value as any })}
                                        className="mt-1 h-11 w-full rounded-xl border-none bg-white/5 px-4 text-sm text-white outline-none focus:bg-white/10"
                                    >
                                        <option value="Visa" className="bg-[#071120]">Visa Support</option>
                                        <option value="Flight" className="bg-[#071120]">Flight Booking</option>
                                        <option value="Hotel" className="bg-[#071120]">Hotel Voucher</option>
                                        <option value="Transfer" className="bg-[#071120]">Local Transfer</option>
                                    </select>
                                </div>
                            </div>

                            <div className="border-t border-white/5 pt-4 space-y-4">
                                <h4 className="text-xs font-bold uppercase text-gray-400 tracking-wider">Add Line Item Details</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2">
                                        <label className="text-[10px] text-gray-400 uppercase tracking-wider">Service Description</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. EK-203 DXB to LHR Ticket"
                                            value={formData.itemDesc}
                                            onChange={(e) => setFormData({ ...formData, itemDesc: e.target.value })}
                                            className="mt-1 h-10 w-full rounded-lg border-none bg-white/5 px-3 text-xs text-white outline-none focus:bg-white/10"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-gray-400 uppercase tracking-wider">Supplier Code / PNR Reference</label>
                                        <input
                                            type="text"
                                            placeholder="PNR reference ID"
                                            value={formData.itemSupplierRef}
                                            onChange={(e) => setFormData({ ...formData, itemSupplierRef: e.target.value })}
                                            className="mt-1 h-10 w-full rounded-lg border-none bg-white/5 px-3 text-xs text-white font-mono outline-none focus:bg-white/10"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-gray-400 uppercase tracking-wider">Passenger / Traveler</label>
                                        <input
                                            type="text"
                                            placeholder="Full Name"
                                            value={formData.itemPassenger}
                                            onChange={(e) => setFormData({ ...formData, itemPassenger: e.target.value })}
                                            className="mt-1 h-10 w-full rounded-lg border-none bg-white/5 px-3 text-xs text-white outline-none focus:bg-white/10"
                                        />
                                    </div>
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
                                    Create Order
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
