"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, addDoc, onSnapshot } from "firebase/firestore";
import { Search, Plus, Calendar, AlertTriangle, UserCheck } from "lucide-react";

type Traveller = {
    id: string;
    fullName: string;
    firstName: string;
    lastName: string;
    dob: string;
    gender: string;
    nationality: string;
    passportNo: string;
    passportIssueCountry: string;
    passportExpiry: string;
    mobile: string;
    email: string;
    preferredLanguage: string;
    vipFlag: boolean;
    linkedAccountId: string;
    remarks: string;
};

export default function AdminTravellersPage() {
    const [travellers, setTravellers] = useState<Traveller[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [nationalityFilter, setNationalityFilter] = useState("All");

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        fullName: "",
        firstName: "",
        lastName: "",
        dob: "",
        gender: "Male",
        nationality: "",
        passportNo: "",
        passportIssueCountry: "",
        passportExpiry: "",
        mobile: "",
        email: "",
        preferredLanguage: "English",
        vipFlag: false,
        linkedAccountId: "",
        remarks: "",
    });

    useEffect(() => {
        const q = query(collection(db, "travellers"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data: Traveller[] = [];
            snapshot.forEach((docSnap) => {
                const item = docSnap.data();
                data.push({
                    id: docSnap.id,
                    fullName: item.fullName || `${item.firstName || ""} ${item.lastName || ""}`.trim() || "Unknown Traveller",
                    firstName: item.firstName || "",
                    lastName: item.lastName || "",
                    dob: item.dob || "",
                    gender: item.gender || "Male",
                    nationality: item.nationality || "",
                    passportNo: item.passportNo || "",
                    passportIssueCountry: item.passportIssueCountry || "",
                    passportExpiry: item.passportExpiry || "",
                    mobile: item.mobile || "",
                    email: item.email || "",
                    preferredLanguage: item.preferredLanguage || "English",
                    vipFlag: !!item.vipFlag,
                    linkedAccountId: item.linkedAccountId || "",
                    remarks: item.remarks || "",
                });
            });
            // Sort by fullName
            data.sort((a, b) => a.fullName.localeCompare(b.fullName));
            setTravellers(data);
            setLoading(false);
        }, (error) => {
            console.error("Error reading travellers:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleCreateTraveller = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.firstName || !formData.lastName || !formData.passportNo || !formData.passportExpiry) {
            alert("First Name, Last Name, Passport Number, and Expiry are required.");
            return;
        }

        const fullName = `${formData.firstName} ${formData.lastName}`.trim();

        try {
            await addDoc(collection(db, "travellers"), {
                ...formData,
                fullName,
                createdAt: new Date().toISOString(),
            });
            setShowModal(false);
            setFormData({
                fullName: "",
                firstName: "",
                lastName: "",
                dob: "",
                gender: "Male",
                nationality: "",
                passportNo: "",
                passportIssueCountry: "",
                passportExpiry: "",
                mobile: "",
                email: "",
                preferredLanguage: "English",
                vipFlag: false,
                linkedAccountId: "",
                remarks: "",
            });
            alert("Traveller profile created successfully!");
        } catch (error) {
            console.error("Error creating traveller:", error);
            alert("Failed to create traveller profile.");
        }
    };

    // Calculate Expiry Status helper
    const getPassportExpiryStatus = (expiryDateStr: string) => {
        if (!expiryDateStr) return { label: "Unknown", color: "text-gray-400 bg-gray-500/10", icon: false };
        const expiry = new Date(expiryDateStr);
        const today = new Date();
        const diffTime = expiry.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays <= 0) {
            return { label: "Expired", color: "text-red-500 bg-red-500/15 border border-red-500/20", icon: true };
        }
        if (diffDays <= 90) {
            return { label: `Critical: ${diffDays} Days Left`, color: "text-red-400 bg-red-500/10 border border-red-500/20", icon: true };
        }
        if (diffDays <= 180) {
            return { label: `Warning: ${diffDays} Days Left`, color: "text-yellow-400 bg-yellow-500/10 border border-yellow-500/20", icon: true };
        }
        return { label: "Valid", color: "text-green-400 bg-green-500/10 border border-green-500/20", icon: false };
    };

    const filteredTravellers = travellers.filter((trv) => {
        const matchesSearch =
            trv.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            trv.passportNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
            trv.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            trv.mobile.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesNationality = nationalityFilter === "All" || trv.nationality.toUpperCase() === nationalityFilter.toUpperCase();
        return matchesSearch && matchesNationality;
    });

    const uniqueNationalities = Array.from(new Set(travellers.map(t => t.nationality.toUpperCase()).filter(Boolean)));

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">Travellers Profile Master</h1>
                    <p className="mt-2 text-gray-400">Passport registry, nationality records, and visa profile histories.</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#e68932] px-6 py-3 font-semibold text-white hover:opacity-90 transition active:scale-95 text-sm"
                >
                    <Plus size={18} />
                    Register Traveller
                </button>
            </div>

            {/* Quick alert bar */}
            {travellers.some(t => {
                const status = getPassportExpiryStatus(t.passportExpiry);
                return status.label.includes("Warning") || status.label.includes("Critical") || status.label.includes("Expired");
            }) && (
                <div className="bg-yellow-500/15 border border-yellow-500/30 text-yellow-300 rounded-3xl p-5 flex items-center gap-4 text-sm font-medium">
                    <AlertTriangle className="text-yellow-400 flex-shrink-0" size={24} />
                    <div>
                        <p className="font-semibold text-white">Expiring Passports Alert</p>
                        <p className="text-xs text-gray-400 mt-0.5">Some passport records will expire in less than 180 days. Prompt travellers to upload renewals.</p>
                    </div>
                </div>
            )}

            {/* Filter controls */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white/5 p-4 rounded-3xl border border-white/10">
                <div className="relative w-full md:max-w-sm">
                    <Search className="absolute left-4 top-3 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search by traveller name, passport, phone..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="h-11 w-full rounded-2xl border-none bg-white/5 pl-11 pr-4 text-sm text-white outline-none focus:bg-white/10 transition"
                    />
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
                    <span className="text-xs text-gray-400 font-semibold uppercase pr-2 flex-shrink-0">Nationality:</span>
                    <button
                        onClick={() => setNationalityFilter("All")}
                        className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex-shrink-0 ${
                            nationalityFilter === "All" ? "bg-[#e68932] text-white" : "bg-white/5 text-gray-400 hover:text-white"
                        }`}
                    >
                        All
                    </button>
                    {uniqueNationalities.map((nat) => (
                        <button
                            key={nat}
                            onClick={() => setNationalityFilter(nat)}
                            className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex-shrink-0 ${
                                nationalityFilter === nat ? "bg-[#e68932] text-white" : "bg-white/5 text-gray-400 hover:text-white"
                            }`}
                        >
                            {nat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Travellers List Table */}
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-white font-sans">
                        <thead className="border-b border-white/10 bg-black/40 text-xs font-semibold uppercase tracking-wider text-gray-400">
                            <tr>
                                <th className="px-6 py-4">Traveller</th>
                                <th className="px-6 py-4">Passport Details</th>
                                <th className="px-6 py-4">Passport Expiry</th>
                                <th className="px-6 py-4">Contact Details</th>
                                <th className="px-6 py-4 text-center">VIP</th>
                                <th className="px-6 py-4">Remarks</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-sm">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-400">Loading travellers profiles...</td>
                                </tr>
                            ) : filteredTravellers.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-400">No travellers profiles registered.</td>
                                </tr>
                            ) : (
                                filteredTravellers.map((trv) => {
                                    const expiryStatus = getPassportExpiryStatus(trv.passportExpiry);
                                    return (
                                        <tr key={trv.id} className="transition hover:bg-white/5">
                                            <td className="px-6 py-4">
                                                <div className="font-semibold text-white flex items-center gap-1.5">
                                                    {trv.fullName}
                                                </div>
                                                <div className="text-xs text-gray-500 mt-0.5">DOB: {trv.dob || "N/A"} | {trv.gender}</div>
                                                <div className="text-[10px] font-mono text-gray-600 mt-1">ID: {trv.id}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-mono font-semibold text-gray-200">{trv.passportNo}</div>
                                                <div className="text-xs text-gray-500 mt-0.5">
                                                    Issue Country: <span className="font-semibold">{trv.passportIssueCountry || "N/A"}</span> | Nationality: <span className="font-semibold">{trv.nationality || "N/A"}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-xl font-semibold font-mono ${expiryStatus.color}`}>
                                                    {expiryStatus.icon && <AlertTriangle size={12} />}
                                                    {trv.passportExpiry ? new Date(trv.passportExpiry).toLocaleDateString() : "N/A"}
                                                    <span className="text-[10px] opacity-75 font-sans ml-1">({expiryStatus.label})</span>
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-gray-300">{trv.mobile}</div>
                                                <div className="text-xs text-gray-500 mt-0.5">{trv.email}</div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                {trv.vipFlag ? (
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 px-2.5 py-0.5 text-xs font-bold text-amber-400 border border-amber-500/20">
                                                        VIP
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-600">—</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-gray-400 max-w-xs truncate" title={trv.remarks}>
                                                {trv.remarks || "—"}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Registration Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
                    <div className="bg-[#071120] text-white w-full max-w-xl rounded-3xl p-8 border border-white/10 shadow-2xl relative max-h-[90vh] overflow-y-auto">
                        <h2 className="text-2xl font-bold mb-6 text-[#e68932]">Register Traveller Profile</h2>
                        
                        <form onSubmit={handleCreateTraveller} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-gray-400 font-bold uppercase tracking-wider">First Name</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Given name"
                                        value={formData.firstName}
                                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                        className="mt-1 h-11 w-full rounded-xl border-none bg-white/5 px-4 text-sm text-white outline-none focus:bg-white/10"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-400 font-bold uppercase tracking-wider">Last Name</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Surname"
                                        value={formData.lastName}
                                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                        className="mt-1 h-11 w-full rounded-xl border-none bg-white/5 px-4 text-sm text-white outline-none focus:bg-white/10"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="text-xs text-gray-400 font-bold uppercase tracking-wider">DOB</label>
                                    <input
                                        type="date"
                                        value={formData.dob}
                                        onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                                        className="mt-1 h-11 w-full rounded-xl border-none bg-white/5 px-4 text-xs text-white outline-none focus:bg-white/10"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-400 font-bold uppercase tracking-wider">Gender</label>
                                    <select
                                        value={formData.gender}
                                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                        className="mt-1 h-11 w-full rounded-xl border-none bg-white/5 px-4 text-sm text-white outline-none focus:bg-white/10"
                                    >
                                        <option value="Male" className="bg-[#071120]">Male</option>
                                        <option value="Female" className="bg-[#071120]">Female</option>
                                        <option value="Other" className="bg-[#071120]">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-400 font-bold uppercase tracking-wider">Preferred Language</label>
                                    <input
                                        type="text"
                                        placeholder="English, Arabic..."
                                        value={formData.preferredLanguage}
                                        onChange={(e) => setFormData({ ...formData, preferredLanguage: e.target.value })}
                                        className="mt-1 h-11 w-full rounded-xl border-none bg-white/5 px-4 text-sm text-white outline-none focus:bg-white/10"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="text-xs text-gray-400 font-bold uppercase tracking-wider">Passport Number</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Passport ID"
                                        value={formData.passportNo}
                                        onChange={(e) => setFormData({ ...formData, passportNo: e.target.value })}
                                        className="mt-1 h-11 w-full rounded-xl border-none bg-white/5 px-4 text-sm text-white font-mono outline-none focus:bg-white/10"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-400 font-bold uppercase tracking-wider">Issue Country (ISO)</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. IN, AE, GB"
                                        value={formData.passportIssueCountry}
                                        onChange={(e) => setFormData({ ...formData, passportIssueCountry: e.target.value })}
                                        className="mt-1 h-11 w-full rounded-xl border-none bg-white/5 px-4 text-sm text-white outline-none focus:bg-white/10"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-400 font-bold uppercase tracking-wider">Passport Expiry</label>
                                    <input
                                        type="date"
                                        required
                                        value={formData.passportExpiry}
                                        onChange={(e) => setFormData({ ...formData, passportExpiry: e.target.value })}
                                        className="mt-1 h-11 w-full rounded-xl border-none bg-white/5 px-4 text-xs text-white outline-none focus:bg-white/10"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-gray-400 font-bold uppercase tracking-wider">Mobile Number</label>
                                    <input
                                        type="text"
                                        placeholder="+971 50..."
                                        value={formData.mobile}
                                        onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                                        className="mt-1 h-11 w-full rounded-xl border-none bg-white/5 px-4 text-sm text-white outline-none focus:bg-white/10"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-400 font-bold uppercase tracking-wider">Email Address</label>
                                    <input
                                        type="email"
                                        placeholder="traveller@email.com"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="mt-1 h-11 w-full rounded-xl border-none bg-white/5 px-4 text-sm text-white outline-none focus:bg-white/10"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-gray-400 font-bold uppercase tracking-wider">Linked Account ID</label>
                                    <input
                                        type="text"
                                        placeholder="Reference Corporate ID"
                                        value={formData.linkedAccountId}
                                        onChange={(e) => setFormData({ ...formData, linkedAccountId: e.target.value })}
                                        className="mt-1 h-11 w-full rounded-xl border-none bg-white/5 px-4 text-sm text-white outline-none focus:bg-white/10"
                                    />
                                </div>
                                <div className="flex items-center h-full pt-6 pl-4">
                                    <input
                                        type="checkbox"
                                        id="vipFlag"
                                        checked={formData.vipFlag}
                                        onChange={(e) => setFormData({ ...formData, vipFlag: e.target.checked })}
                                        className="h-5 w-5 rounded border-gray-300 text-[#e68932] focus:ring-[#e68932]"
                                    />
                                    <label htmlFor="vipFlag" className="ml-2 text-sm text-white font-semibold">Mark as VIP Client</label>
                                </div>
                            </div>

                            <div>
                                <label className="text-xs text-gray-400 font-bold uppercase tracking-wider">Remarks / Notes</label>
                                <textarea
                                    rows={2}
                                    placeholder="Add background context..."
                                    value={formData.remarks}
                                    onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                                    className="mt-1 w-full rounded-xl border-none bg-white/5 p-4 text-sm text-white outline-none focus:bg-white/10"
                                />
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
                                    Register Profile
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
