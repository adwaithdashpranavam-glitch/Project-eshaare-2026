"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, addDoc, onSnapshot } from "firebase/firestore";
import { Users, Plus, Search, Building } from "lucide-react";

type Account = {
    id: string;
    legalName: string;
    displayName: string;
    accountType: "Corporate" | "Agent" | "Supplier";
    phone: string;
    email: string;
    ownerName: string;
    creditLimit: number;
    balance: number;
    createdAt: string;
};

export default function AdminAccountsPage() {
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [typeFilter, setTypeFilter] = useState("All");

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        legalName: "",
        displayName: "",
        accountType: "Corporate" as const,
        phone: "",
        email: "",
        ownerName: "",
        creditLimit: 0,
        balance: 0,
    });

    useEffect(() => {
        const q = query(collection(db, "accounts"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data: Account[] = [];
            snapshot.forEach((docSnap) => {
                const item = docSnap.data();
                data.push({
                    id: docSnap.id,
                    legalName: item.legalName || "",
                    displayName: item.displayName || "",
                    accountType: item.accountType || "Corporate",
                    phone: item.phone || "",
                    email: item.email || "",
                    ownerName: item.ownerName || "Unassigned",
                    creditLimit: Number(item.creditLimit) || 0,
                    balance: Number(item.balance) || 0,
                    createdAt: item.createdAt || new Date().toISOString(),
                });
            });
            // Sort by legalName
            data.sort((a, b) => a.legalName.localeCompare(b.legalName));
            setAccounts(data);
            setLoading(false);
        }, (error) => {
            console.error("Error reading accounts:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleCreateAccount = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.legalName || !formData.displayName || !formData.email) {
            alert("Legal Name, Display Name, and Email are required.");
            return;
        }

        try {
            await addDoc(collection(db, "accounts"), {
                ...formData,
                creditLimit: Number(formData.creditLimit) || 0,
                balance: Number(formData.balance) || 0,
                createdAt: new Date().toISOString(),
            });
            setShowModal(false);
            setFormData({
                legalName: "",
                displayName: "",
                accountType: "Corporate",
                phone: "",
                email: "",
                ownerName: "",
                creditLimit: 0,
                balance: 0,
            });
            alert("Account created successfully!");
        } catch (error) {
            console.error("Error creating account:", error);
            alert("Failed to create account.");
        }
    };

    const filteredAccounts = accounts.filter((acc) => {
        const matchesSearch =
            acc.legalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            acc.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            acc.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = typeFilter === "All" || acc.accountType === typeFilter;
        return matchesSearch && matchesType;
    });

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">Accounts Registry</h1>
                    <p className="mt-2 text-gray-400">Manage corporate entities, agency commissions, and supplier directories.</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#e68932] px-6 py-3 font-semibold text-white hover:opacity-90 transition active:scale-95 text-sm"
                >
                    <Plus size={18} />
                    Add Account
                </button>
            </div>

            {/* Quick stats */}
            <div className="grid gap-6 md:grid-cols-3">
                <div className="rounded-3xl bg-white/5 border border-white/10 p-6 flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-400 font-semibold uppercase tracking-wider">Total Corporations</p>
                        <h2 className="mt-2 text-3xl font-bold text-white">{accounts.filter(a => a.accountType === "Corporate").length}</h2>
                    </div>
                    <div className="h-12 w-12 bg-white/10 rounded-2xl flex items-center justify-center text-[#e68932]">
                        <Building size={24} />
                    </div>
                </div>

                <div className="rounded-3xl bg-white/5 border border-white/10 p-6 flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-400 font-semibold uppercase tracking-wider">Total Booking Agents</p>
                        <h2 className="mt-2 text-3xl font-bold text-white">{accounts.filter(a => a.accountType === "Agent").length}</h2>
                    </div>
                    <div className="h-12 w-12 bg-white/10 rounded-2xl flex items-center justify-center text-blue-400">
                        <Users size={24} />
                    </div>
                </div>

                <div className="rounded-3xl bg-white/5 border border-white/10 p-6 flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-400 font-semibold uppercase tracking-wider">Suppliers Logged</p>
                        <h2 className="mt-2 text-3xl font-bold text-white">{accounts.filter(a => a.accountType === "Supplier").length}</h2>
                    </div>
                    <div className="h-12 w-12 bg-white/10 rounded-2xl flex items-center justify-center text-green-400">
                        <Building size={24} />
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white/5 p-4 rounded-3xl border border-white/10">
                <div className="relative w-full md:max-w-sm">
                    <Search className="absolute left-4 top-3 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search legal/display name, email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="h-11 w-full rounded-2xl border-none bg-white/5 pl-11 pr-4 text-sm text-white outline-none focus:bg-white/10 transition"
                    />
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    {["All", "Corporate", "Agent", "Supplier"].map((type) => (
                        <button
                            key={type}
                            onClick={() => setTypeFilter(type)}
                            className={`flex-1 md:flex-none px-5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition ${
                                typeFilter === type ? "bg-[#e68932] text-white" : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10"
                            }`}
                        >
                            {type}
                        </button>
                    ))}
                </div>
            </div>

            {/* Accounts Table */}
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-white">
                        <thead className="border-b border-white/10 bg-black/40 text-xs font-semibold uppercase tracking-wider text-gray-400">
                            <tr>
                                <th className="px-6 py-4">Account Details</th>
                                <th className="px-6 py-4">Type</th>
                                <th className="px-6 py-4">Contact Info</th>
                                <th className="px-6 py-4">Owner</th>
                                <th className="px-6 py-4 text-right">Credit Limit (AED)</th>
                                <th className="px-6 py-4 text-right">Outstanding (AED)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-sm">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-400">Loading accounts registry...</td>
                                </tr>
                            ) : filteredAccounts.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-400">No accounts found.</td>
                                </tr>
                            ) : (
                                filteredAccounts.map((acc) => (
                                    <tr key={acc.id} className="transition hover:bg-white/5">
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-white">{acc.displayName}</div>
                                            <div className="text-xs text-gray-500 mt-0.5">{acc.legalName}</div>
                                            <div className="text-[10px] font-mono text-gray-600 mt-1">ID: {acc.id}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-block text-[10px] px-2.5 py-1 font-bold uppercase tracking-wider rounded-full ${
                                                acc.accountType === "Corporate"
                                                    ? "bg-purple-500/20 text-purple-400"
                                                    : acc.accountType === "Agent"
                                                    ? "bg-blue-500/20 text-blue-400"
                                                    : "bg-green-500/20 text-green-400"
                                            }`}>
                                                {acc.accountType}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-gray-300">{acc.email}</div>
                                            <div className="text-xs text-gray-500 mt-0.5">{acc.phone}</div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-300">
                                            {acc.ownerName}
                                        </td>
                                        <td className="px-6 py-4 text-right font-semibold">
                                            {acc.creditLimit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className="px-6 py-4 text-right font-bold text-orange-400">
                                            {acc.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Form */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
                    <div className="bg-[#071120] text-white w-full max-w-lg rounded-3xl p-8 border border-white/10 shadow-2xl relative max-h-[90vh] overflow-y-auto">
                        <h2 className="text-2xl font-bold mb-6 text-[#e68932]">Add Account Record</h2>
                        
                        <form onSubmit={handleCreateAccount} className="space-y-4">
                            <div>
                                <label className="text-xs text-gray-400 font-bold uppercase tracking-wider">Display Name</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Acme Dubai Branch"
                                    value={formData.displayName}
                                    onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                                    className="mt-1 h-11 w-full rounded-xl border-none bg-white/5 px-4 text-sm text-white outline-none focus:bg-white/10"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-gray-400 font-bold uppercase tracking-wider">Legal Name</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Acme Tourism Services LLC"
                                    value={formData.legalName}
                                    onChange={(e) => setFormData({ ...formData, legalName: e.target.value })}
                                    className="mt-1 h-11 w-full rounded-xl border-none bg-white/5 px-4 text-sm text-white outline-none focus:bg-white/10"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-gray-400 font-bold uppercase tracking-wider">Account Type</label>
                                    <select
                                        value={formData.accountType}
                                        onChange={(e) => setFormData({ ...formData, accountType: e.target.value as any })}
                                        className="mt-1 h-11 w-full rounded-xl border-none bg-white/5 px-4 text-sm text-white outline-none focus:bg-white/10"
                                    >
                                        <option value="Corporate" className="bg-[#071120]">Corporate</option>
                                        <option value="Agent" className="bg-[#071120]">Agent</option>
                                        <option value="Supplier" className="bg-[#071120]">Supplier</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-400 font-bold uppercase tracking-wider">Owner / Manager</label>
                                    <input
                                        type="text"
                                        placeholder="Agent Name"
                                        value={formData.ownerName}
                                        onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                                        className="mt-1 h-11 w-full rounded-xl border-none bg-white/5 px-4 text-sm text-white outline-none focus:bg-white/10"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-gray-400 font-bold uppercase tracking-wider">Email Address</label>
                                    <input
                                        type="email"
                                        required
                                        placeholder="corporate@client.com"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="mt-1 h-11 w-full rounded-xl border-none bg-white/5 px-4 text-sm text-white outline-none focus:bg-white/10"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-400 font-bold uppercase tracking-wider">Phone Number</label>
                                    <input
                                        type="text"
                                        placeholder="+971 50..."
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="mt-1 h-11 w-full rounded-xl border-none bg-white/5 px-4 text-sm text-white outline-none focus:bg-white/10"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-gray-400 font-bold uppercase tracking-wider">Credit Limit (AED)</label>
                                    <input
                                        type="number"
                                        placeholder="0"
                                        value={formData.creditLimit || ""}
                                        onChange={(e) => setFormData({ ...formData, creditLimit: Number(e.target.value) })}
                                        className="mt-1 h-11 w-full rounded-xl border-none bg-white/5 px-4 text-sm text-white outline-none focus:bg-white/10"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-400 font-bold uppercase tracking-wider">Initial Balance (AED)</label>
                                    <input
                                        type="number"
                                        placeholder="0"
                                        value={formData.balance || ""}
                                        onChange={(e) => setFormData({ ...formData, balance: Number(e.target.value) })}
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
                                    Create Account
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
