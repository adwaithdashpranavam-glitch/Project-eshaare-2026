"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, addDoc, onSnapshot } from "firebase/firestore";
import { Compass, Plus, Trash2, Tag, Calendar, Layout, DollarSign } from "lucide-react";

type ItineraryBlock = {
    dayNo: number;
    activityType: "Hotel" | "Transfer" | "Sightseeing" | "Flight";
    description: string;
    details: string;
};

type TourPlan = {
    id: string;
    packageName: string;
    destination: string;
    durationDays: number;
    costPrice: number;
    sellingPrice: number;
    blocks: ItineraryBlock[];
    createdAt: string;
};

export default function AdminTourPlannerPage() {
    const [plans, setPlans] = useState<TourPlan[]>([]);
    const [loading, setLoading] = useState(true);

    // Form builder state
    const [packageName, setPackageName] = useState("");
    const [destination, setDestination] = useState("");
    const [durationDays, setDurationDays] = useState(3);
    const [costPrice, setCostPrice] = useState(0);
    const [sellingPrice, setSellingPrice] = useState(0);

    const [blocks, setBlocks] = useState<ItineraryBlock[]>([
        { dayNo: 1, activityType: "Hotel", description: "Standard Room Booking", details: "Check-in at Ritz Carlton Dubai" }
    ]);

    useEffect(() => {
        const q = query(collection(db, "tourPlans"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data: TourPlan[] = [];
            snapshot.forEach((docSnap) => {
                const item = docSnap.data();
                data.push({
                    id: docSnap.id,
                    packageName: item.packageName || "",
                    destination: item.destination || "",
                    durationDays: Number(item.durationDays) || 3,
                    costPrice: Number(item.costPrice) || 0,
                    sellingPrice: Number(item.sellingPrice) || 0,
                    blocks: item.blocks || [],
                    createdAt: item.createdAt || new Date().toISOString(),
                });
            });
            data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            setPlans(data);
            setLoading(false);
        }, (error) => {
            console.error("Error reading tourPlans:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleAddBlock = () => {
        setBlocks([
            ...blocks,
            { dayNo: 1, activityType: "Sightseeing", description: "", details: "" }
        ]);
    };

    const handleRemoveBlock = (index: number) => {
        setBlocks(blocks.filter((_, i) => i !== index));
    };

    const handleBlockChange = (index: number, field: keyof ItineraryBlock, value: any) => {
        setBlocks(
            blocks.map((b, i) => {
                if (i === index) {
                    return { ...b, [field]: value };
                }
                return b;
            })
        );
    };

    const handleSavePlan = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!packageName || !destination || !sellingPrice) {
            alert("Package Name, Destination, and Selling Price are required.");
            return;
        }

        try {
            await addDoc(collection(db, "tourPlans"), {
                packageName,
                destination,
                durationDays: Number(durationDays) || 3,
                costPrice: Number(costPrice) || 0,
                sellingPrice: Number(sellingPrice) || 0,
                blocks,
                createdAt: new Date().toISOString(),
            });

            alert(`Tour plan "${packageName}" successfully saved!`);
            setPackageName("");
            setDestination("");
            setDurationDays(3);
            setCostPrice(0);
            setSellingPrice(0);
            setBlocks([{ dayNo: 1, activityType: "Hotel", description: "Standard Room Booking", details: "Check-in at Ritz Carlton Dubai" }]);
        } catch (error) {
            console.error("Error saving tour plan:", error);
            alert("Failed to save itinerary.");
        }
    };

    // Computations
    const margin = sellingPrice - costPrice;
    const marginPercent = costPrice > 0 ? Math.round((margin / costPrice) * 100) : 0;

    return (
        <div className="space-y-8 font-sans">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                    <Compass className="text-[#e68932]" />
                    Itinerary & Tour Planner
                </h1>
                <p className="mt-2 text-gray-400">Design detailed day-by-day travel itineraries, calculate profit markups, and manage destination packages.</p>
            </div>

            {/* Layout Grid */}
            <div className="grid gap-8 lg:grid-cols-3">
                {/* Left Side: Builder */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="rounded-3xl bg-white/5 p-6 border border-white/10 space-y-6">
                        <h2 className="text-xl font-bold text-white">Construct Package Itinerary</h2>

                        <div className="grid gap-4 md:grid-cols-3">
                            <div className="col-span-2 md:col-span-1">
                                <label className="text-xs text-gray-400 font-bold uppercase tracking-wider">Package Title</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Dubai Luxury Weekend"
                                    value={packageName}
                                    onChange={(e) => setPackageName(e.target.value)}
                                    className="mt-1 h-11 w-full rounded-xl border-none bg-white/5 px-4 text-sm text-white outline-none focus:bg-white/10"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-gray-400 font-bold uppercase tracking-wider">Target Destination</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Switzerland (CH)"
                                    value={destination}
                                    onChange={(e) => setDestination(e.target.value)}
                                    className="mt-1 h-11 w-full rounded-xl border-none bg-white/5 px-4 text-sm text-white outline-none focus:bg-white/10"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-gray-400 font-bold uppercase tracking-wider">Duration (Days)</label>
                                <input
                                    type="number"
                                    required
                                    min="1"
                                    value={durationDays || ""}
                                    onChange={(e) => setDurationDays(Number(e.target.value))}
                                    className="mt-1 h-11 w-full rounded-xl border-none bg-white/5 px-4 text-sm text-white outline-none focus:bg-white/10"
                                />
                            </div>
                        </div>

                        {/* Costing Margin Matrix */}
                        <div className="grid gap-4 md:grid-cols-3 bg-white/5 p-4 rounded-2xl border border-white/5">
                            <div>
                                <label className="text-[10px] text-gray-400 uppercase tracking-wider">Supplier Cost Price (AED)</label>
                                <input
                                    type="number"
                                    placeholder="0.00"
                                    value={costPrice || ""}
                                    onChange={(e) => setCostPrice(Number(e.target.value))}
                                    className="mt-1 h-9 w-full rounded-lg border-none bg-black/35 px-3 text-xs text-white outline-none"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] text-gray-400 uppercase tracking-wider">Sales Selling Price (AED)</label>
                                <input
                                    type="number"
                                    placeholder="0.00"
                                    value={sellingPrice || ""}
                                    onChange={(e) => setSellingPrice(Number(e.target.value))}
                                    className="mt-1 h-9 w-full rounded-lg border-none bg-black/35 px-3 text-xs text-white outline-none"
                                />
                            </div>
                            <div className="flex flex-col justify-end pl-2">
                                <span className="text-[10px] text-gray-500 uppercase">Markup Margin Profit</span>
                                <span className="text-sm font-bold text-green-400 mt-1">
                                    AED {margin.toLocaleString()} (+{marginPercent}%)
                                </span>
                            </div>
                        </div>

                        {/* Itinerary Steps */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between border-b border-white/5 pb-2">
                                <h3 className="text-xs font-semibold uppercase text-gray-400 tracking-wider">Itinerary Blocks</h3>
                                <button
                                    onClick={handleAddBlock}
                                    className="inline-flex items-center gap-1 text-xs text-[#e68932] font-semibold hover:underline"
                                >
                                    <Plus size={14} /> Add Block
                                </button>
                            </div>

                            <div className="space-y-4">
                                {blocks.map((block, idx) => (
                                    <div key={idx} className="bg-white/5 border border-white/5 rounded-2xl p-4 space-y-4 relative">
                                        <button
                                            onClick={() => handleRemoveBlock(idx)}
                                            className="absolute top-4 right-4 text-red-400 hover:text-red-300"
                                        >
                                            <Trash2 size={16} />
                                        </button>

                                        <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
                                            <div>
                                                <label className="text-[10px] text-gray-400 uppercase tracking-wider">Day Number</label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={block.dayNo}
                                                    onChange={(e) => handleBlockChange(idx, "dayNo", Number(e.target.value))}
                                                    className="mt-1 h-9 w-full rounded-lg border-none bg-white/5 px-2 text-xs text-white outline-none"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] text-gray-400 uppercase tracking-wider">Activity Category</label>
                                                <select
                                                    value={block.activityType}
                                                    onChange={(e) => handleBlockChange(idx, "activityType", e.target.value)}
                                                    className="mt-1 h-9 w-full rounded-lg border-none bg-white/5 px-2 text-xs text-white outline-none"
                                                >
                                                    <option value="Hotel" className="bg-[#071120]">Hotel</option>
                                                    <option value="Transfer" className="bg-[#071120]">Transfer</option>
                                                    <option value="Sightseeing" className="bg-[#071120]">Sightseeing</option>
                                                    <option value="Flight" className="bg-[#071120]">Flight</option>
                                                </select>
                                            </div>
                                            <div className="col-span-2">
                                                <label className="text-[10px] text-gray-400 uppercase tracking-wider">Activity Summary</label>
                                                <input
                                                    type="text"
                                                    placeholder="e.g. Eiffel Tower Evening Cruise"
                                                    value={block.description}
                                                    onChange={(e) => handleBlockChange(idx, "description", e.target.value)}
                                                    className="mt-1 h-9 w-full rounded-lg border-none bg-white/5 px-3 text-xs text-white outline-none"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-[10px] text-gray-400 uppercase tracking-wider">Description Details</label>
                                            <input
                                                type="text"
                                                placeholder="Enter full logistics description details..."
                                                value={block.details}
                                                onChange={(e) => handleBlockChange(idx, "details", e.target.value)}
                                                className="mt-1 h-9 w-full rounded-lg border-none bg-white/5 px-3 text-xs text-white outline-none"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side: Saved lists & controls */}
                <div className="space-y-6">
                    <div className="rounded-3xl bg-white/5 border border-white/10 p-6 space-y-4">
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Operations Console</h3>
                        <button
                            onClick={handleSavePlan}
                            className="w-full h-12 rounded-xl bg-[#e68932] text-white hover:opacity-90 font-semibold text-xs transition flex items-center justify-center gap-2"
                        >
                            Save Package Itinerary
                        </button>
                    </div>

                    {/* Presets List */}
                    <div className="rounded-3xl bg-white/5 border border-white/10 p-6 space-y-4 max-h-[450px] overflow-y-auto pr-1">
                        <h3 className="text-xs font-semibold uppercase text-gray-400 tracking-wider">Destination Presets</h3>
                        {loading ? (
                            <p className="text-xs text-gray-500">Loading tour presets...</p>
                        ) : plans.length === 0 ? (
                            <p className="text-xs text-gray-500">No itineraries created yet.</p>
                        ) : (
                            plans.map((p) => (
                                <div
                                    key={p.id}
                                    onClick={() => {
                                        setPackageName(p.packageName);
                                        setDestination(p.destination);
                                        setDurationDays(p.durationDays);
                                        setCostPrice(p.costPrice);
                                        setSellingPrice(p.sellingPrice);
                                        setBlocks(p.blocks);
                                    }}
                                    className="p-3 bg-white/5 border border-white/5 rounded-2xl text-xs space-y-2 hover:border-white/15 cursor-pointer transition"
                                >
                                    <div className="flex items-center justify-between font-bold text-white">
                                        <span>{p.packageName}</span>
                                        <span className="text-[#e68932]">AED {p.sellingPrice.toLocaleString()}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-[10px] text-gray-500">
                                        <span>{p.destination} ({p.durationDays} Days)</span>
                                        <span className="text-green-400">Profit: {Math.round(((p.sellingPrice - p.costPrice)/p.costPrice)*100)}%</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
