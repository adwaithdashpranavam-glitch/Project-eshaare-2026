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
import { Loader2, Plus, Edit, Trash2, Eye } from "lucide-react";

interface Hotel {
    id: string;
    name: string;
    hotelType: string;
    location: string;
    price: string;
    rating: string;
    roomCount: number;
    availabilityStatus: "Available" | "Sold Out";
    active: boolean;
}

export default function AdminHotelsPage() {
    const [hotels, setHotels] = useState<Hotel[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchHotels = async () => {
        try {
            setLoading(true);
            const snap = await getDocs(collection(db, "hotels"));
            const list = snap.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Hotel[];
            setHotels(list);
        } catch (err) {
            console.error("Error fetching hotels:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHotels();
    }, []);

    const toggleActive = async (id: string, currentStatus: boolean) => {
        try {
            await updateDoc(doc(db, "hotels", id), {
                active: !currentStatus
            });
            setHotels(prev =>
                prev.map(h => (h.id === id ? { ...h, active: !currentStatus } : h))
            );
        } catch (err) {
            console.error(err);
        }
    };

    const toggleAvailability = async (id: string, currentStatus: "Available" | "Sold Out") => {
        const nextStatus = currentStatus === "Available" ? "Sold Out" : "Available";
        try {
            await updateDoc(doc(db, "hotels", id), {
                availabilityStatus: nextStatus
            });
            setHotels(prev =>
                prev.map(h => (h.id === id ? { ...h, availabilityStatus: nextStatus } : h))
            );
        } catch (err) {
            console.error(err);
        }
    };

    const deleteHotel = async (id: string) => {
        const confirmDelete = confirm("Are you sure you want to delete this hotel?");
        if (!confirmDelete) return;

        try {
            await deleteDoc(doc(db, "hotels", id));
            setHotels(prev => prev.filter(h => h.id !== id));
            alert("Hotel deleted successfully.");
        } catch (err) {
            console.error(err);
            alert("Failed to delete hotel.");
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">Hotels Stay</h1>
                    <p className="mt-2 text-gray-400">Manage global hotel accommodations, pricing, rooms, and availability status.</p>
                </div>
                <Link
                    href="/admin/hotels/add"
                    className="flex items-center gap-2 rounded-xl bg-[#e68932] px-5 py-3 font-semibold text-white hover:bg-[#cf7726] transition active:scale-[0.98]"
                >
                    <Plus size={18} />
                    Add Hotel
                </Link>
            </div>

            {loading ? (
                <div className="text-white text-xl flex items-center gap-3 py-12">
                    <Loader2 className="w-6 h-6 animate-spin text-[#e68932]" />
                    <span>Loading Hotels List...</span>
                </div>
            ) : hotels.length === 0 ? (
                <div className="text-center py-20 border border-white/5 rounded-3xl bg-white/5">
                    <p className="text-gray-400 font-semibold">No hotels registered yet.</p>
                    <Link href="/admin/hotels/add" className="mt-4 inline-block bg-[#e68932] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#cf7726] transition">
                        Add Your First Hotel
                    </Link>
                </div>
            ) : (
                <div className="grid gap-4">
                    {hotels.map((hotel) => (
                        <div
                            key={hotel.id}
                            className="rounded-2xl border border-white/10 bg-white/5 p-5 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6"
                        >
                            <div>
                                <h2 className="text-xl font-semibold text-white">{hotel.name}</h2>
                                <p className="mt-1 text-gray-400 text-sm">
                                    {hotel.location} • {hotel.hotelType} • AED {hotel.price} / night
                                </p>
                                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                                    <span className={`rounded-full px-3 py-1 font-semibold ${
                                        hotel.active ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                                    }`}>
                                        {hotel.active ? "Active" : "Inactive"}
                                    </span>
                                    <span className={`rounded-full px-3 py-1 font-semibold ${
                                        hotel.availabilityStatus === "Available" ? "bg-blue-500/20 text-blue-400" : "bg-yellow-500/20 text-yellow-400"
                                    }`}>
                                        {hotel.availabilityStatus}
                                    </span>
                                    <span className="rounded-full bg-white/5 border border-white/10 px-3 py-1 text-gray-300">
                                        Rating: {hotel.rating}
                                    </span>
                                    <span className="rounded-full bg-white/5 border border-white/10 px-3 py-1 text-gray-300">
                                        Rooms: {hotel.roomCount || 0}
                                    </span>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2.5">
                                <Link
                                    href={`/hotels/${hotel.id}`}
                                    target="_blank"
                                    className="flex items-center gap-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 text-xs font-semibold text-gray-300 transition"
                                >
                                    <Eye size={14} />
                                    Preview
                                </Link>

                                <Link
                                    href={`/admin/hotels/edit/${hotel.id}`}
                                    className="flex items-center gap-1.5 rounded-xl bg-white/15 hover:bg-white/20 px-4 py-2 text-xs font-semibold text-white transition"
                                >
                                    <Edit size={14} />
                                    Edit
                                </Link>

                                <button
                                    onClick={() => toggleActive(hotel.id, hotel.active)}
                                    className="rounded-xl bg-green-500/10 hover:bg-green-500/20 border border-green-500/10 px-4 py-2 text-xs font-semibold text-green-400 transition"
                                >
                                    {hotel.active ? "Deactivate" : "Activate"}
                                </button>

                                <button
                                    onClick={() => toggleAvailability(hotel.id, hotel.availabilityStatus)}
                                    className="rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/10 px-4 py-2 text-xs font-semibold text-blue-400 transition"
                                >
                                    {hotel.availabilityStatus === "Available" ? "Mark Sold Out" : "Mark Available"}
                                </button>

                                <button
                                    onClick={() => deleteHotel(hotel.id)}
                                    className="flex items-center gap-1.5 rounded-xl bg-red-500/25 hover:bg-red-500/35 border border-red-500/10 px-4 py-2 text-xs font-semibold text-red-400 transition"
                                >
                                    <Trash2 size={14} />
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
