"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, addDoc, onSnapshot } from "firebase/firestore";
import { Plus, Trash2, Save, Printer, FileText, RefreshCw } from "lucide-react";

type QuoteItem = {
    itemType: "Visa" | "Flight" | "Hotel" | "Transfer" | "Insurance" | "Other";
    description: string;
    supplier: string;
    qty: number;
    unitCost: number;
    markup: number;
    discount: number;
};

type Quote = {
    id: string;
    opportunityId: string;
    clientName: string;
    quoteNo: string;
    versionNo: number;
    validUntil: string;
    items: QuoteItem[];
    subtotal: number;
    taxAmount: number;
    totalAmount: number;
    approvalStatus: "Draft" | "Sent" | "Approved" | "Rejected";
    createdAt: string;
};

export default function AdminQuoteBuilderPage() {
    const [quotes, setQuotes] = useState<Quote[]>([]);
    const [loading, setLoading] = useState(true);

    // Form builder state
    const [opportunityId, setOpportunityId] = useState("");
    const [clientName, setClientName] = useState("");
    const [validUntil, setValidUntil] = useState("");
    const [approvalStatus, setApprovalStatus] = useState<Quote["approvalStatus"]>("Draft");

    const [items, setItems] = useState<QuoteItem[]>([
        { itemType: "Visa", description: "Dubai Tourist Visa processing", supplier: "Local Visa Ops", qty: 1, unitCost: 350, markup: 100, discount: 0 }
    ]);

    useEffect(() => {
        const q = query(collection(db, "quotes"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data: Quote[] = [];
            snapshot.forEach((docSnap) => {
                const item = docSnap.data();
                data.push({
                    id: docSnap.id,
                    opportunityId: item.opportunityId || "",
                    clientName: item.clientName || "",
                    quoteNo: item.quoteNo || "",
                    versionNo: Number(item.versionNo) || 1,
                    validUntil: item.validUntil || "",
                    items: item.items || [],
                    subtotal: Number(item.subtotal) || 0,
                    taxAmount: Number(item.taxAmount) || 0,
                    totalAmount: Number(item.totalAmount) || 0,
                    approvalStatus: item.approvalStatus || "Draft",
                    createdAt: item.createdAt || new Date().toISOString(),
                });
            });
            // Sort by newest
            data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            setQuotes(data);
            setLoading(false);
        }, (error) => {
            console.error("Error reading quotes:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleAddItem = () => {
        setItems([
            ...items,
            { itemType: "Flight", description: "", supplier: "", qty: 1, unitCost: 0, markup: 0, discount: 0 }
        ]);
    };

    const handleRemoveItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const handleItemChange = (index: number, field: keyof QuoteItem, value: any) => {
        setItems(
            items.map((item, i) => {
                if (i === index) {
                    return { ...item, [field]: value };
                }
                return item;
            })
        );
    };

    // Calculate totals
    const calculateTotals = () => {
        let subtotal = 0;
        items.forEach((item) => {
            const itemTotal = (item.qty * item.unitCost) + item.markup - item.discount;
            subtotal += itemTotal > 0 ? itemTotal : 0;
        });
        const taxAmount = subtotal * 0.05; // 5% VAT
        const totalAmount = subtotal + taxAmount;
        return {
            subtotal: parseFloat(subtotal.toFixed(2)),
            taxAmount: parseFloat(taxAmount.toFixed(2)),
            totalAmount: parseFloat(totalAmount.toFixed(2)),
        };
    };

    const totals = calculateTotals();

    const handleSaveQuote = async () => {
        if (!clientName || !validUntil) {
            alert("Client Name and Validity Date are required.");
            return;
        }

        try {
            const { subtotal, taxAmount, totalAmount } = totals;
            const quoteNo = "QT-" + Math.floor(100000 + Math.random() * 900000);

            await addDoc(collection(db, "quotes"), {
                opportunityId,
                clientName,
                quoteNo,
                versionNo: 1,
                validUntil,
                items,
                subtotal,
                taxAmount,
                totalAmount,
                approvalStatus,
                createdAt: new Date().toISOString(),
            });

            alert(`Quote ${quoteNo} successfully saved!`);
            // Reset builder
            setOpportunityId("");
            setClientName("");
            setValidUntil("");
            setApprovalStatus("Draft");
            setItems([{ itemType: "Visa", description: "Dubai Tourist Visa processing", supplier: "Local Visa Ops", qty: 1, unitCost: 350, markup: 100, discount: 0 }]);
        } catch (error) {
            console.error("Error saving quote:", error);
            alert("Failed to save quote.");
        }
    };

    const handleLoadPreset = (q: Quote) => {
        setOpportunityId(q.opportunityId);
        setClientName(q.clientName);
        setValidUntil(q.validUntil);
        setApprovalStatus(q.approvalStatus);
        setItems(q.items);
    };

    return (
        <div className="space-y-8 font-sans">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-white">Versioned Quote Builder</h1>
                <p className="mt-2 text-gray-400">Generate pricing estimates with item markups, discount settings, and local 5% VAT logs.</p>
            </div>

            {/* Layout Grid */}
            <div className="grid gap-8 lg:grid-cols-3">
                {/* Left Side: Builder Form */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="rounded-3xl bg-white/5 border border-white/10 p-6 space-y-6">
                        <h2 className="text-xl font-bold text-white">Assemble Quote</h2>

                        {/* Top Details */}
                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <label className="text-xs text-gray-400 font-bold uppercase tracking-wider">Client Name</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Enter client display name"
                                    value={clientName}
                                    onChange={(e) => setClientName(e.target.value)}
                                    className="mt-1 h-11 w-full rounded-xl border-none bg-white/5 px-4 text-sm text-white outline-none focus:bg-white/10"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-gray-400 font-bold uppercase tracking-wider">Opportunity / Lead ID</label>
                                <input
                                    type="text"
                                    placeholder="e.g. OPP-00149 (Optional)"
                                    value={opportunityId}
                                    onChange={(e) => setOpportunityId(e.target.value)}
                                    className="mt-1 h-11 w-full rounded-xl border-none bg-white/5 px-4 text-sm text-white outline-none focus:bg-white/10"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-gray-400 font-bold uppercase tracking-wider">Valid Until</label>
                                <input
                                    type="date"
                                    required
                                    value={validUntil}
                                    onChange={(e) => setValidUntil(e.target.value)}
                                    className="mt-1 h-11 w-full rounded-xl border-none bg-white/5 px-4 text-xs text-white outline-none focus:bg-white/10"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-gray-400 font-bold uppercase tracking-wider">Approval Status</label>
                                <select
                                    value={approvalStatus}
                                    onChange={(e) => setApprovalStatus(e.target.value as any)}
                                    className="mt-1 h-11 w-full rounded-xl border-none bg-white/5 px-4 text-sm text-white outline-none focus:bg-white/10"
                                >
                                    <option value="Draft" className="bg-[#071120]">Draft</option>
                                    <option value="Sent" className="bg-[#071120]">Sent</option>
                                    <option value="Approved" className="bg-[#071120]">Approved</option>
                                    <option value="Rejected" className="bg-[#071120]">Rejected</option>
                                </select>
                            </div>
                        </div>

                        {/* Items Grid */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between border-b border-white/5 pb-2">
                                <h3 className="text-sm font-semibold uppercase text-gray-400 tracking-wider">Line Items</h3>
                                <button
                                    onClick={handleAddItem}
                                    className="inline-flex items-center gap-1 text-xs text-[#e68932] font-semibold hover:underline"
                                >
                                    <Plus size={14} /> Add Line
                                </button>
                            </div>

                            <div className="space-y-4">
                                {items.map((item, idx) => (
                                    <div key={idx} className="bg-white/5 border border-white/5 rounded-2xl p-4 space-y-4 relative">
                                        <button
                                            onClick={() => handleRemoveItem(idx)}
                                            className="absolute top-4 right-4 text-red-400 hover:text-red-300"
                                        >
                                            <Trash2 size={16} />
                                        </button>

                                        <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
                                            <div>
                                                <label className="text-[10px] text-gray-400 uppercase tracking-wider">Item Type</label>
                                                <select
                                                    value={item.itemType}
                                                    onChange={(e) => handleItemChange(idx, "itemType", e.target.value)}
                                                    className="mt-1 h-9 w-full rounded-lg border-none bg-white/5 px-2 text-xs text-white outline-none"
                                                >
                                                    <option value="Visa" className="bg-[#071120]">Visa</option>
                                                    <option value="Flight" className="bg-[#071120]">Flight</option>
                                                    <option value="Hotel" className="bg-[#071120]">Hotel</option>
                                                    <option value="Transfer" className="bg-[#071120]">Transfer</option>
                                                    <option value="Insurance" className="bg-[#071120]">Insurance</option>
                                                    <option value="Other" className="bg-[#071120]">Other</option>
                                                </select>
                                            </div>
                                            <div className="col-span-2 md:col-span-2">
                                                <label className="text-[10px] text-gray-400 uppercase tracking-wider">Description</label>
                                                <input
                                                    type="text"
                                                    placeholder="Description details"
                                                    value={item.description}
                                                    onChange={(e) => handleItemChange(idx, "description", e.target.value)}
                                                    className="mt-1 h-9 w-full rounded-lg border-none bg-white/5 px-3 text-xs text-white outline-none"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] text-gray-400 uppercase tracking-wider">Supplier</label>
                                                <input
                                                    type="text"
                                                    placeholder="Supplier ID"
                                                    value={item.supplier}
                                                    onChange={(e) => handleItemChange(idx, "supplier", e.target.value)}
                                                    className="mt-1 h-9 w-full rounded-lg border-none bg-white/5 px-3 text-xs text-white outline-none"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
                                            <div>
                                                <label className="text-[10px] text-gray-400 uppercase tracking-wider">Qty</label>
                                                <input
                                                    type="number"
                                                    value={item.qty}
                                                    min="1"
                                                    onChange={(e) => handleItemChange(idx, "qty", Number(e.target.value))}
                                                    className="mt-1 h-9 w-full rounded-lg border-none bg-white/5 px-3 text-xs text-white outline-none"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] text-gray-400 uppercase tracking-wider">Unit Cost (AED)</label>
                                                <input
                                                    type="number"
                                                    value={item.unitCost || ""}
                                                    onChange={(e) => handleItemChange(idx, "unitCost", Number(e.target.value))}
                                                    className="mt-1 h-9 w-full rounded-lg border-none bg-white/5 px-3 text-xs text-white outline-none"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] text-gray-400 uppercase tracking-wider">Markup (AED)</label>
                                                <input
                                                    type="number"
                                                    value={item.markup || ""}
                                                    onChange={(e) => handleItemChange(idx, "markup", Number(e.target.value))}
                                                    className="mt-1 h-9 w-full rounded-lg border-none bg-white/5 px-3 text-xs text-white outline-none"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] text-gray-400 uppercase tracking-wider">Discount (AED)</label>
                                                <input
                                                    type="number"
                                                    value={item.discount || ""}
                                                    onChange={(e) => handleItemChange(idx, "discount", Number(e.target.value))}
                                                    className="mt-1 h-9 w-full rounded-lg border-none bg-white/5 px-3 text-xs text-white outline-none"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side: Totals Summary & Controls */}
                <div className="space-y-6">
                    <div className="rounded-3xl bg-white/5 border border-white/10 p-6 space-y-6">
                        <h3 className="text-lg font-bold text-white">Pricing Summary</h3>

                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between text-gray-400">
                                <span>Subtotal:</span>
                                <span className="font-medium text-white">AED {totals.subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-gray-400">
                                <span>VAT (5%):</span>
                                <span className="font-medium text-white">AED {totals.taxAmount.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between border-t border-white/5 pt-3 text-base font-extrabold text-white">
                                <span>Total Amount:</span>
                                <span className="text-[#e68932]">AED {totals.totalAmount.toFixed(2)}</span>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 pt-3">
                            <button
                                onClick={handleSaveQuote}
                                className="w-full h-12 rounded-xl bg-[#e68932] text-white hover:opacity-90 font-semibold text-sm transition flex items-center justify-center gap-2"
                            >
                                <Save size={16} /> Save Quote
                            </button>
                            <button
                                onClick={() => window.print()}
                                className="w-full h-12 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm transition flex items-center justify-center gap-2"
                            >
                                <Printer size={16} /> Print Quote Preview
                            </button>
                        </div>
                    </div>

                    {/* Quick Quote History */}
                    <div className="rounded-3xl bg-white/5 border border-white/10 p-6 space-y-4 max-h-[300px] overflow-y-auto pr-1">
                        <h3 className="text-sm font-semibold uppercase text-gray-400 tracking-wider">Saved Estimates</h3>
                        {loading ? (
                            <p className="text-xs text-gray-500">Loading estimates history...</p>
                        ) : quotes.length === 0 ? (
                            <p className="text-xs text-gray-500">No quotes saved yet.</p>
                        ) : (
                            quotes.map((q) => (
                                <div
                                    key={q.id}
                                    onClick={() => handleLoadPreset(q)}
                                    className="p-3 bg-white/5 border border-white/5 rounded-xl text-xs space-y-2 hover:border-white/15 cursor-pointer transition"
                                >
                                    <div className="flex items-center justify-between font-bold text-white">
                                        <span>{q.quoteNo} (v{q.versionNo})</span>
                                        <span className="text-[#e68932]">AED {q.totalAmount.toLocaleString()}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-[10px] text-gray-500">
                                        <span>Client: {q.clientName}</span>
                                        <span className="bg-white/10 px-1.5 py-0.5 rounded text-gray-300 font-bold uppercase">{q.approvalStatus}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
