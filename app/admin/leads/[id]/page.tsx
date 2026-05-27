"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { db } from "@/lib/firebase";
import DocumentList from "@/components/admin/DocumentList";
import DocumentUploader from "@/components/admin/DocumentUploader";
import { AutomationService } from "@/lib/automation";

import {
    doc,
    getDoc,
    updateDoc,
    arrayUnion,
    serverTimestamp,
    collection,
    addDoc,
    where,
    query,
    onSnapshot,
} from "firebase/firestore";

type Note = {
    text: string;
};

type Lead = {
    id?: string;
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
    notes?: Note[];
};

export default function LeadDetailsPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const [lead, setLead] = useState<Lead | null>(null);
    const [note, setNote] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [showUploader, setShowUploader] = useState(false);

    // Edit states
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState<Partial<Lead>>({});

    // Payments states
    const [invoices, setInvoices] = useState<any[]>([]);
    const [invoiceDesc, setInvoiceDesc] = useState("");
    const [invoiceAmount, setInvoiceAmount] = useState("");
    const [generatingInvoice, setGeneratingInvoice] = useState(false);

    // Subscribe to invoices
    useEffect(() => {
        const q = query(collection(db, "invoices"), where("leadId", "==", id));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data: any[] = [];
            snapshot.forEach((docSnap) => {
                data.push({ id: docSnap.id, ...docSnap.data() });
            });
            setInvoices(data);
        }, (error) => {
            console.error("Error reading invoices:", error);
        });
        return () => unsubscribe();
    }, [id]);

    const handleGenerateInvoice = async () => {
        if (!invoiceDesc.trim() || !invoiceAmount) {
            alert("Please enter invoice description and amount");
            return;
        }

        const amt = parseFloat(invoiceAmount);
        if (isNaN(amt) || amt <= 0) {
            alert("Please enter a valid positive amount");
            return;
        }

        setGeneratingInvoice(true);
        try {
            const vat = parseFloat((amt * 0.05).toFixed(2)); // 5% VAT
            const total = parseFloat((amt + vat).toFixed(2));

            await addDoc(collection(db, "invoices"), {
                leadId: id,
                leadName: lead?.name || "Unknown Client",
                description: invoiceDesc,
                amount: amt,
                vat,
                total,
                status: "Pending",
                createdAt: new Date().toISOString(),
            });

            // Add note about invoice generation
            const leadRef = doc(db, "leads", id);
            await updateDoc(leadRef, {
                notes: arrayUnion({ text: `Generated invoice: ${invoiceDesc} for AED ${total} (incl. 5% VAT)` }),
            });

            // Reload lead state notes
            setLead((prev) => {
                if (!prev) return prev;
                return {
                    ...prev,
                    notes: [...(prev.notes || []), { text: `Generated invoice: ${invoiceDesc} for AED ${total} (incl. 5% VAT)` }],
                };
            });

            setInvoiceDesc("");
            setInvoiceAmount("");
            alert("Invoice Generated Successfully!");
        } catch (error) {
            console.error("Error generating invoice:", error);
            alert("Failed to generate invoice");
        } finally {
            setGeneratingInvoice(false);
        }
    };

    const handleMarkAsPaid = async (invoiceId: string, invoiceTotal: number, description: string) => {
        try {
            const invoiceRef = doc(db, "invoices", invoiceId);
            await updateDoc(invoiceRef, {
                status: "Paid",
                paidAt: new Date().toISOString(),
            });

            // Update lead revenue
            const leadRef = doc(db, "leads", id);
            const newRevenue = (lead?.revenue || 0) + invoiceTotal;
            await updateDoc(leadRef, {
                revenue: newRevenue,
                status: "Closed", // Mark lead status as Closed
                notes: arrayUnion({ text: `Payment received: AED ${invoiceTotal} for invoice (${description})` }),
            });

            // Update local lead state
            setLead((prev) => {
                if (!prev) return prev;
                return {
                    ...prev,
                    revenue: newRevenue,
                    status: "Closed",
                    notes: [...(prev.notes || []), { text: `Payment received: AED ${invoiceTotal} for invoice (${description})` }],
                };
            });

            // Trigger WhatsApp and Email notification
            if (lead?.email) {
                await AutomationService.sendEmail({
                    to: lead.email,
                    subject: "Payment Received Confirmation - ESHAARE TOUR",
                    html: `
                        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                            <h2 style="color: #e68932; text-align: center;">Payment Received Confirmation</h2>
                            <p>Dear <strong>${lead.name}</strong>,</p>
                            <p>We have successfully received your payment of <strong>AED ${invoiceTotal}</strong> for: <em>${description}</em>.</p>
                            <p>Thank you for choosing ESHAARE TOUR. Your application is now in progress.</p>
                            <br />
                            <p style="font-size: 12px; color: #666; text-align: center;">ESHAARE TOUR & EVENTS - Dubai, UAE</p>
                        </div>
                    `
                });
            }

            const notifyPhone = lead?.whatsapp || lead?.phone;
            if (notifyPhone) {
                await AutomationService.sendWhatsAppNotification(
                    notifyPhone,
                    `Hi ${lead?.name}, we have received your payment of AED ${invoiceTotal} for "${description}". Thank you for choosing ESHAARE TOUR!`
                );
            }

            alert("Invoice payment logged and lead status set to Closed/Revenue updated!");
        } catch (error) {
            console.error("Error marking invoice as paid:", error);
            alert("Failed to update invoice payment status");
        }
    };

    useEffect(() => {
        const fetchLead = async () => {
            try {
                const docRef = doc(db, "leads", id);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data() as any;
                    const parsedLead: Lead = {
                        ...data,
                        visaType: data.visaType || data.serviceType || "",
                        travelDate: data.travelDate || data.appointmentDate || "",
                        revenue: Number(data.revenue) || 0,
                        supplier: data.supplier || "",
                    };
                    setLead(parsedLead);
                    setFormData(parsedLead);
                }
            } catch (error) {
                console.log(error);
            }
        };

        fetchLead();
    }, [id]);

    const addNote = async () => {
        if (!note.trim()) return;
        try {
            const leadRef = doc(db, "leads", id);
            await updateDoc(leadRef, {
                notes: arrayUnion({ text: note }),
            });

            setLead((prev) => {
                if (!prev) return prev;
                return {
                    ...prev,
                    notes: [...(prev.notes || []), { text: note }],
                };
            });
            setNote("");
        } catch (error) {
            console.error("ADD NOTE ERROR:", error);
        }
    };

    const handleSaveDetails = async () => {
        setIsSaving(true);
        try {
            const leadRef = doc(db, "leads", id);
            await updateDoc(leadRef, formData);
            setLead((prev) => ({ ...prev, ...formData } as Lead));
            setEditMode(false);
        } catch (error) {
            console.error("SAVE DETAILS ERROR:", error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    if (!lead) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#071120] text-white">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#e68932] border-t-transparent"></div>
                    <p className="text-sm font-medium text-gray-400">Loading Lead details...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 font-sans pb-12 text-white">
            <div className="mx-auto max-w-5xl">
                {/* BACK BUTTON */}
                <Link
                    href="/admin/leads"
                    className="inline-flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-white/10"
                >
                    <ArrowLeft size={16} />
                    Back to Leads
                </Link>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-6">
                    <div>
                        <p className="text-xs uppercase tracking-[4px] text-[#00C2FF] font-bold">Lead Details</p>
                        <h1 className="mt-2 text-3xl font-bold text-white">{lead.name}</h1>
                    </div>
                    <div>
                        {editMode ? (
                            <button
                                onClick={handleSaveDetails}
                                disabled={isSaving}
                                className="inline-flex items-center gap-2 rounded-xl bg-[#e68932] hover:opacity-90 px-5 py-2.5 text-xs font-semibold text-white transition disabled:opacity-50"
                            >
                                <Save size={16} />
                                {isSaving ? "Saving..." : "Save Details"}
                            </button>
                        ) : (
                            <button
                                onClick={() => setEditMode(true)}
                                className="rounded-xl bg-white/5 border border-white/10 px-5 py-2.5 text-xs font-semibold text-white hover:bg-white/10 transition"
                            >
                                Edit Details
                            </button>
                        )}
                    </div>
                </div>

                <div className="grid gap-8 md:grid-cols-2 mt-8">
                    {/* CLIENT DETAILS */}
                    <div className="rounded-3xl bg-white/5 border border-white/10 p-6 md:p-8 space-y-6">
                        <h2 className="text-xl font-bold text-white border-b border-white/15 pb-3">Client Details</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs text-gray-400 font-bold uppercase tracking-wider">Lead ID</label>
                                <p className="font-mono text-sm text-gray-300 mt-1">{id}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-gray-400 font-bold uppercase tracking-wider">Full Name</label>
                                    {editMode ? (
                                        <input type="text" name="name" value={formData.name || ""} onChange={handleChange} className="mt-1 h-10 w-full rounded-lg border-none bg-white/5 px-3 text-xs text-white outline-none focus:bg-white/10" />
                                    ) : (
                                        <p className="font-medium text-gray-200 mt-1">{lead.name || "N/A"}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="text-xs text-gray-400 font-bold uppercase tracking-wider">Source</label>
                                    {editMode ? (
                                        <input type="text" name="source" value={formData.source || ""} onChange={handleChange} className="mt-1 h-10 w-full rounded-lg border-none bg-white/5 px-3 text-xs text-white outline-none focus:bg-white/10" />
                                    ) : (
                                        <p className="font-medium text-gray-200 mt-1 capitalize">{lead.source || "N/A"}</p>
                                    )}
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-gray-400 font-bold uppercase tracking-wider">Phone Number</label>
                                    {editMode ? (
                                        <input type="text" name="phone" value={formData.phone || ""} onChange={handleChange} className="mt-1 h-10 w-full rounded-lg border-none bg-white/5 px-3 text-xs text-white outline-none focus:bg-white/10" />
                                    ) : (
                                        <p className="font-medium text-gray-200 mt-1">{lead.phone || "N/A"}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="text-xs text-gray-400 font-bold uppercase tracking-wider">WhatsApp</label>
                                    {editMode ? (
                                        <input type="text" name="whatsapp" value={formData.whatsapp || ""} onChange={handleChange} className="mt-1 h-10 w-full rounded-lg border-none bg-white/5 px-3 text-xs text-white outline-none focus:bg-white/10" />
                                    ) : (
                                        <div className="flex items-center gap-2 mt-1">
                                            <p className="font-medium text-gray-200">{lead.whatsapp || "N/A"}</p>
                                            {lead.whatsapp && (
                                                <a
                                                    href={`https://wa.me/${lead.whatsapp.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(`Hi ${lead.name}, this is ESHAAR TOUR. We are checking your inquiry.`)}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1 rounded bg-[#25D366] hover:bg-[#20ba59] px-2 py-0.5 text-[10px] font-bold text-white transition duration-200"
                                                >
                                                    Chat
                                                </a>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div>
                                <label className="text-xs text-gray-400 font-bold uppercase tracking-wider">Email</label>
                                {editMode ? (
                                    <input type="email" name="email" value={formData.email || ""} onChange={handleChange} className="mt-1 h-10 w-full rounded-lg border-none bg-white/5 px-3 text-xs text-white outline-none focus:bg-white/10" />
                                ) : (
                                    <p className="font-medium text-gray-200 mt-1">{lead.email || "N/A"}</p>
                                )}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-gray-400 font-bold uppercase tracking-wider">Nationality</label>
                                    {editMode ? (
                                        <input type="text" name="nationality" value={formData.nationality || ""} onChange={handleChange} className="mt-1 h-10 w-full rounded-lg border-none bg-white/5 px-3 text-xs text-white outline-none focus:bg-white/10" />
                                    ) : (
                                        <p className="font-medium text-gray-200 mt-1">{lead.nationality || "N/A"}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="text-xs text-gray-400 font-bold uppercase tracking-wider">Current Country</label>
                                    {editMode ? (
                                        <input type="text" name="currentCountry" value={formData.currentCountry || ""} onChange={handleChange} className="mt-1 h-10 w-full rounded-lg border-none bg-white/5 px-3 text-xs text-white outline-none focus:bg-white/10" />
                                    ) : (
                                        <p className="font-medium text-gray-200 mt-1">{lead.currentCountry || "N/A"}</p>
                                    )}
                                </div>
                            </div>
                            <div>
                                <label className="text-xs text-gray-400 font-bold uppercase tracking-wider">Passport Number</label>
                                {editMode ? (
                                    <input type="text" name="passport" value={formData.passport || ""} onChange={handleChange} className="mt-1 h-10 w-full rounded-lg border-none bg-white/5 px-3 text-xs text-white outline-none focus:bg-white/10" />
                                ) : (
                                    <p className="font-medium text-gray-200 mt-1 font-mono">{lead.passport || "N/A"}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* INQUIRY DETAILS */}
                    <div className="rounded-3xl bg-white/5 border border-white/10 p-6 md:p-8 space-y-6">
                        <h2 className="text-xl font-bold text-white border-b border-white/15 pb-3">Inquiry Details</h2>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-gray-400 font-bold uppercase tracking-wider">Status</label>
                                    {editMode ? (
                                        <select name="status" value={formData.status || "New"} onChange={handleChange} className="mt-1 h-10 w-full rounded-lg border-none bg-white/5 px-2 text-xs text-white outline-none focus:bg-white/10">
                                            <option value="New" className="bg-[#071120]">New</option>
                                            <option value="Interested" className="bg-[#071120]">Interested</option>
                                            <option value="Follow-up" className="bg-[#071120]">Follow-up</option>
                                            <option value="Documents Pending" className="bg-[#071120]">Documents Pending</option>
                                            <option value="Payment Pending" className="bg-[#071120]">Payment Pending</option>
                                            <option value="Appointment Scheduled" className="bg-[#071120]">Appointment Scheduled</option>
                                            <option value="Submitted" className="bg-[#071120]">Submitted</option>
                                            <option value="Approved" className="bg-[#071120]">Approved</option>
                                            <option value="Rejected" className="bg-[#071120]">Rejected</option>
                                            <option value="Closed" className="bg-[#071120]">Closed</option>
                                        </select>
                                    ) : (
                                        <p className="font-medium text-[#00C2FF] mt-1">{lead.status || "New"}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="text-xs text-gray-400 font-bold uppercase tracking-wider">Assigned To</label>
                                    {editMode ? (
                                        <input type="text" name="assignedTo" value={formData.assignedTo || ""} onChange={handleChange} className="mt-1 h-10 w-full rounded-lg border-none bg-white/5 px-3 text-xs text-white outline-none focus:bg-white/10" />
                                    ) : (
                                        <p className="font-medium text-gray-200 mt-1">{lead.assignedTo || "Unassigned"}</p>
                                    )}
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-gray-400 font-bold uppercase tracking-wider">Visa Type</label>
                                    {editMode ? (
                                        <input type="text" name="visaType" value={formData.visaType || ""} onChange={handleChange} className="mt-1 h-10 w-full rounded-lg border-none bg-white/5 px-3 text-xs text-white outline-none focus:bg-white/10" />
                                    ) : (
                                        <p className="font-medium text-gray-200 mt-1">{lead.visaType || "N/A"}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="text-xs text-gray-400 font-bold uppercase tracking-wider">Destination</label>
                                    {editMode ? (
                                        <input type="text" name="destination" value={formData.destination || ""} onChange={handleChange} className="mt-1 h-10 w-full rounded-lg border-none bg-white/5 px-3 text-xs text-white outline-none focus:bg-white/10" />
                                    ) : (
                                        <p className="font-medium text-gray-200 mt-1">{lead.destination || "N/A"}</p>
                                    )}
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-gray-400 font-bold uppercase tracking-wider">Travel Date</label>
                                    {editMode ? (
                                        <input type="date" name="travelDate" value={formData.travelDate || ""} onChange={handleChange} className="mt-1 h-10 w-full rounded-lg border-none bg-[#071120] border border-white/10 px-3 text-xs text-white outline-none" />
                                    ) : (
                                        <p className="font-medium text-gray-200 mt-1">{lead.travelDate || "N/A"}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="text-xs text-gray-400 font-bold uppercase tracking-wider">Travelers</label>
                                    {editMode ? (
                                        <input type="number" name="travelers" value={formData.travelers || ""} onChange={handleChange} className="mt-1 h-10 w-full rounded-lg border-none bg-white/5 px-3 text-xs text-white outline-none focus:bg-white/10" />
                                    ) : (
                                        <p className="font-medium text-gray-200 mt-1">{lead.travelers || "N/A"}</p>
                                    )}
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-gray-400 font-bold uppercase tracking-wider">Budget</label>
                                    {editMode ? (
                                        <input type="text" name="budget" value={formData.budget || ""} onChange={handleChange} className="mt-1 h-10 w-full rounded-lg border-none bg-white/5 px-3 text-xs text-white outline-none focus:bg-white/10" />
                                    ) : (
                                        <p className="font-medium text-gray-200 mt-1">{lead.budget || "N/A"}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="text-xs text-gray-400 font-bold uppercase tracking-wider">Supplier</label>
                                    {editMode ? (
                                        <input type="text" name="supplier" value={formData.supplier || ""} onChange={handleChange} className="mt-1 h-10 w-full rounded-lg border-none bg-white/5 px-3 text-xs text-white outline-none focus:bg-white/10" />
                                    ) : (
                                        <p className="font-medium text-gray-200 mt-1">{lead.supplier || "N/A"}</p>
                                    )}
                                </div>
                            </div>
                            <div>
                                <label className="text-xs text-gray-400 font-bold uppercase tracking-wider">Travel History</label>
                                {editMode ? (
                                    <textarea name="travelHistory" value={formData.travelHistory || ""} onChange={handleChange} className="mt-1 w-full rounded-lg border-none bg-white/5 p-3 text-xs text-white outline-none focus:bg-white/10" rows={2}></textarea>
                                ) : (
                                    <p className="font-medium text-gray-300 mt-1 leading-5">{lead.travelHistory || "N/A"}</p>
                                )}
                            </div>
                            <div>
                                <label className="text-xs text-gray-400 font-bold uppercase tracking-wider">Rejection History</label>
                                {editMode ? (
                                    <textarea name="rejectionHistory" value={formData.rejectionHistory || ""} onChange={handleChange} className="mt-1 w-full rounded-lg border-none bg-white/5 p-3 text-xs text-white outline-none focus:bg-white/10" rows={2}></textarea>
                                ) : (
                                    <p className="font-medium text-gray-300 mt-1 leading-5">{lead.rejectionHistory || "None"}</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* MESSAGE */}
                {lead.message && (
                    <div className="mt-8 rounded-3xl bg-white/5 border border-white/10 p-6 md:p-8 space-y-4">
                        <h2 className="text-xl font-bold text-white border-b border-white/15 pb-3">Customer Message</h2>
                        <p className="leading-7 text-gray-300">{lead.message}</p>
                    </div>
                )}

                {/* DOCUMENTS SECTION */}
                <div className="mt-8 rounded-3xl bg-white/5 border border-white/10 p-6 md:p-8 space-y-6">
                    <div className="flex items-center justify-between border-b border-white/15 pb-3">
                        <h2 className="text-xl font-bold text-white">Client Documents</h2>
                        <button
                            onClick={() => setShowUploader(!showUploader)}
                            className="rounded-xl bg-white/5 border border-white/10 px-4 py-2 text-xs font-semibold text-white hover:bg-white/10 transition"
                        >
                            {showUploader ? "Hide Uploader" : "Upload Document"}
                        </button>
                    </div>

                    {showUploader && (
                        <div className="mb-6 bg-black/10 border border-white/5 p-6 rounded-2xl">
                            <DocumentUploader
                                entityId={id}
                                entityType="leads"
                                onUploadComplete={() => setShowUploader(false)}
                            />
                        </div>
                    )}

                    <div className="bg-[#071120] rounded-2xl p-6 border border-white/5">
                        <DocumentList entityId={id} entityType="leads" />
                    </div>
                </div>

                {/* PAYMENTS & INVOICING SECTION */}
                <div className="mt-8 rounded-3xl bg-white/5 border border-white/10 p-6 md:p-8 space-y-6">
                    <h2 className="text-xl font-bold text-white border-b border-white/15 pb-3">Payments & Invoicing</h2>
                    
                    <div className="grid gap-6 md:grid-cols-3">
                        {/* New Invoice Form */}
                        <div className="md:col-span-1 rounded-2xl border border-white/5 bg-black/20 p-5 space-y-4">
                            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Generate Invoice</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Description</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Schengen Visa Consultation"
                                        value={invoiceDesc}
                                        onChange={(e) => setInvoiceDesc(e.target.value)}
                                        className="mt-1 h-10 w-full rounded-lg border-none bg-white/5 px-3 text-xs text-white outline-none focus:bg-white/10"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Amount (AED)</label>
                                    <input
                                        type="number"
                                        placeholder="0.00"
                                        value={invoiceAmount}
                                        onChange={(e) => setInvoiceAmount(e.target.value)}
                                        className="mt-1 h-10 w-full rounded-lg border-none bg-white/5 px-3 text-xs text-white outline-none focus:bg-white/10"
                                    />
                                </div>
                                <button
                                    onClick={handleGenerateInvoice}
                                    disabled={generatingInvoice}
                                    className="w-full h-10 rounded-lg bg-[#e68932] text-white hover:opacity-90 font-semibold text-xs transition disabled:opacity-50"
                                >
                                    {generatingInvoice ? "Generating..." : "Generate Invoice"}
                                </button>
                            </div>
                        </div>

                        {/* Invoices List */}
                        <div className="md:col-span-2 rounded-2xl border border-white/5 bg-black/20 p-5">
                            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Invoice History</h3>
                            {invoices.length === 0 ? (
                                <p className="text-xs text-gray-500 py-6 text-center">No invoices generated yet.</p>
                            ) : (
                                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                                    {invoices.map((inv) => (
                                        <div key={inv.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between rounded-xl bg-white/5 border border-white/5 p-4 shadow-sm gap-4">
                                            <div>
                                                <div className="font-semibold text-white text-sm">{inv.description}</div>
                                                <div className="text-xs text-gray-400 mt-1">
                                                    AED {inv.amount} + 5% VAT (AED {inv.vat})
                                                </div>
                                                <div className="text-[10px] text-gray-500 mt-0.5">
                                                    Created: {new Date(inv.createdAt).toLocaleDateString()}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className={`text-[10px] px-2.5 py-0.5 font-bold uppercase tracking-wider rounded border ${inv.status === 'Paid' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'}`}>
                                                    {inv.status}
                                                </span>
                                                <span className="font-bold text-[#e68932] text-sm">
                                                    AED {inv.total}
                                                </span>
                                                {inv.status === 'Pending' && (
                                                    <div className="flex gap-1">
                                                        <button
                                                            onClick={() => handleMarkAsPaid(inv.id, inv.total, inv.description)}
                                                            className="rounded bg-green-500 hover:bg-green-600 px-2.5 py-1 text-[10px] font-bold text-white transition"
                                                        >
                                                            Mark Paid
                                                        </button>
                                                        {/* Simulated Razorpay Payment Link */}
                                                        <button
                                                            onClick={() => {
                                                                alert(`Simulated Razorpay Link:\nhttps://checkout.razorpay.com/mock_pay?id=${inv.id}&amount=${inv.total * 100}`);
                                                                handleMarkAsPaid(inv.id, inv.total, inv.description);
                                                            }}
                                                            className="rounded bg-blue-500 hover:bg-blue-600 px-2.5 py-1 text-[10px] font-bold text-white transition"
                                                        >
                                                            Link (Sim)
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* NOTES SECTION */}
                <div className="mt-8 rounded-3xl bg-white/5 border border-white/10 p-6 md:p-8 space-y-6">
                    <h2 className="text-xl font-bold text-white border-b border-white/15 pb-3">Internal Notes</h2>
                    <div className="flex flex-col gap-4 md:flex-row">
                        <input
                            type="text"
                            placeholder="Add internal note..."
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            className="h-11 flex-1 rounded-xl border-none bg-white/5 px-4 text-xs text-white outline-none focus:bg-white/10"
                            onKeyDown={(e) => e.key === 'Enter' && addNote()}
                        />
                        <button
                            onClick={addNote}
                            className="h-11 rounded-xl bg-[#e68932] px-5 font-semibold text-xs text-white transition hover:opacity-90"
                        >
                            Add Note
                        </button>
                    </div>

                    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
                        {lead.notes?.length ? (
                            [...lead.notes].reverse().map((item, index) => (
                                <div key={index} className="rounded-xl border border-white/5 bg-black/20 p-4">
                                    <p className="text-xs text-gray-300 leading-5">{item.text}</p>
                                </div>
                            ))
                        ) : (
                            <p className="text-xs text-gray-500 text-center py-4">No internal notes added yet.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}