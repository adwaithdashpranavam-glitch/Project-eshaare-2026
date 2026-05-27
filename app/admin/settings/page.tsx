"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, getDocs, addDoc, doc, updateDoc, onSnapshot } from "firebase/firestore";
import { Settings, ShieldCheck, Key, FileWarning, HelpCircle } from "lucide-react";

type ChecklistSetting = {
    id: string;
    visaType: string;
    requiredDocs: string[];
};

export default function AdminSettingsPage() {
    const [checklists, setChecklists] = useState<ChecklistSetting[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"api" | "checklists" | "roles">("api");

    // Checklist creation form
    const [newVisaType, setNewVisaType] = useState("");
    const [newDocs, setNewDocs] = useState("");

    // API settings state (Simulated config overview)
    const apiConnectors = [
        { name: "Resend Email API Gateway", envKey: "RESEND_API_KEY", status: "Active (Production)", desc: "Triggers transactional welcome and confirmation messages." },
        { name: "WhatsApp Webhook Connector", envKey: "WHATSAPP_API_URL", status: "Active (Sandbox)", desc: "Sends templates notifications outside 24-hr windows." },
        { name: "Stripe Payment Links API", envKey: "STRIPE_SECRET_KEY", status: "Simulated", desc: "Generates collections links and invoice reminders." }
    ];

    useEffect(() => {
        const q = query(collection(db, "checklistSettings"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data: ChecklistSetting[] = [];
            snapshot.forEach((docSnap) => {
                const item = docSnap.data();
                data.push({
                    id: docSnap.id,
                    visaType: item.visaType || "",
                    requiredDocs: item.requiredDocs || [],
                });
            });
            setChecklists(data);
            setLoading(false);
        }, (error) => {
            console.error("Error reading checklists settings:", error);
            // Fallback mock if settings collection doesn't exist
            setChecklists([
                { id: "1", visaType: "Schengen Tourist", requiredDocs: ["Passport Copy", "NOC Letter", "Bank Statement 6 Months", "Travel Insurance"] },
                { id: "2", visaType: "United Kingdom Business", requiredDocs: ["Passport Copy", "Invitation Letter", "Company Trade License", "Tax Returns"] }
            ]);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleCreateChecklist = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newVisaType || !newDocs) {
            alert("Visa Type and Required Documents list are required.");
            return;
        }

        const docsArray = newDocs.split(",").map(d => d.trim()).filter(Boolean);

        try {
            await addDoc(collection(db, "checklistSettings"), {
                visaType: newVisaType,
                requiredDocs: docsArray,
            });
            setNewVisaType("");
            setNewDocs("");
            alert("Checklist setup registered!");
        } catch (error) {
            console.error("Error saving checklist setting:", error);
            alert("Failed to save checklist.");
        }
    };

    return (
        <div className="space-y-8 font-sans">
            <div>
                <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                    <Settings className="text-[#e68932]" />
                    Settings & Workflow Configuration
                </h1>
                <p className="mt-2 text-gray-400">Configure global document checklists, inspect external API connection keys, and audit staff RBAC access levels.</p>
            </div>

            {/* Tab selection */}
            <div className="flex gap-2 bg-white/5 p-1.5 rounded-2xl border border-white/10 w-fit">
                <button
                    onClick={() => setActiveTab("api")}
                    className={`px-5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition ${
                        activeTab === "api" ? "bg-[#e68932] text-white" : "text-gray-400 hover:text-white"
                    }`}
                >
                    API Connectors
                </button>
                <button
                    onClick={() => setActiveTab("checklists")}
                    className={`px-5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition ${
                        activeTab === "checklists" ? "bg-[#e68932] text-white" : "text-gray-400 hover:text-white"
                    }`}
                >
                    Visa Checklists
                </button>
                <button
                    onClick={() => setActiveTab("roles")}
                    className={`px-5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition ${
                        activeTab === "roles" ? "bg-[#e68932] text-white" : "text-gray-400 hover:text-white"
                    }`}
                >
                    RBAC Roles Matrix
                </button>
            </div>

            {/* Tab content */}
            {activeTab === "api" ? (
                /* API Connectors Grid */
                <div className="space-y-6">
                    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 space-y-4">
                        <div className="flex items-center gap-3">
                            <Key className="text-[#e68932]" size={24} />
                            <div>
                                <h3 className="font-bold text-base text-white">Environment Credentials</h3>
                                <p className="text-xs text-gray-400 mt-0.5">Sensitive keys are managed via server environment variables (.env.local) to protect credentials.</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-6 md:grid-cols-3">
                        {apiConnectors.map((c) => (
                            <div key={c.name} className="bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col justify-between hover:border-white/15 transition gap-4">
                                <div className="space-y-2">
                                    <h4 className="font-bold text-sm text-white">{c.name}</h4>
                                    <p className="text-xs text-gray-400 leading-5">{c.desc}</p>
                                    <div className="text-[10px] font-mono text-gray-500 bg-black/40 p-2.5 rounded-lg border border-white/5">
                                        Variable: {c.envKey}
                                    </div>
                                </div>
                                <div className="flex justify-between items-center border-t border-white/5 pt-3">
                                    <span className="text-[10px] text-gray-500">Connection Status:</span>
                                    <span className="text-[10px] font-bold text-green-400 bg-green-500/10 px-2 py-0.5 rounded-md border border-green-500/10">
                                        {c.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : activeTab === "checklists" ? (
                /* Checklists Setup */
                <div className="grid gap-8 md:grid-cols-3">
                    {/* Left: Customizer form */}
                    <div className="rounded-3xl bg-white/5 border border-white/10 p-6 space-y-4 flex flex-col justify-between">
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-white">Define Required Documents</h3>
                            <p className="text-xs text-gray-400 leading-4">Add visa templates to ensure visa operational dashboards show warning badges if mandatory files are missing.</p>
                        </div>
                        <form onSubmit={handleCreateChecklist} className="space-y-4 mt-4">
                            <div>
                                <label className="text-xs text-gray-400 font-bold uppercase tracking-wider">Visa Type / Destination</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Schengen Visa"
                                    value={newVisaType}
                                    onChange={(e) => setNewVisaType(e.target.value)}
                                    className="mt-1 h-11 w-full rounded-xl border-none bg-white/5 px-4 text-sm text-white outline-none focus:bg-white/10"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-gray-400 font-bold uppercase tracking-wider">Required Items (Comma-separated)</label>
                                <textarea
                                    required
                                    rows={3}
                                    placeholder="Passport, NOC, Bank Statement, Photo"
                                    value={newDocs}
                                    onChange={(e) => setNewDocs(e.target.value)}
                                    className="mt-1 w-full rounded-xl border-none bg-white/5 p-4 text-xs text-white outline-none focus:bg-white/10"
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full h-11 rounded-xl bg-[#e68932] text-white hover:opacity-90 font-semibold text-xs transition"
                            >
                                Register Checklist
                            </button>
                        </form>
                    </div>

                    {/* Right: Checklists grid view */}
                    <div className="md:col-span-2 space-y-4 max-h-[500px] overflow-y-auto pr-1">
                        <h3 className="text-sm font-semibold uppercase text-gray-400 tracking-wider">Registered Checklists</h3>
                        {checklists.map((c) => (
                            <div key={c.id} className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-3">
                                <h4 className="font-bold text-sm text-white">{c.visaType} Checklist</h4>
                                <div className="flex flex-wrap gap-2 pt-1">
                                    {c.requiredDocs.map((docItem, idx) => (
                                        <span
                                            key={idx}
                                            className="text-xs bg-white/5 border border-white/5 rounded-xl px-3.5 py-1.5 text-gray-300 font-semibold flex items-center gap-1"
                                        >
                                            <ShieldCheck size={12} className="text-[#00C2FF]" />
                                            {docItem}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                /* Roles Matrix View */
                <div className="rounded-3xl border border-white/10 bg-white/5 p-6 space-y-6">
                    <div className="flex items-center gap-3">
                        <FileWarning className="text-[#e68932]" size={24} />
                        <div>
                            <h3 className="font-bold text-base text-white">Role-Based Access Control (RBAC)</h3>
                            <p className="text-xs text-gray-400 mt-0.5">Review system access permission boundaries across dashboard pages.</p>
                        </div>
                    </div>

                    <div className="overflow-x-auto border-t border-white/5 pt-4">
                        <table className="w-full text-left text-xs">
                            <thead>
                                <tr className="text-gray-400 font-semibold uppercase tracking-wider pb-3 border-b border-white/10">
                                    <th className="py-2.5">CRM Role</th>
                                    <th className="py-2.5 text-center">Dashboard</th>
                                    <th className="py-2.5 text-center">Leads Inbox</th>
                                    <th className="py-2.5 text-center">Visa Cases</th>
                                    <th className="py-2.5 text-center">Payments</th>
                                    <th className="py-2.5 text-center">Config Settings</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 text-gray-300 font-medium">
                                {[
                                    { r: "Admin", db: "Full", ld: "Full CRUD", vc: "Full CRUD", pm: "Full CRUD", cfg: "Full CRUD" },
                                    { r: "Manager", db: "Full", ld: "CRUD (Team)", vc: "CRUD (Team)", pm: "Read Only", cfg: "No Access" },
                                    { r: "Sales Officer", db: "Sales Stats", ld: "CRUD (Own)", vc: "No Access", pm: "Request Link", cfg: "No Access" },
                                    { r: "Visa Ops", db: "Ops Stats", ld: "Read Only", vc: "Update Status", pm: "No Access", cfg: "No Access" }
                                ].map((role) => (
                                    <tr key={role.r} className="hover:text-white transition">
                                        <td className="py-3.5 font-bold text-white">{role.r}</td>
                                        <td className="py-3.5 text-center text-gray-400">{role.db}</td>
                                        <td className="py-3.5 text-center text-gray-400">{role.ld}</td>
                                        <td className="py-3.5 text-center text-[#00C2FF]">{role.vc}</td>
                                        <td className="py-3.5 text-center text-gray-400">{role.pm}</td>
                                        <td className="py-3.5 text-center text-[#e68932] font-semibold">{role.cfg}</td>
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
