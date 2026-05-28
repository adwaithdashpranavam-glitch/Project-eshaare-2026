"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
    collection, 
    getDocs, 
    doc, 
    updateDoc, 
    deleteDoc 
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Loader2, Plus, Edit, Trash2 } from "lucide-react";

interface Offer {
    id: string;
    title: string;
    description: string;
    discountText: string;
    offerType: "hotel" | "package" | "event" | "visa" | "seasonal";
    expiryDate: string;
    targetUrl: string;
    active: boolean;
}

export default function AdminOffersPage() {
    const [offers, setOffers] = useState<Offer[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"all" | "active" | "inactive">("all");

    const fetchOffers = async () => {
        try {
            setLoading(true);
            const snap = await getDocs(collection(db, "offers"));
            const list = snap.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Offer[];
            setOffers(list);
        } catch (err) {
            console.error("Error fetching offers:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOffers();
    }, []);

    const toggleActive = async (id: string, currentStatus: boolean) => {
        try {
            await updateDoc(doc(db, "offers", id), {
                active: !currentStatus
            });
            setOffers(prev =>
                prev.map(o => (o.id === id ? { ...o, active: !currentStatus } : o))
            );
        } catch (err) {
            console.error("Error toggling active status:", err);
        }
    };

    const deleteOffer = async (id: string) => {
        const confirmDelete = confirm("Are you sure you want to delete this offer?");
        if (!confirmDelete) return;

        try {
            await deleteDoc(doc(db, "offers", id));
            setOffers(prev => prev.filter(o => o.id !== id));
            alert("Offer deleted successfully.");
        } catch (err) {
            console.error(err);
            alert("Failed to delete offer.");
        }
    };

    const activeCount = offers.filter(o => o.active).length;
    const inactiveCount = offers.filter(o => !o.active).length;

    const displayedOffers = offers.filter(o => {
        if (activeTab === "active") return o.active;
        if (activeTab === "inactive") return !o.active;
        return true;
    });

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">Promotional Offers</h1>
                    <p className="mt-2 text-gray-400">Manage countdown deals and offers displayed on the website homepage.</p>
                </div>
                <Link
                    href="/admin/offers/add"
                    className="flex items-center gap-2 rounded-xl bg-[#e68932] px-5 py-3 font-semibold text-white hover:bg-[#cf7726] transition active:scale-[0.98]"
                >
                    <Plus size={18} />
                    Add Offer
                </Link>
            </div>

            {/* Premium Filtering Bar */}
            <div className="flex border-b border-white/10 pb-1 gap-6 text-sm">
                <button
                    onClick={() => setActiveTab("all")}
                    className={`pb-3 font-semibold transition-all relative ${
                        activeTab === "all" ? "text-[#e68932]" : "text-gray-400 hover:text-white"
                    }`}
                >
                    All Offers ({offers.length})
                    {activeTab === "all" && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#e68932] rounded-full" />}
                </button>
                <button
                    onClick={() => setActiveTab("active")}
                    className={`pb-3 font-semibold transition-all relative flex items-center gap-1.5 ${
                        activeTab === "active" ? "text-green-400" : "text-gray-400 hover:text-white"
                    }`}
                >
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    Active Offers ({activeCount})
                    {activeTab === "active" && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-green-400 rounded-full" />}
                </button>
                <button
                    onClick={() => setActiveTab("inactive")}
                    className={`pb-3 font-semibold transition-all relative flex items-center gap-1.5 ${
                        activeTab === "inactive" ? "text-red-400" : "text-gray-400 hover:text-white"
                    }`}
                >
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                    Inactive Offers ({inactiveCount})
                    {activeTab === "inactive" && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-red-400 rounded-full" />}
                </button>
            </div>

            {loading ? (
                <div className="text-white text-xl flex items-center gap-3 py-12">
                    <Loader2 className="w-6 h-6 animate-spin text-[#e68932]" />
                    <span>Loading Offers List...</span>
                </div>
            ) : displayedOffers.length === 0 ? (
                <div className="text-center py-20 border border-white/5 rounded-3xl bg-white/5">
                    <p className="text-gray-400 font-semibold">No offers found matching this filter.</p>
                    {activeTab === "all" && (
                        <Link href="/admin/offers/add" className="mt-4 inline-block bg-[#e68932] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#cf7726] transition">
                            Add Your First Offer
                        </Link>
                    )}
                </div>
            ) : (
                <div className="grid gap-4">
                    {displayedOffers.map((offer) => (
                        <div
                            key={offer.id}
                            className="rounded-2xl border border-white/10 bg-white/5 p-5 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6"
                        >
                            <div className="space-y-2 col-span-3">
                                <h2 className="text-xl font-semibold text-white">{offer.title}</h2>
                                <p className="text-gray-400 text-sm">{offer.description}</p>
                                <div className="flex flex-wrap gap-2 text-xs">
                                    <span className="rounded-full bg-orange-500/20 text-[#e68932] border border-orange-500/10 px-3 py-1 font-bold">
                                        Value: {offer.discountText}
                                    </span>
                                    <span className="rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/10 px-3 py-1 font-bold capitalize">
                                        Type: {offer.offerType}
                                    </span>
                                    <span className={`rounded-full px-3 py-1 font-semibold ${
                                        offer.active ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                                    }`}>
                                        {offer.active ? "Active" : "Inactive"}
                                    </span>
                                    <span className="rounded-full bg-white/5 border border-white/10 px-3 py-1 text-gray-300">
                                        Expires: {new Date(offer.expiryDate).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-6 shrink-0 ml-auto lg:ml-0">
                                {/* One-click Switch Toggle */}
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-semibold text-gray-400">Home Visibility</span>
                                    <button
                                        onClick={() => toggleActive(offer.id, offer.active)}
                                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                            offer.active ? "bg-green-500" : "bg-white/10"
                                        }`}
                                        title={offer.active ? "Click to deactivate" : "Click to activate"}
                                    >
                                        <span
                                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                                offer.active ? "translate-x-5" : "translate-x-0"
                                            }`}
                                        />
                                    </button>
                                </div>

                                <div className="flex gap-2">
                                    <Link
                                        href={`/admin/offers/edit/${offer.id}`}
                                        className="flex items-center gap-1.5 rounded-xl bg-white/15 hover:bg-white/20 px-4 py-2 text-xs font-semibold text-white transition"
                                    >
                                        <Edit size={14} />
                                        Edit
                                    </Link>

                                    <button
                                        onClick={() => deleteOffer(offer.id)}
                                        className="flex items-center gap-1.5 rounded-xl bg-red-500/25 hover:bg-red-500/35 border border-red-500/10 px-4 py-2 text-xs font-semibold text-red-400 transition"
                                    >
                                        <Trash2 size={14} />
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
