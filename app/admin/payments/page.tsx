"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, getDocs, doc, updateDoc, onSnapshot } from "firebase/firestore";
import { FileText, Download, CheckCircle, Clock, CreditCard, X, Printer } from "lucide-react";

type Invoice = {
    id: string;
    leadId: string;
    leadName: string;
    description: string;
    amount: number;
    vat: number;
    total: number;
    status: string;
    createdAt: string;
    paidAt?: string;
};

export default function AdminPaymentsPage() {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("All");
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

    useEffect(() => {
        const q = query(collection(db, "invoices"));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data: Invoice[] = [];
            snapshot.forEach((docSnap) => {
                const invData = docSnap.data();
                data.push({
                    id: docSnap.id,
                    leadId: invData.leadId || "",
                    leadName: invData.leadName || "Unknown Client",
                    description: invData.description || "",
                    amount: Number(invData.amount) || 0,
                    vat: Number(invData.vat) || 0,
                    total: Number(invData.total) || 0,
                    status: invData.status || "Pending",
                    createdAt: invData.createdAt || new Date().toISOString(),
                    paidAt: invData.paidAt || "",
                });
            });
            // Sort by createdAt descending
            data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            setInvoices(data);
            setLoading(false);
        }, (error) => {
            console.error("Error subscribing to invoices:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // Aggregated stats
    const stats = invoices.reduce(
        (acc, inv) => {
            acc.totalCount++;
            if (inv.status === "Paid") {
                acc.paidAmount += inv.total;
                acc.paidCount++;
            } else {
                acc.pendingAmount += inv.total;
                acc.pendingCount++;
            }
            return acc;
        },
        { paidAmount: 0, pendingAmount: 0, totalCount: 0, paidCount: 0, pendingCount: 0 }
    );

    const filteredInvoices = invoices.filter((inv) => {
        if (filter === "All") return true;
        return inv.status === filter;
    });

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-white">Payments & Billing</h1>
                <p className="mt-2 text-gray-400">View corporate billing history, verify transaction invoices, and trace client revenues.</p>
            </div>

            {/* Financial Summary Cards */}
            <div className="grid gap-6 md:grid-cols-3">
                <div className="rounded-3xl bg-white/5 border border-white/10 p-6 flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-400 font-semibold uppercase tracking-wider">Total Received</p>
                        <h2 className="mt-2 text-3xl font-bold text-green-400">AED {stats.paidAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h2>
                        <p className="mt-1 text-xs text-gray-500">{stats.paidCount} paid transactions</p>
                    </div>
                    <div className="h-12 w-12 bg-green-500/20 rounded-2xl flex items-center justify-center text-green-400">
                        <CheckCircle size={24} />
                    </div>
                </div>

                <div className="rounded-3xl bg-white/5 border border-white/10 p-6 flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-400 font-semibold uppercase tracking-wider">Pending Receivables</p>
                        <h2 className="mt-2 text-3xl font-bold text-yellow-500">AED {stats.pendingAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h2>
                        <p className="mt-1 text-xs text-gray-500">{stats.pendingCount} unpaid invoices</p>
                    </div>
                    <div className="h-12 w-12 bg-yellow-500/20 rounded-2xl flex items-center justify-center text-yellow-500">
                        <Clock size={24} />
                    </div>
                </div>

                <div className="rounded-3xl bg-white/5 border border-white/10 p-6 flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-400 font-semibold uppercase tracking-wider">Overall Billed</p>
                        <h2 className="mt-2 text-3xl font-bold text-white">AED {(stats.paidAmount + stats.pendingAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</h2>
                        <p className="mt-1 text-xs text-gray-500">{stats.totalCount} invoices total</p>
                    </div>
                    <div className="h-12 w-12 bg-white/10 rounded-2xl flex items-center justify-center text-white">
                        <CreditCard size={24} />
                    </div>
                </div>
            </div>

            {/* Filter controls */}
            <div className="flex gap-2 bg-white/5 p-1.5 rounded-2xl border border-white/10 w-fit">
                {["All", "Paid", "Pending"].map((status) => (
                    <button
                        key={status}
                        onClick={() => setFilter(status)}
                        className={`px-5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition ${
                            filter === status ? "bg-[#e68932] text-white" : "text-gray-400 hover:text-white"
                        }`}
                    >
                        {status} Invoices
                    </button>
                ))}
            </div>

            {/* Invoices List Table */}
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-white">
                        <thead className="border-b border-white/10 bg-black/40">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider">Invoice ID</th>
                                <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider">Client Name</th>
                                <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider">Description</th>
                                <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider">Date</th>
                                <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider text-right">Total</th>
                                <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider text-center">Status</th>
                                <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-sm">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-gray-400">Loading Invoices...</td>
                                </tr>
                            ) : filteredInvoices.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-gray-400">No Invoices Found</td>
                                </tr>
                            ) : (
                                filteredInvoices.map((inv) => (
                                    <tr key={inv.id} className="transition hover:bg-white/5">
                                        <td className="px-6 py-4 font-mono text-xs text-gray-400">
                                            #{inv.id.substring(0, 8)}...
                                        </td>
                                        <td className="px-6 py-4 font-medium text-white">
                                            {inv.leadName}
                                        </td>
                                        <td className="px-6 py-4 text-gray-300">
                                            {inv.description}
                                        </td>
                                        <td className="px-6 py-4 text-gray-400 text-xs">
                                            {new Date(inv.createdAt).toLocaleDateString(undefined, {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                            })}
                                        </td>
                                        <td className="px-6 py-4 font-bold text-right">
                                            AED {inv.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`inline-block text-[10px] px-2.5 py-1 font-bold uppercase tracking-wider rounded-full ${
                                                inv.status === "Paid" ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"
                                            }`}>
                                                {inv.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button
                                                onClick={() => setSelectedInvoice(inv)}
                                                className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-semibold text-[#00C2FF] hover:bg-white/20 transition active:scale-95"
                                            >
                                                <FileText size={12} />
                                                View Invoice
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Print Friendly Invoice Modal */}
            {selectedInvoice && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto print:p-0 print:bg-white print:relative print:z-0">
                    <div className="bg-white text-black w-full max-w-2xl rounded-3xl p-8 shadow-2xl flex flex-col gap-6 relative print:shadow-none print:p-0 print:rounded-none max-h-[90vh] overflow-y-auto">
                        
                        {/* Close button (Hidden on print) */}
                        <button
                            onClick={() => setSelectedInvoice(null)}
                            className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100 text-gray-500 transition print:hidden"
                        >
                            <X size={20} />
                        </button>

                        {/* Invoice printable content starts */}
                        <div id="printable-invoice" className="space-y-6">
                            {/* Invoice Header */}
                            <div className="flex justify-between items-start border-b pb-6">
                                <div>
                                    <h2 className="text-3xl font-extrabold tracking-tight text-[#e68932]">ESHAARE TOUR</h2>
                                    <p className="text-xs text-gray-500 mt-1 font-semibold uppercase tracking-wider">Tours & Events | Visa Services</p>
                                    <p className="text-xs text-gray-400 mt-0.5">Dubai, United Arab Emirates</p>
                                </div>
                                <div className="text-right">
                                    <h3 className="text-xl font-bold uppercase tracking-wider text-gray-800">INVOICE</h3>
                                    <p className="text-xs font-mono text-gray-500 mt-1">Invoice: #{selectedInvoice.id.substring(0, 8).toUpperCase()}</p>
                                    <p className="text-xs text-gray-500 mt-0.5">Date: {new Date(selectedInvoice.createdAt).toLocaleDateString()}</p>
                                </div>
                            </div>

                            {/* Client & Billing Info */}
                            <div className="grid grid-cols-2 gap-6 bg-gray-50 p-4 rounded-2xl">
                                <div>
                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">BILLED TO</p>
                                    <h4 className="font-bold text-gray-800 mt-1 text-sm">{selectedInvoice.leadName}</h4>
                                    <p className="text-xs text-gray-500 mt-0.5">Lead Reference: {selectedInvoice.leadId}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">PAYMENT STATUS</p>
                                    <span className={`inline-block mt-2 text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full ${
                                        selectedInvoice.status === "Paid" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                                    }`}>
                                        {selectedInvoice.status}
                                    </span>
                                    {selectedInvoice.paidAt && (
                                        <p className="text-[10px] text-gray-400 mt-1.5">Paid On: {new Date(selectedInvoice.paidAt).toLocaleDateString()}</p>
                                    )}
                                </div>
                            </div>

                            {/* Itemized list */}
                            <div>
                                <table className="w-full text-left text-sm">
                                    <thead>
                                        <tr className="border-b text-xs font-bold text-gray-400 uppercase tracking-wider">
                                            <th className="py-3">Description</th>
                                            <th className="py-3 text-right">Subtotal</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y text-gray-700">
                                        <tr>
                                            <td className="py-4">
                                                <div className="font-semibold text-gray-800">{selectedInvoice.description}</div>
                                            </td>
                                            <td className="py-4 text-right font-medium">
                                                AED {selectedInvoice.amount.toFixed(2)}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            {/* Totals section */}
                            <div className="border-t pt-4 flex flex-col items-end gap-2 text-sm">
                                <div className="flex justify-between w-64 text-gray-500">
                                    <span>Subtotal:</span>
                                    <span className="font-medium">AED {selectedInvoice.amount.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between w-64 text-gray-500">
                                    <span>VAT (5%):</span>
                                    <span className="font-medium">AED {selectedInvoice.vat.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between w-64 text-gray-800 font-extrabold text-lg border-t pt-2 mt-1">
                                    <span>Total Due:</span>
                                    <span className="text-[#e68932]">AED {selectedInvoice.total.toFixed(2)}</span>
                                </div>
                            </div>

                            {/* Terms */}
                            <div className="border-t pt-6 text-[10px] text-gray-400 text-center">
                                <p>Thank you for doing business with ESHAARE TOUR. This is a computer-generated billing copy and requires no physical signature.</p>
                            </div>
                        </div>
                        {/* Invoice printable content ends */}

                        {/* Modal Action Buttons */}
                        <div className="flex justify-end gap-3 mt-4 print:hidden border-t pt-6">
                            <button
                                onClick={handlePrint}
                                className="inline-flex items-center gap-1.5 rounded-xl border border-gray-300 bg-white px-5 py-2.5 font-semibold text-gray-700 hover:bg-gray-50 transition active:scale-95 text-xs"
                            >
                                <Printer size={14} />
                                Print Invoice
                            </button>
                            <button
                                onClick={() => setSelectedInvoice(null)}
                                className="rounded-xl bg-black text-white hover:bg-black/90 px-5 py-2.5 font-semibold transition active:scale-95 text-xs"
                            >
                                Close View
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
