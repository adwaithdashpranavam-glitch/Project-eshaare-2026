"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, AlertCircle, Clock, Calendar, Plus, ShieldAlert } from "lucide-react";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
import DocumentList from "@/components/admin/DocumentList";
import DocumentUploader from "@/components/admin/DocumentUploader";

type VisaApplication = {
    id: string;
    applicantName: string;
    passportNumber: string;
    destination: string;
    status: "pending" | "processing" | "approved" | "rejected";
    rejectionReason?: string;
    uploadedDocs: string[];
    phone?: string;
    whatsapp?: string;
    email?: string;
    checklistProgress?: number;
    submittedAt?: string;
    embassyLogs?: { text: string; date: string }[];
    decisionDate?: string;
    visaExpiryDate?: string;
};

export default function VisaCaseDetailsPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const [app, setApp] = useState<VisaApplication | null>(null);
    const [loading, setLoading] = useState(true);
    const [newLog, setNewLog] = useState("");

    // Decision Form
    const [decisionStatus, setDecisionStatus] = useState<VisaApplication["status"]>("approved");
    const [reason, setReason] = useState("");
    const [expiryDate, setExpiryDate] = useState("");

    const fetchCase = async () => {
        try {
            const docSnap = await getDoc(doc(db, "visaApplications", id));
            if (docSnap.exists()) {
                const data = docSnap.data() as any;
                setApp({
                    id: docSnap.id,
                    ...data,
                    embassyLogs: data.embassyLogs || [],
                    uploadedDocs: data.uploadedDocs || [],
                });
                setDecisionStatus(data.status || "approved");
                setReason(data.rejectionReason || "");
                setExpiryDate(data.visaExpiryDate || "");
            }
        } catch (err) {
            console.error("Error reading visa details:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCase();
    }, [id]);

    const handleAddEmbassyLog = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newLog.trim()) return;

        try {
            const appRef = doc(db, "visaApplications", id);
            const entry = { text: newLog, date: new Date().toISOString() };
            await updateDoc(appRef, {
                embassyLogs: arrayUnion(entry)
            });
            setNewLog("");
            fetchCase();
            alert("Embassy event logged successfully!");
        } catch (err) {
            console.error("Error logging event:", err);
        }
    };

    const handleSaveDecision = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const appRef = doc(db, "visaApplications", id);
            await updateDoc(appRef, {
                status: decisionStatus,
                rejectionReason: decisionStatus === "rejected" ? reason : "",
                visaExpiryDate: decisionStatus === "approved" ? expiryDate : "",
                decisionDate: new Date().toISOString(),
            });
            alert("Visa status decision successfully saved and synced!");
            fetchCase();
        } catch (err) {
            console.error("Error saving decision:", err);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#071120] text-white">
                <h1 className="text-xl text-gray-400">Loading visa details workspace...</h1>
            </div>
        );
    }

    if (!app) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#071120] text-white">
                <h1 className="text-xl text-red-400">Visa Application not found.</h1>
            </div>
        );
    }

    return (
        <div className="space-y-8 font-sans max-w-5xl mx-auto">
            {/* BACK LINK */}
            <Link
                href="/admin/visa-applications"
                className="inline-flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/10 transition"
            >
                <ArrowLeft size={16} />
                Back to Operations
            </Link>

            {/* HEADER */}
            <div className="flex justify-between items-start">
                <div>
                    <span className="text-xs font-bold text-[#00C2FF] uppercase tracking-wider">Visa Case Desk</span>
                    <h1 className="text-3xl font-extrabold text-white mt-1">{app.applicantName}</h1>
                    <p className="text-xs text-gray-500 mt-1">Passport ID: {app.passportNumber} | Target Destination: {app.destination}</p>
                </div>
                <div className="text-right">
                    <span className="text-xs text-gray-400 uppercase font-semibold">Active Status</span>
                    <p className="mt-1">
                        <span className={`inline-block text-[10px] px-3 py-1.5 font-bold uppercase tracking-wider rounded-xl ${
                            app.status === "approved"
                                ? "bg-green-500/20 text-green-400"
                                : app.status === "rejected"
                                ? "bg-red-500/20 text-red-400"
                                : app.status === "processing"
                                ? "bg-blue-500/20 text-blue-400"
                                : "bg-yellow-500/20 text-yellow-400"
                        }`}>
                            {app.status}
                        </span>
                    </p>
                </div>
            </div>

            {/* MAIN DATA BLOCK */}
            <div className="grid gap-8 md:grid-cols-3">
                
                {/* Left: Embassy Logs and Timeline */}
                <div className="md:col-span-2 space-y-6">
                    {/* Checklist & Document Uploader */}
                    <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-4">
                        <h3 className="text-sm font-semibold uppercase text-gray-400 tracking-wider">Required Document Attachments</h3>
                        <DocumentUploader entityId={id} entityType="visaApplications" onUploadComplete={fetchCase} />
                        <div className="bg-[#071120] rounded-2xl p-4 border border-white/5">
                            <DocumentList entityId={id} entityType="visaApplications" externalDocs={app.uploadedDocs} />
                        </div>
                    </div>

                    {/* Timeline Event log */}
                    <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-4">
                        <h3 className="text-sm font-semibold uppercase text-gray-400 tracking-wider">Embassy Process Logs</h3>
                        
                        {/* Event logging form */}
                        <form onSubmit={handleAddEmbassyLog} className="flex gap-2">
                            <input
                                type="text"
                                required
                                placeholder="Log embassy update (e.g. Biometrics completed in Dubai)"
                                value={newLog}
                                onChange={(e) => setNewLog(e.target.value)}
                                className="flex-1 h-11 rounded-xl border-none bg-white/5 px-4 text-xs text-white outline-none focus:bg-white/10"
                            />
                            <button
                                type="submit"
                                className="h-11 px-5 rounded-xl bg-[#e68932] text-white hover:opacity-90 font-semibold text-xs transition"
                            >
                                Log Event
                            </button>
                        </form>

                        {/* Timeline */}
                        <div className="space-y-4 pt-4">
                            {app.embassyLogs?.length === 0 ? (
                                <p className="text-xs text-gray-500 text-center py-6">No embassy milestones logged yet.</p>
                            ) : (
                                app.embassyLogs?.map((log, idx) => (
                                    <div key={idx} className="flex gap-4 items-start text-xs border-l border-white/10 pl-4 relative">
                                        <div className="absolute h-2.5 w-2.5 bg-[#e68932] rounded-full -left-[6px] top-1" />
                                        <div>
                                            <p className="font-semibold text-white leading-relaxed">{log.text}</p>
                                            <span className="text-[10px] text-gray-500 mt-1 block">
                                                {new Date(log.date).toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Right: Decision Desk */}
                <div className="space-y-6">
                    <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-4">
                        <h3 className="text-sm font-bold uppercase text-gray-400 tracking-wider">Visa Decision Desk</h3>
                        
                        <form onSubmit={handleSaveDecision} className="space-y-4">
                            <div>
                                <label className="text-xs text-gray-400 font-bold uppercase tracking-wider">Embassy Outcome</label>
                                <select
                                    value={decisionStatus}
                                    onChange={(e) => setDecisionStatus(e.target.value as any)}
                                    className="mt-1 h-11 w-full rounded-xl border-none bg-white/5 px-4 text-sm text-white outline-none focus:bg-white/10"
                                >
                                    <option value="processing" className="bg-[#071120]">Under Processing</option>
                                    <option value="approved" className="bg-[#071120]">Approved (Issued)</option>
                                    <option value="rejected" className="bg-[#071120]">Rejected</option>
                                </select>
                            </div>

                            {decisionStatus === "approved" ? (
                                <div>
                                    <label className="text-xs text-gray-400 font-bold uppercase tracking-wider">Visa Expiry Date</label>
                                    <input
                                        type="date"
                                        required
                                        value={expiryDate}
                                        onChange={(e) => setExpiryDate(e.target.value)}
                                        className="mt-1 h-11 w-full rounded-xl border-none bg-white/5 px-4 text-xs text-white outline-none focus:bg-white/10"
                                    />
                                </div>
                            ) : decisionStatus === "rejected" ? (
                                <div>
                                    <label className="text-xs text-gray-400 font-bold uppercase tracking-wider">Rejection Reason</label>
                                    <textarea
                                        required
                                        rows={3}
                                        placeholder="Enter details of rejection letter..."
                                        value={reason}
                                        onChange={(e) => setReason(e.target.value)}
                                        className="mt-1 w-full rounded-xl border-none bg-white/5 p-4 text-xs text-white outline-none focus:bg-white/10"
                                    />
                                </div>
                            ) : null}

                            <button
                                type="submit"
                                className="w-full h-11 rounded-xl bg-green-500 hover:bg-green-600 text-white font-semibold text-xs transition"
                            >
                                Save Decision Result
                            </button>
                        </form>
                    </div>

                    {/* Quick reminders list */}
                    <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-3 text-xs text-gray-400 leading-relaxed">
                        <h4 className="font-bold text-white uppercase tracking-wider text-[10px]">Operations Reminders</h4>
                        <p>1. Check if passport expiry date is registered in the Travellers file before submitting.</p>
                        <p>2. Verify if the 5% VAT billing invoice is set to Paid status before releasing approved visa files.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
