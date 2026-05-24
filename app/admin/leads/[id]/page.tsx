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
            <div className="flex min-h-screen items-center justify-center bg-[#f4f7fb]">
                <h1 className="text-2xl font-semibold text-gray-500">
                    Loading Lead...
                </h1>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f4f7fb] p-6 md:p-10">
            <div className="mx-auto mt-16 max-w-5xl">
                {/* BACK BUTTON */}
                <Link
                    href="/admin/leads"
                    className="mb-6 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-black shadow-sm transition hover:scale-[1.02]"
                >
                    <ArrowLeft size={18} />
                    Back to Leads
                </Link>

                <div className="flex items-center justify-between mb-6">
                    <div>
                        <p className="text-sm uppercase tracking-[4px] text-[#00C2FF]">Lead Details</p>
                        <h1 className="mt-3 text-4xl font-bold text-black">{lead.name}</h1>
                    </div>
                    <div>
                        {editMode ? (
                            <button
                                onClick={handleSaveDetails}
                                disabled={isSaving}
                                className="inline-flex items-center gap-2 rounded-xl bg-[#00C2FF] px-6 py-3 font-semibold text-black transition hover:scale-[1.02] disabled:opacity-50"
                            >
                                <Save size={18} />
                                {isSaving ? "Saving..." : "Save Details"}
                            </button>
                        ) : (
                            <button
                                onClick={() => setEditMode(true)}
                                className="rounded-xl bg-black px-6 py-3 font-semibold text-white transition hover:scale-[1.02]"
                            >
                                Edit Details
                            </button>
                        )}
                    </div>
                </div>

                <div className="grid gap-8 md:grid-cols-2">
                    {/* CLIENT DETAILS */}
                    <div className="rounded-[30px] bg-white p-8 shadow-sm">
                        <h2 className="mb-6 text-2xl font-bold text-black">Client Details</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm text-gray-500">Lead ID</label>
                                <p className="font-medium text-gray-500">{id}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm text-gray-500">Full Name</label>
                                    {editMode ? (
                                        <input type="text" name="name" value={formData.name || ""} onChange={handleChange} className="w-full rounded-lg border p-2" />
                                    ) : (
                                        <p className="font-medium text-gray-500">{lead.name || "N/A"}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="text-sm text-gray-500">Source</label>
                                    {editMode ? (
                                        <input type="text" name="source" value={formData.source || ""} onChange={handleChange} className="w-full rounded-lg border p-2" />
                                    ) : (
                                        <p className="font-medium text-gray-500 capitalize ">{lead.source || "N/A"}</p>
                                    )}
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm text-gray-500">Phone Number</label>
                                    {editMode ? (
                                        <input type="text" name="phone" value={formData.phone || ""} onChange={handleChange} className="w-full rounded-lg border p-2" />
                                    ) : (
                                        <p className="font-medium text-gray-500">{lead.phone || "N/A"}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="text-sm text-gray-500">WhatsApp</label>
                                    {editMode ? (
                                        <input type="text" name="whatsapp" value={formData.whatsapp || ""} onChange={handleChange} className="w-full rounded-lg border p-2" />
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <p className="font-medium text-gray-500">{lead.whatsapp || "N/A"}</p>
                                            {lead.whatsapp && (
                                                <a
                                                    href={`https://wa.me/${lead.whatsapp.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(`Hi ${lead.name}, this is ESHAAR TOUR. We are checking your inquiry.`)}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1 rounded bg-green-500 hover:bg-green-600 px-2 py-0.5 text-xs font-bold text-white transition duration-200"
                                                >
                                                    Chat
                                                </a>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div>
                                <label className="text-sm text-gray-500">Email</label>
                                {editMode ? (
                                    <input type="email" name="email" value={formData.email || ""} onChange={handleChange} className="w-full rounded-lg border p-2" />
                                ) : (
                                    <p className="font-medium text-gray-500">{lead.email || "N/A"}</p>
                                )}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm text-gray-500">Nationality</label>
                                    {editMode ? (
                                        <input type="text" name="nationality" value={formData.nationality || ""} onChange={handleChange} className="w-full rounded-lg border p-2" />
                                    ) : (
                                        <p className="font-medium text-gray-500">{lead.nationality || "N/A"}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="text-sm text-gray-500">Current Country</label>
                                    {editMode ? (
                                        <input type="text" name="currentCountry" value={formData.currentCountry || ""} onChange={handleChange} className="w-full rounded-lg border p-2" />
                                    ) : (
                                        <p className="font-medium text-gray-500 ">{lead.currentCountry || "N/A"}</p>
                                    )}
                                </div>
                            </div>
                            <div>
                                <label className="text-sm text-gray-500">Passport Number</label>
                                {editMode ? (
                                    <input type="text" name="passport" value={formData.passport || ""} onChange={handleChange} className="w-full rounded-lg border p-2" />
                                ) : (
                                    <p className="font-medium text-gray-500">{lead.passport || "N/A"}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* INQUIRY DETAILS */}
                    <div className="rounded-[30px] bg-white p-8 shadow-sm">
                        <h2 className="mb-6 text-2xl font-bold text-black">Inquiry Details</h2>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm text-gray-500">Status</label>
                                    {editMode ? (
                                        <select name="status" value={formData.status || "New"} onChange={handleChange} className="w-full rounded-lg border p-2">
                                            <option value="New">New</option>
                                            <option value="Interested">Interested</option>
                                            <option value="Follow-up">Follow-up</option>
                                            <option value="Documents Pending">Documents Pending</option>
                                            <option value="Payment Pending">Payment Pending</option>
                                            <option value="Appointment Scheduled">Appointment Scheduled</option>
                                            <option value="Submitted">Submitted</option>
                                            <option value="Approved">Approved</option>
                                            <option value="Rejected">Rejected</option>
                                            <option value="Closed">Closed</option>
                                        </select>
                                    ) : (
                                        <p className="font-medium text-[#00C2FF]">{lead.status || "New"}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="text-sm text-gray-500">Assigned To</label>
                                    {editMode ? (
                                        <input type="text" name="assignedTo" value={formData.assignedTo || ""} onChange={handleChange} className="w-full rounded-lg border p-2" />
                                    ) : (
                                        <p className="font-medium text-gray-500">{lead.assignedTo || "Unassigned"}</p>
                                    )}
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm text-gray-500">Visa Type</label>
                                    {editMode ? (
                                        <input type="text" name="visaType" value={formData.visaType || ""} onChange={handleChange} className="w-full rounded-lg border p-2" />
                                    ) : (
                                        <p className="font-medium text-gray-500">{lead.visaType || "N/A"}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="text-sm text-gray-500">Destination</label>
                                    {editMode ? (
                                        <input type="text" name="destination" value={formData.destination || ""} onChange={handleChange} className="w-full rounded-lg border p-2" />
                                    ) : (
                                        <p className="font-medium text-gray-500">{lead.destination || "N/A"}</p>
                                    )}
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm text-gray-500">Travel Date</label>
                                    {editMode ? (
                                        <input type="date" name="travelDate" value={formData.travelDate || ""} onChange={handleChange} className="w-full rounded-lg border p-2" />
                                    ) : (
                                        <p className="font-medium text-gray-500">{lead.travelDate || "N/A"}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="text-sm text-gray-500">Travelers</label>
                                    {editMode ? (
                                        <input type="number" name="travelers" value={formData.travelers || ""} onChange={handleChange} className="w-full rounded-lg border p-2" />
                                    ) : (
                                        <p className="font-medium text-gray-500">{lead.travelers || "N/A"}</p>
                                    )}
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm text-gray-500">Budget</label>
                                    {editMode ? (
                                        <input type="text" name="budget" value={formData.budget || ""} onChange={handleChange} className="w-full rounded-lg border p-2" />
                                    ) : (
                                        <p className="font-medium text-gray-500">{lead.budget || "N/A"}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="text-sm text-gray-500">Supplier</label>
                                    {editMode ? (
                                        <input type="text" name="supplier" value={formData.supplier || ""} onChange={handleChange} className="w-full rounded-lg border p-2" />
                                    ) : (
                                        <p className="font-medium text-gray-500">{lead.supplier || "N/A"}</p>
                                    )}
                                </div>
                            </div>
                            <div>
                                <label className="text-sm text-gray-500">Travel History</label>
                                {editMode ? (
                                    <textarea name="travelHistory" value={formData.travelHistory || ""} onChange={handleChange} className="w-full rounded-lg border p-2" rows={2}></textarea>
                                ) : (
                                    <p className="font-medium text-gray-500">{lead.travelHistory || "N/A"}</p>
                                )}
                            </div>
                            <div>
                                <label className="text-sm text-gray-500">Rejection History</label>
                                {editMode ? (
                                    <textarea name="rejectionHistory" value={formData.rejectionHistory || ""} onChange={handleChange} className="w-full rounded-lg border p-2" rows={2}></textarea>
                                ) : (
                                    <p className="font-medium text-gray-500">{lead.rejectionHistory || "None"}</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* MESSAGE */}
                {lead.message && (
                    <div className="mt-8 rounded-[30px] bg-white p-8 shadow-sm">
                        <h2 className="text-2xl font-bold text-black">Customer Message</h2>
                        <p className="mt-5 leading-8 text-gray-600">{lead.message}</p>
                    </div>
                )}

                {/* DOCUMENTS SECTION */}
                <div className="mt-8 rounded-[30px] bg-white p-8 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-black font-sans">Client Documents</h2>
                        <button
                            onClick={() => setShowUploader(!showUploader)}
                            className="rounded-xl bg-black px-4 py-2.5 text-xs font-semibold text-white hover:bg-black/80 transition"
                        >
                            {showUploader ? "Hide Uploader" : "Upload Document"}
                        </button>
                    </div>

                    {showUploader && (
                        <div className="mb-6">
                            <DocumentUploader
                                entityId={id}
                                entityType="leads"
                                onUploadComplete={() => setShowUploader(false)}
                            />
                        </div>
                    )}

                    <div className="bg-[#071120] rounded-[24px] p-6 border border-white/5">
                        <DocumentList entityId={id} entityType="leads" />
                    </div>
                </div>

                {/* PAYMENTS & INVOICING SECTION */}
                <div className="mt-8 rounded-[30px] bg-white p-8 shadow-sm">
                    <h2 className="text-2xl font-bold text-black mb-6">Payments & Invoicing</h2>
                    
                    <div className="grid gap-6 md:grid-cols-3">
                        {/* New Invoice Form */}
                        <div className="md:col-span-1 rounded-2xl border border-gray-100 bg-gray-50 p-6">
                            <h3 className="text-lg font-semibold text-black mb-4">Generate Invoice</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs text-gray-500 font-medium">Description</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Schengen Visa Consultation"
                                        value={invoiceDesc}
                                        onChange={(e) => setInvoiceDesc(e.target.value)}
                                        className="mt-1 h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm text-black outline-none focus:border-[#00C2FF]"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500 font-medium">Amount (AED)</label>
                                    <input
                                        type="number"
                                        placeholder="0.00"
                                        value={invoiceAmount}
                                        onChange={(e) => setInvoiceAmount(e.target.value)}
                                        className="mt-1 h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm text-black outline-none focus:border-[#00C2FF]"
                                    />
                                </div>
                                <button
                                    onClick={handleGenerateInvoice}
                                    disabled={generatingInvoice}
                                    className="w-full h-11 rounded-xl bg-black text-white hover:bg-black/80 font-semibold text-sm transition disabled:opacity-50"
                                >
                                    {generatingInvoice ? "Generating..." : "Generate Invoice"}
                                </button>
                            </div>
                        </div>

                        {/* Invoices List */}
                        <div className="md:col-span-2 rounded-2xl border border-gray-100 bg-gray-50 p-6">
                            <h3 className="text-lg font-semibold text-black mb-4">Invoice History</h3>
                            {invoices.length === 0 ? (
                                <p className="text-sm text-gray-500">No invoices generated yet.</p>
                            ) : (
                                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                                    {invoices.map((inv) => (
                                        <div key={inv.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between rounded-xl bg-white border border-gray-100 p-4 shadow-sm gap-4">
                                            <div>
                                                <div className="font-semibold text-black">{inv.description}</div>
                                                <div className="text-xs text-gray-400 mt-1">
                                                    AED {inv.amount} + 5% VAT (AED {inv.vat})
                                                </div>
                                                <div className="text-xs text-gray-500 mt-0.5">
                                                    Created: {new Date(inv.createdAt).toLocaleDateString()}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className={`text-xs px-3 py-1 font-semibold rounded-full ${inv.status === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                    {inv.status}
                                                </span>
                                                <span className="font-bold text-black text-sm">
                                                    AED {inv.total}
                                                </span>
                                                {inv.status === 'Pending' && (
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => handleMarkAsPaid(inv.id, inv.total, inv.description)}
                                                            className="rounded-lg bg-green-500 hover:bg-green-600 px-3 py-1 text-xs font-semibold text-white transition"
                                                        >
                                                            Mark Paid
                                                        </button>
                                                        {/* Simulated Razorpay Payment Link */}
                                                        <button
                                                            onClick={() => {
                                                                alert(`Simulated Razorpay Link:\nhttps://checkout.razorpay.com/mock_pay?id=${inv.id}&amount=${inv.total * 100}`);
                                                                handleMarkAsPaid(inv.id, inv.total, inv.description);
                                                            }}
                                                            className="rounded-lg bg-blue-500 hover:bg-blue-600 px-3 py-1 text-xs font-semibold text-white transition"
                                                        >
                                                            Pay Link (Sim)
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
                <div className="mt-8 rounded-[30px] bg-white p-8 shadow-sm mb-10">
                    <h2 className="text-2xl font-bold text-black">Internal Notes</h2>
                    <div className="mt-6 flex flex-col gap-4 md:flex-row">
                        <input
                            type="text"
                            placeholder="Add internal note..."
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            className="h-14 flex-1 rounded-2xl border border-gray-200 px-5 text-black outline-none transition focus:border-[#00C2FF]"
                            onKeyDown={(e) => e.key === 'Enter' && addNote()}
                        />
                        <button
                            onClick={addNote}
                            className="h-14 rounded-2xl bg-[#00C2FF] px-6 font-semibold text-black transition hover:scale-[1.02]"
                        >
                            Add Note
                        </button>
                    </div>

                    <div className="mt-8 space-y-4">
                        {lead.notes?.length ? (
                            [...lead.notes].reverse().map((item, index) => (
                                <div key={index} className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
                                    <p className="text-gray-700">{item.text}</p>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500">No notes added yet.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}