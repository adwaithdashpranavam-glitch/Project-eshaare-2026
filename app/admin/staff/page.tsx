"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, addDoc, onSnapshot } from "firebase/firestore";
import { Users, Plus, Search, Percent, ShieldCheck, Target } from "lucide-react";

type StaffMember = {
    id: string;
    name: string;
    role: "Sales" | "Visa Ops" | "Finance" | "Manager" | "Admin";
    email: string;
    monthlyTarget: number; // AED
    realizedSales: number; // AED
    attendanceRate: number; // %
    status: "Active" | "On Leave" | "Suspended";
};

export default function AdminStaffPage() {
    const [staff, setStaff] = useState<StaffMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        role: "Sales" as StaffMember["role"],
        email: "",
        monthlyTarget: 10000,
        realizedSales: 0,
        attendanceRate: 98,
        status: "Active" as StaffMember["status"],
    });

    useEffect(() => {
        const q = query(collection(db, "staff"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data: StaffMember[] = [];
            snapshot.forEach((docSnap) => {
                const item = docSnap.data();
                data.push({
                    id: docSnap.id,
                    name: item.name || "",
                    role: item.role || "Sales",
                    email: item.email || "",
                    monthlyTarget: Number(item.monthlyTarget) || 0,
                    realizedSales: Number(item.realizedSales) || 0,
                    attendanceRate: Number(item.attendanceRate) || 0,
                    status: item.status || "Active",
                });
            });
            // Sort by name
            data.sort((a, b) => a.name.localeCompare(b.name));
            setStaff(data);
            setLoading(false);
        }, (error) => {
            console.error("Error reading staff:", error);
            // Fallback mock if settings collection doesn't exist
            setStaff([
                { id: "1", name: "Sana Tariq", role: "Sales", email: "sana@eshaare.com", monthlyTarget: 50000, realizedSales: 32000, attendanceRate: 97, status: "Active" },
                { id: "2", name: "Khalid Mansoor", role: "Sales", email: "khalid@eshaare.com", monthlyTarget: 40000, realizedSales: 45000, attendanceRate: 95, status: "Active" },
                { id: "3", name: "Hiba Noor", role: "Visa Ops", email: "hiba@eshaare.com", monthlyTarget: 0, realizedSales: 0, attendanceRate: 99, status: "Active" }
            ]);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleCreateStaff = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.email) {
            alert("Staff Name and Email are required.");
            return;
        }

        try {
            await addDoc(collection(db, "staff"), {
                ...formData,
                monthlyTarget: Number(formData.monthlyTarget) || 0,
                realizedSales: Number(formData.realizedSales) || 0,
                attendanceRate: Number(formData.attendanceRate) || 100,
                createdAt: new Date().toISOString(),
            });
            setShowModal(false);
            setFormData({
                name: "",
                role: "Sales",
                email: "",
                monthlyTarget: 10000,
                realizedSales: 0,
                attendanceRate: 98,
                status: "Active",
            });
            alert("Staff profile registered successfully!");
        } catch (error) {
            console.error("Error registering staff:", error);
            alert("Failed to register staff.");
        }
    };

    const filteredStaff = staff.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 font-sans">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                        <Users className="text-[#e68932]" />
                        Staff Attendance & Targets
                    </h1>
                    <p className="mt-2 text-gray-400">Track sales targets performance, trace commissions rates, and monitor weekly attendance records.</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#e68932] px-6 py-3 font-semibold text-white hover:opacity-90 transition active:scale-95 text-sm"
                >
                    <Plus size={18} />
                    Register Staff
                </button>
            </div>

            {/* Stats widgets */}
            <div className="grid gap-6 md:grid-cols-3">
                <div className="rounded-3xl bg-white/5 border border-white/10 p-6 flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-400 font-semibold uppercase tracking-wider">Active Staff Count</p>
                        <h2 className="mt-2 text-3xl font-bold text-white">{staff.filter(s => s.status === "Active").length} Members</h2>
                    </div>
                    <div className="h-12 w-12 bg-white/10 rounded-2xl flex items-center justify-center text-[#e68932]">
                        <Users size={24} />
                    </div>
                </div>

                <div className="rounded-3xl bg-white/5 border border-white/10 p-6 flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-400 font-semibold uppercase tracking-wider">Average Attendance</p>
                        <h2 className="mt-2 text-3xl font-bold text-green-400">
                            {staff.length > 0 ? Math.round(staff.reduce((acc, s) => acc + s.attendanceRate, 0) / staff.length) : 0}%
                        </h2>
                    </div>
                    <div className="h-12 w-12 bg-green-500/25 rounded-2xl flex items-center justify-center text-green-400">
                        <Percent size={24} />
                    </div>
                </div>

                <div className="rounded-3xl bg-white/5 border border-white/10 p-6 flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-400 font-semibold uppercase tracking-wider">Target Realization</p>
                        <h2 className="mt-2 text-3xl font-bold text-blue-400">
                            AED {staff.reduce((acc, s) => acc + s.realizedSales, 0).toLocaleString()}
                        </h2>
                    </div>
                    <div className="h-12 w-12 bg-blue-500/25 rounded-2xl flex items-center justify-center text-blue-400">
                        <Target size={24} />
                    </div>
                </div>
            </div>

            {/* Search filter */}
            <div className="relative max-w-sm bg-white/5 p-1 rounded-2xl border border-white/10">
                <Search className="absolute left-4 top-3 text-gray-400" size={16} />
                <input
                    type="text"
                    placeholder="Search staff members..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="h-10 w-full rounded-xl border-none bg-transparent pl-11 pr-4 text-xs text-white outline-none focus:bg-white/5 transition"
                />
            </div>

            {/* Staff list Table */}
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-white">
                        <thead className="border-b border-white/10 bg-black/40 text-xs font-semibold uppercase tracking-wider text-gray-400">
                            <tr>
                                <th className="px-6 py-4">Staff Member</th>
                                <th className="px-6 py-4">Role Role</th>
                                <th className="px-6 py-4">Target Progress</th>
                                <th className="px-6 py-4 text-center">Attendance</th>
                                <th className="px-6 py-4 text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-sm">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400">Loading staff database...</td>
                                </tr>
                            ) : filteredStaff.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400">No staff members found.</td>
                                </tr>
                            ) : (
                                filteredStaff.map((member) => {
                                    const progressPercent = member.monthlyTarget > 0 ? Math.round((member.realizedSales / member.monthlyTarget) * 100) : 0;
                                    return (
                                        <tr key={member.id} className="transition hover:bg-white/5">
                                            <td className="px-6 py-4">
                                                <div className="font-semibold text-white">{member.name}</div>
                                                <div className="text-xs text-gray-500 mt-0.5">{member.email}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-block rounded bg-white/15 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide">
                                                    {member.role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {member.monthlyTarget > 0 ? (
                                                    <div className="space-y-1.5 max-w-[200px]">
                                                        <div className="flex justify-between text-[10px] text-gray-500">
                                                            <span>AED {member.realizedSales.toLocaleString()} / {member.monthlyTarget.toLocaleString()}</span>
                                                            <span className="font-bold text-white">{progressPercent}%</span>
                                                        </div>
                                                        <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                                                            <div className="h-full bg-green-400" style={{ width: `${Math.min(progressPercent, 100)}%` }} />
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-500 font-semibold">N/A (No Quota)</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-center font-bold text-[#00C2FF]">
                                                {member.attendanceRate}%
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`inline-block text-[10px] px-2.5 py-1 font-bold uppercase tracking-wider rounded-full ${
                                                    member.status === "Active"
                                                        ? "bg-green-500/20 text-green-400"
                                                        : member.status === "On Leave"
                                                        ? "bg-yellow-500/20 text-yellow-400"
                                                        : "bg-red-500/20 text-red-400"
                                                }`}>
                                                    {member.status}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
                    <div className="bg-[#071120] text-white w-full max-w-lg rounded-3xl p-8 border border-white/10 shadow-2xl relative max-h-[90vh] overflow-y-auto">
                        <h2 className="text-2xl font-bold mb-6 text-[#e68932]">Register Staff Member</h2>

                        <form onSubmit={handleCreateStaff} className="space-y-4">
                            <div>
                                <label className="text-xs text-gray-400 font-bold uppercase tracking-wider">Full Name</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Enter full name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="mt-1 h-11 w-full rounded-xl border-none bg-white/5 px-4 text-sm text-white outline-none focus:bg-white/10"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-gray-400 font-bold uppercase tracking-wider">Email Address</label>
                                <input
                                    type="email"
                                    required
                                    placeholder="username@eshaare.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="mt-1 h-11 w-full rounded-xl border-none bg-white/5 px-4 text-sm text-white outline-none focus:bg-white/10"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-gray-400 font-bold uppercase tracking-wider">Functional Role</label>
                                    <select
                                        value={formData.role}
                                        onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                                        className="mt-1 h-11 w-full rounded-xl border-none bg-white/5 px-4 text-sm text-white outline-none focus:bg-white/10"
                                    >
                                        <option value="Sales" className="bg-[#071120]">Sales Executive</option>
                                        <option value="Visa Ops" className="bg-[#071120]">Visa Operations</option>
                                        <option value="Finance" className="bg-[#071120]">Finance Auditor</option>
                                        <option value="Manager" className="bg-[#071120]">Branch Manager</option>
                                        <option value="Admin" className="bg-[#071120]">System Admin</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-400 font-bold uppercase tracking-wider">Staff Status</label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                                        className="mt-1 h-11 w-full rounded-xl border-none bg-white/5 px-4 text-sm text-white outline-none focus:bg-white/10"
                                    >
                                        <option value="Active" className="bg-[#071120]">Active</option>
                                        <option value="On Leave" className="bg-[#071120]">On Leave</option>
                                        <option value="Suspended" className="bg-[#071120]">Suspended</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div className="col-span-2">
                                    <label className="text-xs text-gray-400 font-bold uppercase tracking-wider">Monthly Sales Target (AED)</label>
                                    <input
                                        type="number"
                                        placeholder="0"
                                        value={formData.monthlyTarget || ""}
                                        onChange={(e) => setFormData({ ...formData, monthlyTarget: Number(e.target.value) })}
                                        className="mt-1 h-11 w-full rounded-xl border-none bg-white/5 px-4 text-sm text-white outline-none focus:bg-white/10"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-400 font-bold uppercase tracking-wider">Realized (AED)</label>
                                    <input
                                        type="number"
                                        placeholder="0"
                                        value={formData.realizedSales || ""}
                                        onChange={(e) => setFormData({ ...formData, realizedSales: Number(e.target.value) })}
                                        className="mt-1 h-11 w-full rounded-xl border-none bg-white/5 px-4 text-sm text-white outline-none focus:bg-white/10"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs text-gray-400 font-bold uppercase tracking-wider">Attendance Rate (%)</label>
                                <input
                                    type="number"
                                    placeholder="100"
                                    min="0"
                                    max="100"
                                    value={formData.attendanceRate || ""}
                                    onChange={(e) => setFormData({ ...formData, attendanceRate: Number(e.target.value) })}
                                    className="mt-1 h-11 w-full rounded-xl border-none bg-white/5 px-4 text-sm text-white outline-none focus:bg-white/10"
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
                                    Register Staff
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
