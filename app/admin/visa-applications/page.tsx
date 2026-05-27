"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import {
    collection,
    query,
    doc,
    updateDoc,
    onSnapshot,
} from "firebase/firestore";
import DocumentList from "@/components/admin/DocumentList";
import DocumentUploader from "@/components/admin/DocumentUploader";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/sheet";
import { FileText, Kanban, List, ShieldAlert, CheckCircle2, Clock } from "lucide-react";
import { AutomationService } from "@/lib/automation";

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
    checklistProgress?: number; // 0 to 100
    submittedAt?: string;
};

const STAGES: VisaApplication["status"][] = ["pending", "processing", "approved", "rejected"];

export default function VisaApplicationsAdminPage() {
    const [applications, setApplications] = useState<VisaApplication[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedApplication, setSelectedApplication] = useState<VisaApplication | null>(null);
    const [viewMode, setViewMode] = useState<"list" | "kanban">("list");

    // Sync selected application with real-time updates
    useEffect(() => {
        if (selectedApplication) {
            const updated = applications.find((app) => app.id === selectedApplication.id);
            if (updated) {
                setSelectedApplication(updated);
            } else {
                setSelectedApplication(null);
            }
        }
    }, [applications]);

    useEffect(() => {
        const q = query(collection(db, "visaApplications"));

        const unsubscribe = onSnapshot(
            q,
            (querySnapshot) => {
                const data: VisaApplication[] = [];
                querySnapshot.forEach((docItem) => {
                    const docData = docItem.data();
                    data.push({
                        id: docItem.id,
                        applicantName: docData.applicantName || "Unknown",
                        passportNumber: docData.passportNumber || "N/A",
                        destination: docData.destination || "N/A",
                        status: docData.status || "pending",
                        rejectionReason: docData.rejectionReason || "",
                        uploadedDocs: docData.uploadedDocs || [],
                        phone: docData.phone || "",
                        whatsapp: docData.whatsapp || "",
                        email: docData.email || "",
                        checklistProgress: Number(docData.checklistProgress) || 40,
                        submittedAt: docData.submittedAt || new Date().toISOString(),
                    });
                });
                setApplications(data);
                setLoading(false);
            },
            (error) => {
                console.error("Error reading visaApplications:", error);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, []);

    const updateStatus = async (id: string, status: string) => {
        try {
            const appRef = doc(db, "visaApplications", id);
            const updateData: any = { status };
            
            if (status === "rejected") {
                const reason = prompt("Enter rejection reason:");
                if (reason) {
                    updateData.rejectionReason = reason;
                }
            }

            await updateDoc(appRef, updateData);

            // Send notification to the user
            const app = applications.find((a) => a.id === id);
            if (app) {
                if (app.email) {
                    await AutomationService.sendVisaStatusUpdate(app.email, status, updateData.rejectionReason);
                }
                const notifyPhone = app.whatsapp || app.phone;
                if (notifyPhone) {
                    await AutomationService.sendWhatsAppNotification(
                        notifyPhone,
                        `Hi ${app.applicantName}, your visa application status for ${app.destination} has been updated to ${status.toUpperCase()}. ${updateData.rejectionReason ? `Reason: ${updateData.rejectionReason}` : ""}`
                    );
                }
            }
        } catch (error) {
            console.log(error);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "pending": return "bg-yellow-500/20 text-yellow-400 border border-yellow-500/10";
            case "processing": return "bg-blue-500/20 text-blue-400 border border-blue-500/10";
            case "approved": return "bg-green-500/20 text-green-400 border border-green-500/10";
            case "rejected": return "bg-red-500/20 text-red-400 border border-red-500/10";
            default: return "bg-gray-500/20 text-gray-400";
        }
    };

    const calculateSLADays = (submittedAtStr?: string) => {
        if (!submittedAtStr) return 0;
        const sub = new Date(submittedAtStr);
        const today = new Date();
        const diff = today.getTime() - sub.getTime();
        return Math.floor(diff / (1000 * 60 * 60 * 24));
    };

    return (
        <div className="space-y-8 font-sans">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">Visa Cases Operations</h1>
                    <p className="mt-2 text-gray-400">Manage client visa checklist requirements, track embassy reviews, and schedule biometric dates.</p>
                </div>
                <div className="flex items-center gap-4">
                    {/* Toggle Controls */}
                    <div className="flex gap-1 bg-white/5 p-1 rounded-xl border border-white/10">
                        <button
                            onClick={() => setViewMode("list")}
                            className={`p-2 rounded-lg transition ${viewMode === "list" ? "bg-[#e68932] text-white" : "text-gray-400 hover:text-white"}`}
                            title="List View"
                        >
                            <List size={18} />
                        </button>
                        <button
                            onClick={() => setViewMode("kanban")}
                            className={`p-2 rounded-lg transition ${viewMode === "kanban" ? "bg-[#e68932] text-white" : "text-gray-400 hover:text-white"}`}
                            title="Kanban Board View"
                        >
                            <Kanban size={18} />
                        </button>
                    </div>

                    <div className="rounded-xl bg-white/5 border border-white/10 px-4 py-2 text-right">
                        <p className="text-xs text-gray-400 font-semibold uppercase">Total Applications</p>
                        <h2 className="text-lg font-bold text-white">{applications.length}</h2>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="text-white text-xl">Loading Visa Applications...</div>
            ) : viewMode === "list" ? (
                /* List View */
                <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-white">
                            <thead className="border-b border-white/10 bg-black/40 text-xs font-semibold uppercase tracking-wider text-gray-400">
                                <tr>
                                    <th className="px-6 py-4">Applicant Info</th>
                                    <th className="px-6 py-4">Destination</th>
                                    <th className="px-6 py-4">Checklist Progress</th>
                                    <th className="px-6 py-4">SLA Days</th>
                                    <th className="px-6 py-4">Documents</th>
                                    <th className="px-6 py-4">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 text-sm">
                                {applications.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-gray-400">No Visa Applications Found</td>
                                    </tr>
                                ) : (
                                    applications.map((app) => {
                                        const sla = calculateSLADays(app.submittedAt);
                                        return (
                                            <tr key={app.id} className="transition hover:bg-white/5">
                                                <td className="px-6 py-4">
                                                    <div className="font-semibold text-white">{app.applicantName}</div>
                                                    <div className="text-xs text-gray-500 mt-1">Passport: {app.passportNumber}</div>
                                                    <div className="text-[10px] font-mono text-gray-600 mt-1">ID: {app.id}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="inline-block rounded-lg bg-white/10 px-3 py-1 text-xs font-semibold">
                                                        {app.destination}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="h-1.5 w-24 bg-white/10 rounded-full overflow-hidden">
                                                            <div className="h-full bg-[#00C2FF]" style={{ width: `${app.checklistProgress}%` }} />
                                                        </div>
                                                        <span className="text-xs text-gray-400 font-semibold">{app.checklistProgress}%</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded font-semibold ${
                                                        sla > 14 ? "bg-red-500/20 text-red-400" : "bg-white/10 text-gray-300"
                                                    }`}>
                                                        {sla} Days
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <button
                                                        onClick={() => setSelectedApplication(app)}
                                                        className="inline-flex items-center gap-1.5 rounded-xl bg-white/5 border border-white/10 px-4 py-2 text-xs font-semibold text-[#00C2FF] hover:bg-[#00C2FF]/10 transition active:scale-[0.98]"
                                                    >
                                                        <FileText size={14} />
                                                        Verify Docs ({app.uploadedDocs.length})
                                                    </button>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <select
                                                        value={app.status}
                                                        onChange={(e) => updateStatus(app.id, e.target.value)}
                                                        className={`rounded-xl border-none outline-none px-3 py-2 text-xs font-bold uppercase tracking-wider ${getStatusColor(app.status)}`}
                                                    >
                                                        <option value="pending" className="bg-[#071120] text-white">Pending</option>
                                                        <option value="processing" className="bg-[#071120] text-white">Processing</option>
                                                        <option value="approved" className="bg-[#071120] text-white">Approved</option>
                                                        <option value="rejected" className="bg-[#071120] text-white">Rejected</option>
                                                    </select>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                /* Kanban View */
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 overflow-x-auto min-h-[500px]">
                    {STAGES.map((stage) => {
                        const items = applications.filter((app) => app.status === stage);
                        return (
                            <div key={stage} className="flex flex-col bg-black/45 rounded-3xl border border-white/5 p-4 min-w-[250px] space-y-4">
                                {/* Header */}
                                <div className="border-b border-white/5 pb-3">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-bold text-sm uppercase tracking-wider text-white">{stage}</h3>
                                        <span className="text-xs bg-white/10 px-2 py-0.5 rounded-full text-gray-300 font-bold">
                                            {items.length}
                                        </span>
                                    </div>
                                </div>

                                {/* Cards */}
                                <div className="flex-1 space-y-3 overflow-y-auto max-h-[450px] pr-1">
                                    {items.length === 0 ? (
                                        <div className="text-center py-12 text-xs text-gray-600 border-2 border-dashed border-white/5 rounded-2xl">
                                            No Applications
                                        </div>
                                    ) : (
                                        items.map((app) => {
                                            const sla = calculateSLADays(app.submittedAt);
                                            return (
                                                <div
                                                    key={app.id}
                                                    onClick={() => setSelectedApplication(app)}
                                                    className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3 hover:border-white/20 transition cursor-pointer"
                                                >
                                                    <div>
                                                        <h4 className="font-bold text-xs text-white">{app.applicantName}</h4>
                                                        <p className="text-[10px] text-gray-500 mt-0.5">Passport: {app.passportNumber}</p>
                                                    </div>
                                                    <div className="flex items-center justify-between text-xs">
                                                        <span className="bg-white/10 px-2 py-0.5 rounded text-[10px] font-semibold text-gray-300">
                                                            {app.destination}
                                                        </span>
                                                        <span className={`text-[10px] font-bold ${sla > 14 ? "text-red-400" : "text-gray-400"}`}>
                                                            {sla} Days Active
                                                        </span>
                                                    </div>

                                                    {/* Checklist bar */}
                                                    <div className="space-y-1">
                                                        <div className="flex justify-between text-[9px] text-gray-500">
                                                            <span>Checklist Docs</span>
                                                            <span>{app.checklistProgress}%</span>
                                                        </div>
                                                        <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                                                            <div className="h-full bg-[#00C2FF]" style={{ width: `${app.checklistProgress}%` }} />
                                                        </div>
                                                    </div>

                                                    {/* Quick status controls */}
                                                    <div className="flex gap-1 pt-1 justify-end border-t border-white/5">
                                                        {STAGES.filter(s => s !== stage).map((targetStage) => (
                                                            <button
                                                                key={targetStage}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    updateStatus(app.id, targetStage);
                                                                }}
                                                                className="text-[9px] bg-white/5 hover:bg-white/10 text-gray-400 px-1.5 py-0.5 rounded font-semibold uppercase"
                                                            >
                                                                {targetStage.substring(0, 4)}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Sheet for managing documents */}
            <Sheet
                open={selectedApplication !== null}
                onOpenChange={(open) => {
                    if (!open) setSelectedApplication(null);
                }}
            >
                <SheetContent
                    side="right"
                    className="sm:max-w-2xl w-full bg-[#071120] text-white border-l border-white/10 p-6 overflow-y-auto"
                >
                    {selectedApplication && (
                        <div className="h-full flex flex-col">
                            <SheetHeader className="mb-6 pb-6 border-b border-white/10">
                                <SheetTitle className="text-2xl font-bold text-white">
                                    {selectedApplication.applicantName}
                                </SheetTitle>
                                <SheetDescription className="text-sm text-gray-400 mt-2 flex flex-col gap-2">
                                    <div>
                                        Passport: <span className="font-semibold text-white">{selectedApplication.passportNumber}</span> | ID: <span className="font-mono text-xs">{selectedApplication.id}</span>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-300 bg-white/5 p-3 rounded-xl border border-white/5 mt-1">
                                        {selectedApplication.phone && <div>Phone: <span className="text-white font-medium">{selectedApplication.phone}</span></div>}
                                        {selectedApplication.email && <div>Email: <span className="text-white font-medium">{selectedApplication.email}</span></div>}
                                        {selectedApplication.whatsapp && (
                                            <a
                                                href={`https://wa.me/${selectedApplication.whatsapp.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(`Hi ${selectedApplication.applicantName}, this is ESHAAR TOUR. We are checking your visa application.`)}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1 rounded bg-green-500 hover:bg-green-600 px-3 py-1 text-xs font-bold text-white transition duration-200"
                                            >
                                                Chat on WhatsApp
                                            </a>
                                        )}
                                    </div>
                                </SheetDescription>
                            </SheetHeader>

                            <div className="flex-1 space-y-8 pb-10">
                                {/* Upload New Document */}
                                <div className="space-y-3">
                                    <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
                                        Upload New Document
                                    </h3>
                                    <DocumentUploader
                                        entityId={selectedApplication.id}
                                        entityType="visaApplications"
                                    />
                                </div>

                                {/* List and Verify Documents */}
                                <div className="space-y-3">
                                    <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
                                        Application Documents
                                    </h3>
                                    <DocumentList
                                        entityId={selectedApplication.id}
                                        entityType="visaApplications"
                                        externalDocs={selectedApplication.uploadedDocs}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </SheetContent>
            </Sheet>
        </div>
    );
}
