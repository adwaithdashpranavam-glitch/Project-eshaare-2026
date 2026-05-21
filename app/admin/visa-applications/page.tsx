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
import { FileText } from "lucide-react";
import { AutomationService } from "@/lib/automation";

type VisaApplication = {
    id: string;
    applicantName: string;
    passportNumber: string;
    destination: string;
    status: string;
    rejectionReason?: string;
    uploadedDocs: string[];
    phone?: string;
    whatsapp?: string;
    email?: string;
};

export default function VisaApplicationsAdminPage() {
    const [applications, setApplications] = useState<VisaApplication[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedApplication, setSelectedApplication] = useState<VisaApplication | null>(null);

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

            setApplications((prev) =>
                prev.map((app) =>
                    app.id === id ? { ...app, ...updateData } : app
                )
            );

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
            case "pending": return "bg-yellow-500/20 text-yellow-400";
            case "processing": return "bg-blue-500/20 text-blue-400";
            case "approved": return "bg-green-500/20 text-green-400";
            case "rejected": return "bg-red-500/20 text-red-400";
            default: return "bg-gray-500/20 text-gray-400";
        }
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white">Visa Applications</h1>
                    <p className="mt-2 text-gray-400">Manage client visa cases (Synced from Mobile App)</p>
                </div>
                <div className="rounded-xl bg-white/5 border border-white/10 px-6 py-4">
                    <p className="text-sm text-gray-400">Total Applications</p>
                    <h2 className="mt-1 text-2xl font-bold text-white">{applications.length}</h2>
                </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-white">
                        <thead className="border-b border-white/10 bg-black/40">
                            <tr>
                                <th className="px-6 py-4 font-semibold">Applicant Info</th>
                                <th className="px-6 py-4 font-semibold">Destination</th>
                                <th className="px-6 py-4 font-semibold">Documents</th>
                                <th className="px-6 py-4 font-semibold">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-gray-400">Loading Applications...</td>
                                </tr>
                            ) : applications.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-gray-400">No Visa Applications Found</td>
                                </tr>
                            ) : (
                                applications.map((app) => (
                                    <tr key={app.id} className="transition hover:bg-white/5">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-white">{app.applicantName}</div>
                                            <div className="text-sm text-gray-500 mt-1">Passport: {app.passportNumber}</div>
                                            <div className="text-xs text-gray-600 mt-1">ID: {app.id}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-block rounded-lg bg-white/10 px-3 py-1 text-sm">
                                                {app.destination}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => setSelectedApplication(app)}
                                                className="inline-flex items-center gap-1.5 rounded-xl bg-white/5 border border-white/10 px-4 py-2 text-xs font-semibold text-[#00C2FF] hover:bg-[#00C2FF]/10 transition active:scale-[0.98]"
                                            >
                                                <FileText size={14} />
                                                Manage Docs ({app.uploadedDocs.length})
                                            </button>
                                        </td>
                                        <td className="px-6 py-4">
                                            <select
                                                value={app.status}
                                                onChange={(e) => updateStatus(app.id, e.target.value)}
                                                className={`rounded-xl border-none outline-none px-3 py-1 text-sm font-medium ${getStatusColor(app.status)}`}
                                            >
                                                <option value="pending" className="bg-[#071120] text-white">Pending</option>
                                                <option value="processing" className="bg-[#071120] text-white">Processing</option>
                                                <option value="approved" className="bg-[#071120] text-white">Approved</option>
                                                <option value="rejected" className="bg-[#071120] text-white">Rejected</option>
                                            </select>
                                            
                                            {app.status === "rejected" && app.rejectionReason && (
                                                <div className="mt-2 text-xs text-red-400 max-w-[150px]">
                                                    Reason: {app.rejectionReason}
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
