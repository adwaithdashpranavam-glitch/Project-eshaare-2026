"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, DollarSign, Calendar, MessageSquare, ShieldCheck, RefreshCw } from "lucide-react";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, collection, query, where, onSnapshot } from "firebase/firestore";

type Opportunity = {
    id?: string;
    leadNo: string;
    clientName: string;
    stage: "Consultation" | "Quote Sent" | "Payment Pending" | "Closed Won" | "Closed Lost";
    probability: number;
    expectedValue: number;
    ownerName: string;
    closeDate: string;
    serviceMix: string;
};

type Quote = {
    id: string;
    quoteNo: string;
    versionNo: number;
    totalAmount: number;
    approvalStatus: string;
    validUntil: string;
};

type CommsLog = {
    id: string;
    channel: string;
    direction: string;
    body: string;
    sentAt: string;
    status: string;
};

const STAGES = ["Consultation", "Quote Sent", "Payment Pending", "Closed Won"];

export default function OpportunityDetailsPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const [opp, setOpp] = useState<Opportunity | null>(null);
    const [quotes, setQuotes] = useState<Quote[]>([]);
    const [comms, setComms] = useState<CommsLog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOpp = async () => {
            try {
                const docSnap = await getDoc(doc(db, "opportunities", id));
                if (docSnap.exists()) {
                    setOpp({ id: docSnap.id, ...docSnap.data() } as Opportunity);
                }
            } catch (err) {
                console.error("Error reading opportunity details:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchOpp();

        // Subscriptions
        const quotesQuery = query(collection(db, "quotes"), where("opportunityId", "==", id));
        const unsubQuotes = onSnapshot(quotesQuery, (snapshot) => {
            const data: Quote[] = [];
            snapshot.forEach(docSnap => {
                data.push({ id: docSnap.id, ...docSnap.data() } as Quote);
            });
            setQuotes(data);
        });

        const commsQuery = query(collection(db, "communications"), where("clientId", "==", id));
        const unsubComms = onSnapshot(commsQuery, (snapshot) => {
            const data: CommsLog[] = [];
            snapshot.forEach(docSnap => {
                data.push({ id: docSnap.id, ...docSnap.data() } as CommsLog);
            });
            data.sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());
            setComms(data);
        });

        return () => {
            unsubQuotes();
            unsubComms();
        };
    }, [id]);

    const handleUpdateStage = async (stage: Opportunity["stage"]) => {
        if (!opp) return;
        const probs: Record<Opportunity["stage"], number> = {
            "Consultation": 40,
            "Quote Sent": 60,
            "Payment Pending": 90,
            "Closed Won": 100,
            "Closed Lost": 0
        };
        try {
            const oppRef = doc(db, "opportunities", id);
            await updateDoc(oppRef, { stage, probability: probs[stage] });
            setOpp({ ...opp, stage, probability: probs[stage] });
        } catch (err) {
            console.error("Error updating stage:", err);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#071120] text-white">
                <h1 className="text-xl text-gray-400">Loading opportunity workspace...</h1>
            </div>
        );
    }

    if (!opp) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#071120] text-white">
                <h1 className="text-xl text-red-400">Opportunity not found.</h1>
            </div>
        );
    }

    return (
        <div className="space-y-8 font-sans max-w-5xl mx-auto">
            {/* BACK LINK */}
            <Link
                href="/admin/opportunities"
                className="inline-flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/10 transition"
            >
                <ArrowLeft size={16} />
                Back to Pipeline
            </Link>

            {/* HEADER */}
            <div className="flex justify-between items-start">
                <div>
                    <span className="text-xs font-bold text-[#00C2FF] uppercase tracking-wider">Opportunity Workspace</span>
                    <h1 className="text-3xl font-extrabold text-white mt-1">{opp.clientName}</h1>
                    <p className="text-xs text-gray-500 mt-1">Lead ID Ref: {opp.leadNo} | Account Owner: {opp.ownerName}</p>
                </div>
                <div className="text-right">
                    <span className="text-xs text-gray-400 uppercase font-semibold">Forecast Close Date</span>
                    <p className="text-sm font-bold text-white mt-1 flex items-center gap-1.5 justify-end">
                        <Calendar size={14} className="text-[#e68932]" />
                        {opp.closeDate ? new Date(opp.closeDate).toLocaleDateString() : "N/A"}
                    </p>
                </div>
            </div>

            {/* STEPPER PROGRESS */}
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
                <h3 className="text-xs font-bold uppercase text-gray-400 tracking-wider mb-6">Pipeline Progress Stepper</h3>
                <div className="flex justify-between items-center overflow-x-auto gap-4 py-2">
                    {STAGES.map((stg, i) => {
                        const isCurrent = opp.stage === stg;
                        const isCompleted = STAGES.indexOf(opp.stage) >= i && opp.stage !== "Closed Lost";
                        return (
                            <div
                                key={stg}
                                onClick={() => handleUpdateStage(stg as any)}
                                className={`flex-1 min-w-[120px] text-center p-3 rounded-2xl border cursor-pointer transition ${
                                    isCurrent
                                        ? "bg-[#e68932]/10 border-[#e68932] text-[#e68932]"
                                        : isCompleted
                                        ? "bg-green-500/10 border-green-500/20 text-green-400"
                                        : "bg-white/5 border-white/5 text-gray-400"
                                }`}
                            >
                                <span className="text-[10px] font-bold block mb-1">STEP 0{i + 1}</span>
                                <span className="text-xs font-bold">{stg}</span>
                            </div>
                        );
                    })}
                    <div
                        onClick={() => handleUpdateStage("Closed Lost")}
                        className={`min-w-[120px] text-center p-3 rounded-2xl border cursor-pointer transition ${
                            opp.stage === "Closed Lost"
                                ? "bg-red-500/10 border-red-500 text-red-400"
                                : "bg-white/5 border-white/5 text-gray-500 hover:text-red-400"
                        }`}
                    >
                        <span className="text-[10px] font-bold block mb-1">FAILSTAGE</span>
                        <span className="text-xs font-bold">Closed Lost</span>
                    </div>
                </div>
            </div>

            {/* DEAL SUMMARY & COMMERCIALS */}
            <div className="grid gap-6 md:grid-cols-3">
                <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
                    <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Gross Deal Value</span>
                    <h2 className="text-2xl font-bold text-white mt-3">AED {opp.expectedValue.toLocaleString()}</h2>
                    <p className="text-[10px] text-gray-500 mt-1.5">For: {opp.serviceMix}</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
                    <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Stage Probability</span>
                    <h2 className="text-2xl font-bold text-[#00C2FF] mt-3">{opp.probability}%</h2>
                    <p className="text-[10px] text-gray-500 mt-1.5">Calculated based on stage</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
                    <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Weighted Deal Value</span>
                    <h2 className="text-2xl font-bold text-green-400 mt-3">AED {((opp.expectedValue * opp.probability) / 100).toLocaleString()}</h2>
                    <p className="text-[10px] text-gray-500 mt-1.5">Expected forecast value</p>
                </div>
            </div>

            {/* QUOTES & INVOICES */}
            <div className="grid gap-8 md:grid-cols-2">
                <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-4">
                    <div className="flex items-center justify-between border-b border-white/5 pb-3">
                        <h3 className="font-bold text-sm text-white uppercase tracking-wider">Linked Estimates</h3>
                        <Link href="/admin/quotes" className="text-xs text-[#e68932] hover:underline font-semibold">Builder</Link>
                    </div>

                    <div className="space-y-3">
                        {quotes.length === 0 ? (
                            <p className="text-xs text-gray-500 py-6 text-center">No quotes linked to this opportunity yet.</p>
                        ) : (
                            quotes.map((q) => (
                                <div key={q.id} className="flex justify-between items-center bg-black/30 p-3 rounded-2xl border border-white/5 text-xs">
                                    <div>
                                        <p className="font-bold text-white">{q.quoteNo} (v{q.versionNo})</p>
                                        <p className="text-[10px] text-gray-500 mt-0.5">Valid to: {q.validUntil}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-[#e68932]">AED {q.totalAmount.toLocaleString()}</p>
                                        <span className="text-[9px] bg-white/15 px-1.5 py-0.5 rounded uppercase font-bold text-gray-300">{q.approvalStatus}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* COMMUNICATIONS TIMELINE */}
                <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-4">
                    <div className="flex items-center justify-between border-b border-white/5 pb-3">
                        <h3 className="font-bold text-sm text-white uppercase tracking-wider">Client Communications</h3>
                        <Link href="/admin/communications" className="text-xs text-[#00C2FF] hover:underline font-semibold">Comms Hub</Link>
                    </div>

                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                        {comms.length === 0 ? (
                            <p className="text-xs text-gray-500 py-6 text-center">No communications logs found.</p>
                        ) : (
                            comms.map((log) => (
                                <div key={log.id} className="bg-black/30 p-3.5 rounded-2xl border border-white/5 text-xs space-y-2">
                                    <div className="flex justify-between text-[10px]">
                                        <span className="font-bold text-[#00C2FF] flex items-center gap-1">
                                            <MessageSquare size={10} />
                                            {log.channel} ({log.direction})
                                        </span>
                                        <span className="text-gray-500">{new Date(log.sentAt).toLocaleTimeString()}</span>
                                    </div>
                                    <p className="text-gray-300 leading-relaxed text-[11px] line-clamp-2">{log.body}</p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
