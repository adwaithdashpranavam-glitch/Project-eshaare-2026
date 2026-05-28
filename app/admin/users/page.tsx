"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { 
    collection, 
    getDocs, 
    query, 
    where, 
    doc, 
    updateDoc 
} from "firebase/firestore";
import { Users, Activity, Heart, Briefcase, KeyRound, Loader2, Search } from "lucide-react";

interface ClientUser {
    id: string;
    name: string;
    email: string;
    phone: string;
    role: string;
    createdAt?: any;
    savedPackages?: string[];
    savedHotels?: string[];
}

interface ActivityLog {
    id: string;
    userId: string;
    userEmail: string;
    activityType: string;
    details: string;
    createdAt?: any;
}

interface Booking {
    id: string;
    userId: string;
    itemName: string;
    itemType: string;
    price: string;
    guests: number;
    status: string;
    createdAt?: any;
}

export default function AdminUsersDashboard() {
    const [clients, setClients] = useState<ClientUser[]>([]);
    const [activities, setActivities] = useState<ActivityLog[]>([]);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Tab State: "clients" | "activity" | "bookings" | "saved"
    const [activeTab, setActiveTab] = useState<"clients" | "activity" | "bookings" | "saved">("clients");
    const [search, setSearch] = useState("");

    useEffect(() => {
        const fetchAllLogs = async () => {
            try {
                setLoading(true);
                
                // 1. Fetch Registered Clients (where role == "client")
                const clientSnap = await getDocs(
                    query(collection(db, "users"), where("role", "==", "client"))
                );
                const clientList = clientSnap.docs.map(docItem => ({
                    id: docItem.id,
                    ...docItem.data()
                })) as ClientUser[];
                setClients(clientList);

                // 2. Fetch User Activity Logs
                const activitySnap = await getDocs(collection(db, "userActivity"));
                const activityList = activitySnap.docs.map(docItem => {
                    const data = docItem.data();
                    const user = clientList.find(c => c.id === data.userId);
                    return {
                        id: docItem.id,
                        userId: data.userId || "Unknown ID",
                        userEmail: user?.email || data.userEmail || "Anonymous Client",
                        activityType: data.activityType || "Action",
                        details: data.details || "Activity recorded",
                        createdAt: data.createdAt
                    };
                }) as ActivityLog[];
                // Sort by latest activity
                activityList.sort((a, b) => {
                    const aTime = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
                    const bTime = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
                    return bTime - aTime;
                });
                setActivities(activityList);

                // 3. Fetch Bookings
                const bookingsSnap = await getDocs(collection(db, "bookings"));
                const bookingsList = bookingsSnap.docs.map(docItem => ({
                    id: docItem.id,
                    ...docItem.data()
                })) as Booking[];
                setBookings(bookingsList);

            } catch (err) {
                console.error("Error loading logs:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchAllLogs();
    }, []);

    // Filter items based on active search
    const filteredClients = clients.filter(c => 
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.email.toLowerCase().includes(search.toLowerCase()) ||
        c.phone.toLowerCase().includes(search.toLowerCase())
    );

    const filteredActivities = activities.filter(a => 
        a.userEmail.toLowerCase().includes(search.toLowerCase()) ||
        a.activityType.toLowerCase().includes(search.toLowerCase()) ||
        a.details.toLowerCase().includes(search.toLowerCase())
    );

    const filteredBookings = bookings.filter(b => 
        b.itemName.toLowerCase().includes(search.toLowerCase()) ||
        b.status.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-8 text-white">
            <div>
                <h1 className="text-3xl font-bold">Client Accounts Operations</h1>
                <p className="mt-2 text-gray-400">Trace client credentials, trace live activity feeds, monitor bookings, and inspect wishlist analytics.</p>
            </div>

            {/* TAB SELECTORS */}
            <div className="flex flex-wrap gap-2 border-b border-white/10 pb-4">
                <button
                    onClick={() => { setActiveTab("clients"); setSearch(""); }}
                    className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition ${
                        activeTab === "clients" ? "bg-[#e68932] text-white" : "bg-white/5 text-gray-300 hover:bg-white/10"
                    }`}
                >
                    <Users size={16} />
                    Registered Clients
                </button>

                <button
                    onClick={() => { setActiveTab("activity"); setSearch(""); }}
                    className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition ${
                        activeTab === "activity" ? "bg-[#e68932] text-white" : "bg-white/5 text-gray-300 hover:bg-white/10"
                    }`}
                >
                    <Activity size={16} />
                    User Activity Logs
                </button>

                <button
                    onClick={() => { setActiveTab("bookings"); setSearch(""); }}
                    className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition ${
                        activeTab === "bookings" ? "bg-[#e68932] text-white" : "bg-white/5 text-gray-300 hover:bg-white/10"
                    }`}
                >
                    <Briefcase size={16} />
                    Client Bookings
                </button>

                <button
                    onClick={() => { setActiveTab("saved"); setSearch(""); }}
                    className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition ${
                        activeTab === "saved" ? "bg-[#e68932] text-white" : "bg-white/5 text-gray-300 hover:bg-white/10"
                    }`}
                >
                    <Heart size={16} />
                    Wishlists / Saved Stays
                </button>
            </div>

            {/* SEARCH BAR */}
            <div className="relative max-w-sm">
                <Search className="absolute left-4 top-3 text-gray-400" size={18} />
                <input
                    type="text"
                    placeholder="Search logs and names..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="h-11 w-full rounded-2xl border-none bg-white/5 pl-11 pr-4 text-sm text-white outline-none focus:bg-white/10 transition"
                />
            </div>

            {loading ? (
                <div className="flex items-center gap-3 py-12">
                    <Loader2 className="w-6 h-6 animate-spin text-[#e68932]" />
                    <span>Loading logs feed...</span>
                </div>
            ) : (
                <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                    
                    {/* 1. CLIENTS TAB TABLE */}
                    {activeTab === "clients" && (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="border-b border-white/10 bg-black/40 text-xs font-semibold uppercase tracking-wider text-gray-400">
                                    <tr>
                                        <th className="px-6 py-4">Client User</th>
                                        <th className="px-6 py-4">Email</th>
                                        <th className="px-6 py-4">Phone</th>
                                        <th className="px-6 py-4">Registered On</th>
                                        <th className="px-6 py-4">Saved Count</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5 text-sm">
                                    {filteredClients.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center text-gray-400">No client accounts found.</td>
                                        </tr>
                                    ) : (
                                        filteredClients.map((c) => (
                                            <tr key={c.id} className="transition hover:bg-white/5">
                                                <td className="px-6 py-4 font-bold text-white">{c.name || "Unnamed Client"}</td>
                                                <td className="px-6 py-4 text-gray-300">{c.email}</td>
                                                <td className="px-6 py-4 text-gray-300">{c.phone || "Not Configured"}</td>
                                                <td className="px-6 py-4 text-gray-300">
                                                    {c.createdAt?.toDate ? c.createdAt.toDate().toLocaleDateString() : "Prior Records"}
                                                </td>
                                                <td className="px-6 py-4 font-semibold text-[#e68932]">
                                                    { (c.savedPackages?.length || 0) + (c.savedHotels?.length || 0) } Items
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* 2. ACTIVITY LOGS TAB */}
                    {activeTab === "activity" && (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="border-b border-white/10 bg-black/40 text-xs font-semibold uppercase tracking-wider text-gray-400">
                                    <tr>
                                        <th className="px-6 py-4">Client User Email</th>
                                        <th className="px-6 py-4">Action Type</th>
                                        <th className="px-6 py-4">Log Details</th>
                                        <th className="px-6 py-4">Timestamp</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5 text-sm">
                                    {filteredActivities.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-12 text-center text-gray-400">No activity logs recorded.</td>
                                        </tr>
                                    ) : (
                                        filteredActivities.map((a) => (
                                            <tr key={a.id} className="transition hover:bg-white/5">
                                                <td className="px-6 py-4 text-gray-300 font-medium">{a.userEmail}</td>
                                                <td className="px-6 py-4">
                                                    <span className="inline-block text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/10 font-bold uppercase tracking-wider">
                                                        {a.activityType}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-gray-300">{a.details}</td>
                                                <td className="px-6 py-4 text-xs text-gray-400">
                                                    {a.createdAt?.toDate ? a.createdAt.toDate().toLocaleString() : "Just Now"}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* 3. BOOKINGS TAB */}
                    {activeTab === "bookings" && (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="border-b border-white/10 bg-black/40 text-xs font-semibold uppercase tracking-wider text-gray-400">
                                    <tr>
                                        <th className="px-6 py-4">Client User ID</th>
                                        <th className="px-6 py-4">Item Booked</th>
                                        <th className="px-6 py-4">Type</th>
                                        <th className="px-6 py-4">Guests</th>
                                        <th className="px-6 py-4">Price</th>
                                        <th className="px-6 py-4">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5 text-sm">
                                    {filteredBookings.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-12 text-center text-gray-400">No client bookings recorded.</td>
                                        </tr>
                                    ) : (
                                        filteredBookings.map((b) => (
                                            <tr key={b.id} className="transition hover:bg-white/5">
                                                <td className="px-6 py-4 text-gray-400 font-mono text-xs truncate max-w-[120px]">{b.userId}</td>
                                                <td className="px-6 py-4 text-white font-bold">{b.itemName}</td>
                                                <td className="px-6 py-4 text-gray-300 capitalize">{b.itemType}</td>
                                                <td className="px-6 py-4 text-gray-300">{b.guests || 2} Adults</td>
                                                <td className="px-6 py-4 text-white font-semibold">{b.price}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${
                                                        b.status === "confirmed" ? "bg-green-500/20 text-green-400 border border-green-500/10" : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/10"
                                                    }`}>
                                                        {b.status || "pending"}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* 4. WISHLISTS TAB */}
                    {activeTab === "saved" && (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="border-b border-white/10 bg-black/40 text-xs font-semibold uppercase tracking-wider text-gray-400">
                                    <tr>
                                        <th className="px-6 py-4">Client User</th>
                                        <th className="px-6 py-4">Wishlist Saved Packages</th>
                                        <th className="px-6 py-4">Wishlist Saved Hotels</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5 text-sm">
                                    {clients.filter(c => (c.savedPackages?.length || 0) + (c.savedHotels?.length || 0) > 0).length === 0 ? (
                                        <tr>
                                            <td colSpan={3} className="px-6 py-12 text-center text-gray-400">No client wishlists logged.</td>
                                        </tr>
                                    ) : (
                                        clients
                                            .filter(c => (c.savedPackages?.length || 0) + (c.savedHotels?.length || 0) > 0)
                                            .map((c) => (
                                                <tr key={c.id} className="transition hover:bg-white/5">
                                                    <td className="px-6 py-4 font-bold text-white">{c.name || c.email}</td>
                                                    <td className="px-6 py-4 text-gray-300">
                                                        {c.savedPackages && c.savedPackages.length > 0 
                                                            ? c.savedPackages.join(", ") 
                                                            : <span className="text-gray-500">None</span>
                                                        }
                                                    </td>
                                                    <td className="px-6 py-4 text-gray-300">
                                                        {c.savedHotels && c.savedHotels.length > 0 
                                                            ? c.savedHotels.join(", ") 
                                                            : <span className="text-gray-500">None</span>
                                                        }
                                                    </td>
                                                </tr>
                                            ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                </div>
            )}
        </div>
    );
}
