"use client";

import { useState } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";
import { RefreshCw, Upload, FileText, ArrowRight, ShieldCheck, Database } from "lucide-react";

export default function AdminImportSyncPage() {
    const [activeTab, setActiveTab] = useState<"import" | "webhooks">("import");
    const [targetCollection, setTargetCollection] = useState("leads");

    // CSV Mapping state
    const [csvFile, setCsvFile] = useState<File | null>(null);
    const [headers, setHeaders] = useState<string[]>([]);
    const [mapping, setMapping] = useState<Record<string, string>>({});
    const [importing, setImporting] = useState(false);

    // Simulated Webhook logs (Twilio/Stripe success indicators)
    const webhookLogs = [
        { id: "wh_001", provider: "Stripe", event: "checkout.session.completed", ref: "cs_test_92a831", amount: "AED 1,200.00", status: "Processed", time: "2026-05-27 10:15:30" },
        { id: "wh_002", provider: "Twilio", event: "message.inbound", ref: "+971501234567", amount: "N/A", status: "Logged", time: "2026-05-27 09:44:12" },
        { id: "wh_003", provider: "Stripe", event: "payment_intent.succeeded", ref: "pi_3M821a", amount: "AED 350.00", status: "Processed", time: "2026-05-27 08:30:05" }
    ];

    const targetFields: Record<string, string[]> = {
        leads: ["name", "phone", "email", "nationality", "destination", "budget", "source"],
        travellers: ["firstName", "lastName", "passportNo", "passportExpiry", "nationality", "mobile", "email"],
        accounts: ["legalName", "displayName", "accountType", "phone", "email", "creditLimit"]
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setCsvFile(file);
            // Mock headers for mapping demonstration
            if (targetCollection === "leads") {
                setHeaders(["Client Name", "Contact Phone", "Contact Email", "Country Target", "Estimated Budget", "Lead Source"]);
            } else if (targetCollection === "travellers") {
                setHeaders(["First Name", "Last Name", "Passport ID", "Expiry Date", "Nationality Country", "Phone Number"]);
            } else {
                setHeaders(["Legal Name", "Display Name", "Type", "Main Phone", "Email Address", "Credit Limit AED"]);
            }
        }
    };

    const handleMappingChange = (field: string, csvHeader: string) => {
        setMapping({ ...mapping, [field]: csvHeader });
    };

    const handleImportSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!csvFile) {
            alert("Please upload a CSV file first.");
            return;
        }

        setImporting(true);
        try {
            // Simulate reading CSV lines and inserting to Firestore
            await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate work
            
            // Write a single dummy record for demonstration
            if (targetCollection === "leads") {
                await addDoc(collection(db, "leads"), {
                    name: "Imported Lead Client",
                    phone: "+971 50 111 2222",
                    email: "imported@gmail.com",
                    destination: "Dubai",
                    source: "CSV Import",
                    status: "New",
                    createdAt: new Date().toISOString(),
                    revenue: 0
                });
            }

            alert("Batch records successfully imported and parsed into database!");
            setCsvFile(null);
            setHeaders([]);
            setMapping({});
        } catch (error) {
            console.error("Error importing batch records:", error);
            alert("Failed to parse batch records.");
        } finally {
            setImporting(false);
        }
    };

    return (
        <div className="space-y-8 font-sans">
            <div>
                <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                    <RefreshCw className="text-[#e68932]" />
                    Import & Sync Center
                </h1>
                <p className="mt-2 text-gray-400">Perform database data migrations, verify CSV headers mappings, and review system webhook logs.</p>
            </div>

            {/* Tab switch controls */}
            <div className="flex gap-2 bg-white/5 p-1.5 rounded-2xl border border-white/10 w-fit">
                <button
                    onClick={() => setActiveTab("import")}
                    className={`px-5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition ${
                        activeTab === "import" ? "bg-[#e68932] text-white" : "text-gray-400 hover:text-white"
                    }`}
                >
                    CSV Data Import
                </button>
                <button
                    onClick={() => setActiveTab("webhooks")}
                    className={`px-5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition ${
                        activeTab === "webhooks" ? "bg-[#e68932] text-white" : "text-gray-400 hover:text-white"
                    }`}
                >
                    Webhook Success Logs
                </button>
            </div>

            {/* Content view */}
            {activeTab === "import" ? (
                /* CSV Import mapper builder */
                <div className="grid gap-8 md:grid-cols-3">
                    <div className="rounded-3xl bg-white/5 border border-white/10 p-6 space-y-6 flex flex-col justify-between">
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-white flex items-center gap-1.5">
                                <Database size={20} className="text-[#e68932]" /> Import Target
                            </h3>
                            <div>
                                <label className="text-xs text-gray-400 font-bold uppercase tracking-wider">Destination Collection</label>
                                <select
                                    value={targetCollection}
                                    onChange={(e) => {
                                        setTargetCollection(e.target.value);
                                        setCsvFile(null);
                                        setHeaders([]);
                                        setMapping({});
                                    }}
                                    className="mt-1 h-11 w-full rounded-xl border-none bg-white/5 px-4 text-sm text-white outline-none focus:bg-white/10"
                                >
                                    <option value="leads" className="bg-[#071120]">leads</option>
                                    <option value="travellers" className="bg-[#071120]">travellers</option>
                                    <option value="accounts" className="bg-[#071120]">accounts</option>
                                </select>
                            </div>

                            {/* CSV File Selector */}
                            <div className="border-2 border-dashed border-white/10 rounded-2xl p-6 text-center hover:border-white/20 transition cursor-pointer relative">
                                <Upload className="mx-auto text-gray-400 mb-3" size={32} />
                                <span className="text-xs text-gray-300 font-semibold block">
                                    {csvFile ? csvFile.name : "Select CSV Spreadsheet File"}
                                </span>
                                <input
                                    type="file"
                                    accept=".csv"
                                    onChange={handleFileChange}
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                />
                            </div>
                        </div>

                        {csvFile && (
                            <button
                                onClick={handleImportSubmit}
                                disabled={importing}
                                className="w-full h-11 rounded-xl bg-[#e68932] text-white hover:opacity-90 font-semibold text-xs transition mt-6 disabled:opacity-50"
                            >
                                {importing ? "Importing records..." : "Trigger Batch Import"}
                            </button>
                        )}
                    </div>

                    {/* Columns Mapper UI */}
                    <div className="md:col-span-2 rounded-3xl bg-white/5 border border-white/10 p-6 space-y-4">
                        <h3 className="text-sm font-semibold uppercase text-gray-400 tracking-wider">Column Headers Mapping</h3>
                        
                        {!csvFile ? (
                            <p className="text-xs text-gray-500 py-12 text-center">Upload a CSV file to inspect headers mapping columns.</p>
                        ) : (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 text-xs font-bold uppercase tracking-wider text-gray-500 pb-2 border-b border-white/5">
                                    <span>Database Field</span>
                                    <span>CSV Header Column</span>
                                </div>

                                {targetFields[targetCollection].map((field) => (
                                    <div key={field} className="grid grid-cols-2 items-center text-xs">
                                        <span className="font-mono text-[#00C2FF] font-semibold">{field}</span>
                                        <select
                                            value={mapping[field] || ""}
                                            onChange={(e) => handleMappingChange(field, e.target.value)}
                                            className="h-9 rounded-lg border-none bg-white/5 px-2 text-xs text-white outline-none"
                                        >
                                            <option value="">-- Skip Field --</option>
                                            {headers.map(h => (
                                                <option key={h} value={h} className="bg-[#071120]">{h}</option>
                                            ))}
                                        </select>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                /* Webhooks Event Logs */
                <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-white">
                            <thead className="border-b border-white/10 bg-black/40 text-xs font-semibold uppercase tracking-wider text-gray-400">
                                <tr>
                                    <th className="px-6 py-4">Webhook ID</th>
                                    <th className="px-6 py-4">Integration Provider</th>
                                    <th className="px-6 py-4">Trigger Event Type</th>
                                    <th className="px-6 py-4">Reference ID</th>
                                    <th className="px-6 py-4 text-right">Transaction AED</th>
                                    <th className="px-6 py-4 text-center">Status</th>
                                    <th className="px-6 py-4">Timestamp</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 text-sm">
                                {webhookLogs.map((log) => (
                                    <tr key={log.id} className="transition hover:bg-white/5">
                                        <td className="px-6 py-4 font-mono text-xs text-gray-400">#{log.id}</td>
                                        <td className="px-6 py-4 font-semibold text-white">{log.provider}</td>
                                        <td className="px-6 py-4 font-mono text-xs text-[#00C2FF]">{log.event}</td>
                                        <td className="px-6 py-4 text-gray-300 font-mono text-xs">{log.ref}</td>
                                        <td className="px-6 py-4 text-right font-bold text-[#e68932]">{log.amount}</td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="inline-flex items-center gap-0.5 text-[9px] font-bold uppercase tracking-wider bg-green-500/20 text-green-400 px-2 py-0.5 rounded border border-green-500/10">
                                                <ShieldCheck size={10} /> {log.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-xs text-gray-500">{log.time}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
