"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, addDoc, doc, updateDoc, onSnapshot } from "firebase/firestore";
import { DollarSign, Plus, ArrowRight, Kanban, CheckCircle, XCircle } from "lucide-react";

type Opportunity = {
    id: string;
    leadNo: string;
    clientName: string;
    stage: "Consultation" | "Quote Sent" | "Payment Pending" | "Closed Won" | "Closed Lost";
    probability: number; // 0 to 100
    expectedValue: number; // AED value
    ownerName: string;
    closeDate: string;
    serviceMix: string;
};

const STAGES: Opportunity["stage"][] = [
    "Consultation",
    "Quote Sent",
    "Payment Pending",
    "Closed Won",
    "Closed Lost"
];

const STAGE_PROBABILITIES: Record<Opportunity["stage"], number> = {
    "Consultation": 40,
    "Quote Sent": 60,
    "Payment Pending": 90,
    "Closed Won": 100,
    "Closed Lost": 0
};

export default function AdminOpportunitiesPage() {
    const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        leadNo: "",
        clientName: "",
        stage: "Consultation" as Opportunity["stage"],
        expectedValue: 0,
        ownerName: "",
        closeDate: "",
        serviceMix: "Visa Support",
    });

    useEffect(() => {
        const q = query(collection(db, "opportunities"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data: Opportunity[] = [];
            snapshot.forEach((docSnap) => {
                const item = docSnap.data();
                data.push({
                    id: docSnap.id,
                    leadNo: item.leadNo || "N/A",
                    clientName: item.clientName || "Unknown",
                    stage: item.stage || "Consultation",
                    probability: Number(item.probability) || 0,
                    expectedValue: Number(item.expectedValue) || 0,
                    ownerName: item.ownerName || "Unassigned",
                    closeDate: item.closeDate || "",
                    serviceMix: item.serviceMix || "Visa Support",
                });
            });
            setOpportunities(data);
            setLoading(false);
        }, (error) => {
            console.error("Error reading opportunities:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const updateOpportunityStage = async (id: string, stage: Opportunity["stage"]) => {
        try {
            const oppRef = doc(db, "opportunities", id);
            const prob = STAGE_PROBABILITIES[stage];
            await updateDoc(oppRef, { stage, probability: prob });
        } catch (error) {
            console.error("Error updating stage:", error);
        }
    };

    const handleCreateOpportunity = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.clientName || !formData.expectedValue) {
            alert("Client Name and Expected Value are required.");
            return;
        }

        try {
            const prob = STAGE_PROBABILITIES[formData.stage];
            await addDoc(collection(db, "opportunities"), {
                ...formData,
                probability: prob,
                createdAt: new Date().toISOString(),
            });
            setShowModal(false);
            setFormData({
                leadNo: "",
                clientName: "",
                stage: "Consultation",
                expectedValue: 0,
                ownerName: "",
                closeDate: "",
                serviceMix: "Visa Support",
            });
            alert("Opportunity created successfully!");
        } catch (error) {
            console.error("Error creating opportunity:", error);
            alert("Failed to create opportunity.");
        }
    };

    // Computations
    const pipelineTotal = opportunities.reduce((acc, opp) => {
        if (opp.stage !== "Closed Lost") {
            return acc + opp.expectedValue;
        }
        return acc;
    }, 0);

    const weightedRevenue = opportunities.reduce((acc, opp) => {
        if (opp.stage !== "Closed Lost") {
            return acc + (opp.expectedValue * opp.probability) / 100;
        }
        return acc;
    }, 0);

    const wonCount = opportunities.filter((o) => o.stage === "Closed Won").length;
    const closedCount = opportunities.filter((o) => o.stage === "Closed Won" || o.stage === "Closed Lost").length;
    const winRate = closedCount > 0 ? Math.round((wonCount / closedCount) * 100) : 0;

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                        <Kanban className="text-[#e68932]" />
                        Sales Opportunity Pipeline
                    </h1>
                    <p className="mt-2 text-gray-400">Track pipeline stages, forecast weighted revenue, and advance customer deals.</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#e68932] px-6 py-3 font-semibold text-white hover:opacity-90 transition active:scale-95 text-sm"
                >
                    <Plus size={18} />
                    New Opportunity
                </button>
            </div>

            {/* Financial Revenue Indicators */}
            <div className="grid gap-6 md:grid-cols-3">
                <div className="rounded-3xl bg-white/5 border border-white/10 p-6 flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-400 font-semibold uppercase tracking-wider font-sans">Active Pipeline Value</p>
                        <h2 className="mt-2 text-3xl font-bold text-white">AED {pipelineTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h2>
                        <p className="mt-1 text-xs text-gray-500">Unclosed opportunities sum</p>
                    </div>
                    <div className="h-12 w-12 bg-white/10 rounded-2xl flex items-center justify-center text-[#e68932]">
                        <DollarSign size={24} />
                    </div>
                </div>

                <div className="rounded-3xl bg-white/5 border border-white/10 p-6 flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-400 font-semibold uppercase tracking-wider">Weighted Forecast Value</p>
                        <h2 className="mt-2 text-3xl font-bold text-green-400">AED {weightedRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h2>
                        <p className="mt-1 text-xs text-gray-500">Expected value weighted by probability</p>
                    </div>
                    <div className="h-12 w-12 bg-green-500/25 rounded-2xl flex items-center justify-center text-green-400">
                        <CheckCircle size={24} />
                    </div>
                </div>

                <div className="rounded-3xl bg-white/5 border border-white/10 p-6 flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-400 font-semibold uppercase tracking-wider">Win Rate Ratio</p>
                        <h2 className="mt-2 text-3xl font-bold text-blue-400">{winRate}%</h2>
                        <p className="mt-1 text-xs text-gray-500">{wonCount} won / {closedCount} closed</p>
                    </div>
                    <div className="h-12 w-12 bg-blue-500/25 rounded-2xl flex items-center justify-center text-blue-400">
                        <ArrowRight size={24} />
                    </div>
                </div>
            </div>

            {/* Kanban Board columns */}
            {loading ? (
                <div className="text-white text-xl">Loading CRM pipeline board...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 overflow-x-auto min-h-[500px] pb-6">
                    {STAGES.map((stage) => {
                        const items = opportunities.filter((o) => o.stage === stage);
                        const stageValue = items.reduce((s, o) => s + o.expectedValue, 0);
                        return (
                            <div key={stage} className="flex flex-col bg-black/45 rounded-3xl border border-white/5 p-4 min-w-[240px] space-y-4">
                                {/* Header */}
                                <div className="border-b border-white/5 pb-3">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-semibold text-sm text-white">{stage}</h3>
                                        <span className="text-xs bg-white/10 px-2 py-0.5 rounded-full text-gray-300 font-bold">
                                            {items.length}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-[11px] text-gray-500 mt-2">
                                        <span>Val: AED {stageValue.toLocaleString()}</span>
                                        <span>Prob: {STAGE_PROBABILITIES[stage]}%</span>
                                    </div>
                                </div>

                                {/* Cards list */}
                                <div className="flex-1 space-y-3 overflow-y-auto max-h-[450px] pr-1">
                                    {items.length === 0 ? (
                                        <div className="text-center py-10 text-xs text-gray-600 border-2 border-dashed border-white/5 rounded-2xl">
                                            Empty Column
                                        </div>
                                    ) : (
                                        items.map((opp) => (
                                            <div key={opp.id} className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3 shadow-md hover:border-white/20 transition cursor-pointer">
                                                <div>
                                                    <h4 className="font-bold text-xs text-white">{opp.clientName}</h4>
                                                    <p className="text-[10px] text-gray-500 mt-0.5">Ref: {opp.leadNo}</p>
                                                </div>
                                                <div className="flex items-center justify-between text-xs">
                                                    <span className="font-semibold text-gray-300">{opp.serviceMix}</span>
                                                    <span className="font-bold text-[#e68932]">AED {opp.expectedValue.toLocaleString()}</span>
                                                </div>
                                                <div className="flex items-center justify-between border-t border-white/5 pt-2 text-[10px] text-gray-500">
                                                    <span>Owner: {opp.ownerName}</span>
                                                    <span>Date: {opp.closeDate || "N/A"}</span>
                                                </div>

                                                {/* Mini stage switcher buttons (Fallback for quick accessibility) */}
                                                <div className="flex gap-1 pt-1 justify-end border-t border-white/5 mt-2">
                                                    {STAGES.filter(s => s !== stage).slice(0, 3).map((targetStage) => (
                                                        <button
                                                            key={targetStage}
                                                            onClick={() => updateOpportunityStage(opp.id, targetStage)}
                                                            className="text-[8px] bg-white/5 hover:bg-white/10 text-gray-400 px-1.5 py-0.5 rounded font-semibold"
                                                            title={`Move to ${targetStage}`}
                                                        >
                                                            {targetStage.substring(0, 6)}..
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Opportunity creation Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
                    <div className="bg-[#071120] text-white w-full max-w-lg rounded-3xl p-8 border border-white/10 shadow-2xl relative max-h-[90vh] overflow-y-auto">
                        <h2 className="text-2xl font-bold mb-6 text-[#e68932]">New Sales Opportunity</h2>

                        <form onSubmit={handleCreateOpportunity} className="space-y-4">
                            <div>
                                <label className="text-xs text-gray-400 font-bold uppercase tracking-wider">Client Name</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Client or Agent Name"
                                    value={formData.clientName}
                                    onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                                    className="mt-1 h-11 w-full rounded-xl border-none bg-white/5 px-4 text-sm text-white outline-none focus:bg-white/10"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-gray-400 font-bold uppercase tracking-wider">Lead Number Ref</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. LD-2026-000421"
                                        value={formData.leadNo}
                                        onChange={(e) => setFormData({ ...formData, leadNo: e.target.value })}
                                        className="mt-1 h-11 w-full rounded-xl border-none bg-white/5 px-4 text-sm text-white outline-none focus:bg-white/10"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-400 font-bold uppercase tracking-wider">Expected Value (AED)</label>
                                    <input
                                        type="number"
                                        required
                                        placeholder="0"
                                        value={formData.expectedValue || ""}
                                        onChange={(e) => setFormData({ ...formData, expectedValue: Number(e.target.value) })}
                                        className="mt-1 h-11 w-full rounded-xl border-none bg-white/5 px-4 text-sm text-white outline-none focus:bg-white/10"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-gray-400 font-bold uppercase tracking-wider">Initial Pipeline Stage</label>
                                    <select
                                        value={formData.stage}
                                        onChange={(e) => setFormData({ ...formData, stage: e.target.value as any })}
                                        className="mt-1 h-11 w-full rounded-xl border-none bg-white/5 px-4 text-sm text-white outline-none focus:bg-white/10"
                                    >
                                        {STAGES.map((s) => (
                                            <option key={s} value={s} className="bg-[#071120]">
                                                {s} ({STAGE_PROBABILITIES[s]}%)
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-400 font-bold uppercase tracking-wider">Service Mix Type</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Europe Visa + Flights"
                                        value={formData.serviceMix}
                                        onChange={(e) => setFormData({ ...formData, serviceMix: e.target.value })}
                                        className="mt-1 h-11 w-full rounded-xl border-none bg-white/5 px-4 text-sm text-white outline-none focus:bg-white/10"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-gray-400 font-bold uppercase tracking-wider">Estimated Close Date</label>
                                    <input
                                        type="date"
                                        value={formData.closeDate}
                                        onChange={(e) => setFormData({ ...formData, closeDate: e.target.value })}
                                        className="mt-1 h-11 w-full rounded-xl border-none bg-white/5 px-4 text-xs text-white outline-none focus:bg-white/10"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-400 font-bold uppercase tracking-wider">Owner / Manager</label>
                                    <input
                                        type="text"
                                        placeholder="Assignee Name"
                                        value={formData.ownerName}
                                        onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
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
                                    Create Opportunity
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
