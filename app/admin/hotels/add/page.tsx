"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Loader2 } from "lucide-react";

export default function AddHotelPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        name: "",
        location: "",
        price: "",
        hotelType: "Luxury Hotels",
        image: "",
        gallery: "",
        roomCount: "",
        extraBed: false,
        mealType: "Breakfast Included",
        amenities: "",
        rating: "4.8",
        nearbyAttractions: "",
        offers: "",
        availabilityStatus: "Available",
        active: true,
        description: "",
        isPromoOffer: false,
        promoTitle: "",
        promoDescription: "",
        promoDiscountText: "",
        promoExpiryDate: "",
    });

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value, type } = e.target;
        if (type === "checkbox") {
            const checked = (e.target as HTMLInputElement).checked;
            setForm((prev) => {
                const next = {
                    ...prev,
                    [name]: checked,
                };
                // Automatically pre-fill fields when turning promo offer on
                if (name === "isPromoOffer" && checked) {
                    if (!next.promoTitle) next.promoTitle = prev.name;
                    if (!next.promoDescription) next.promoDescription = prev.description;
                    if (!next.promoDiscountText) next.promoDiscountText = prev.offers;
                    if (!next.promoExpiryDate) {
                        const tenDays = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000);
                        next.promoExpiryDate = tenDays.toISOString().split("T")[0];
                    }
                }
                return next;
            });
            return;
        }

        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name || !form.location || !form.price || !form.image) {
            alert("Please fill out Name, Location, Price, and Main Image URL.");
            return;
        }

        try {
            setLoading(true);
            const hotelId = form.name.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-");

            await setDoc(doc(db, "hotels", hotelId), {
                id: hotelId,
                name: form.name,
                location: form.location,
                price: form.price,
                hotelType: form.hotelType,
                image: form.image,
                gallery: form.gallery ? form.gallery.split(",").map((s) => s.trim()) : [],
                roomCount: Number(form.roomCount || 0),
                extraBed: form.extraBed,
                mealType: form.mealType,
                amenities: form.amenities ? form.amenities.split(",").map((s) => s.trim()) : [],
                rating: form.rating,
                nearbyAttractions: form.nearbyAttractions ? form.nearbyAttractions.split("\n").map((s) => s.trim()) : [],
                offers: form.offers,
                availabilityStatus: form.availabilityStatus,
                active: form.active,
                description: form.description,
                createdAt: new Date(),
            });

            // Sync with offers collection
            if (form.isPromoOffer) {
                await setDoc(doc(db, "offers", `hotel-${hotelId}`), {
                    id: `hotel-${hotelId}`,
                    title: form.promoTitle || form.name,
                    description: form.promoDescription || form.description,
                    discountText: form.promoDiscountText || form.offers || "Offer",
                    offerType: "hotel",
                    expiryDate: form.promoExpiryDate || new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
                    targetUrl: `/hotels/${hotelId}`,
                    image: form.image,
                    active: true,
                    referenceId: hotelId,
                    referenceType: "hotel",
                    createdAt: new Date(),
                });
            }

            alert("Hotel created successfully!");
            router.push("/admin/hotels");
        } catch (err) {
            console.error("Error creating hotel:", err);
            alert("An error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-white">Add New Hotel</h1>
                <p className="mt-2 text-gray-400">Register a new hotel accommodation on the platform.</p>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 grid gap-5 rounded-3xl border border-white/10 bg-white/5 p-6 text-white max-w-4xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-400">Hotel Name</label>
                        <input
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            required
                            placeholder="e.g. Burj Al Arab"
                            className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:border-[#e68932] text-sm"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-400">Location</label>
                        <input
                            name="location"
                            value={form.location}
                            onChange={handleChange}
                            required
                            placeholder="e.g. Dubai, UAE"
                            className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:border-[#e68932] text-sm"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-400">Pricing per night</label>
                        <input
                            name="price"
                            value={form.price}
                            onChange={handleChange}
                            required
                            placeholder="e.g. AED 1,200"
                            className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:border-[#e68932] text-sm"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-400">Hotel Type</label>
                        <select
                            name="hotelType"
                            value={form.hotelType}
                            onChange={handleChange}
                            className="w-full rounded-xl border border-white/10 bg-[#071120] px-4 py-3 text-white outline-none focus:border-[#e68932] text-sm"
                        >
                            <option value="Luxury Hotels">Luxury Hotels</option>
                            <option value="Resorts">Resorts</option>
                            <option value="Villas">Villas</option>
                            <option value="Family Resorts">Family Resorts</option>
                        </select>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-400">Rating</label>
                        <input
                            name="rating"
                            value={form.rating}
                            onChange={handleChange}
                            placeholder="e.g. 4.9 (240 reviews)"
                            className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:border-[#e68932] text-sm"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-400">Main Image URL</label>
                        <input
                            name="image"
                            value={form.image}
                            onChange={handleChange}
                            required
                            placeholder="https://images.unsplash.com/..."
                            className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:border-[#e68932] text-sm"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-400">Room Count</label>
                        <input
                            name="roomCount"
                            type="number"
                            value={form.roomCount}
                            onChange={handleChange}
                            placeholder="e.g. 150"
                            className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:border-[#e68932] text-sm"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-400">Meal Option Type</label>
                        <input
                            name="mealType"
                            value={form.mealType}
                            onChange={handleChange}
                            placeholder="e.g. Half Board, All Inclusive"
                            className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:border-[#e68932] text-sm"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-400">Special Promo Offer</label>
                        <input
                            name="offers"
                            value={form.offers}
                            onChange={handleChange}
                            placeholder="e.g. 15% discount for GCC residents"
                            className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:border-[#e68932] text-sm"
                        />
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-400">Gallery Image URLs (comma separated)</label>
                    <textarea
                        name="gallery"
                        value={form.gallery}
                        onChange={handleChange}
                        placeholder="https://image1.jpg, https://image2.jpg"
                        rows={3}
                        className="w-full rounded-xl border border-white/10 bg-black/40 p-4 text-white outline-none focus:border-[#e68932] text-sm"
                    />
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-400">Amenities (comma separated)</label>
                    <input
                        name="amenities"
                        value={form.amenities}
                        onChange={handleChange}
                        placeholder="Free Wi-Fi, Private Beach, Infinity Pool, Gym"
                        className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:border-[#e68932] text-sm"
                    />
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-400">Nearby Attractions (one per line)</label>
                    <textarea
                        name="nearbyAttractions"
                        value={form.nearbyAttractions}
                        onChange={handleChange}
                        placeholder="Dubai Mall (10 mins walk)&#10;Burj Khalifa (12 mins walk)"
                        rows={3}
                        className="w-full rounded-xl border border-white/10 bg-black/40 p-4 text-white outline-none focus:border-[#e68932] text-sm"
                    />
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-400">Hotel Overview / Description</label>
                    <textarea
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        placeholder="Provide details about the stay features, environment, services..."
                        rows={4}
                        className="w-full rounded-xl border border-white/10 bg-black/40 p-4 text-white outline-none focus:border-[#e68932] text-sm"
                    />
                </div>

                {/* Promotional Offer Fields Section */}
                <div className="border-t border-white/10 pt-5 space-y-4">
                    <h3 className="text-lg font-bold text-white">Promotional Flash Deal (Home Page Banner)</h3>
                    <label className="flex items-center cursor-pointer select-none text-sm font-semibold">
                        <input
                            type="checkbox"
                            name="isPromoOffer"
                            checked={form.isPromoOffer}
                            onChange={handleChange}
                            className="mr-2 h-5 w-5 accent-[#e68932]"
                        />
                        Activate as Homepage Promotional Flash Offer
                    </label>
                    
                    {form.isPromoOffer && (
                        <div className="grid gap-5 p-5 rounded-2xl bg-white/5 border border-white/10 animate-in fade-in slide-in-from-top-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-gray-400">Promo Discount Badge (e.g. 15% DISCOUNT, AED 300 OFF)</label>
                                    <input
                                        name="promoDiscountText"
                                        value={form.promoDiscountText}
                                        onChange={handleChange}
                                        required={form.isPromoOffer}
                                        placeholder="e.g. 15% DISCOUNT"
                                        className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:border-[#e68932] text-sm"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-gray-400">Promo Expiry Date (Countdown Timer End)</label>
                                    <input
                                        type="date"
                                        name="promoExpiryDate"
                                        value={form.promoExpiryDate}
                                        onChange={handleChange}
                                        required={form.isPromoOffer}
                                        className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:border-[#e68932] text-sm [color-scheme:dark]"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-400">Promo Card Title</label>
                                <input
                                    name="promoTitle"
                                    value={form.promoTitle}
                                    onChange={handleChange}
                                    required={form.isPromoOffer}
                                    className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:border-[#e68932] text-sm"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-400">Promo Card Description</label>
                                <textarea
                                    name="promoDescription"
                                    value={form.promoDescription}
                                    onChange={handleChange}
                                    required={form.isPromoOffer}
                                    rows={2}
                                    className="w-full rounded-xl border border-white/10 bg-black/40 p-4 text-white outline-none focus:border-[#e68932] text-sm"
                                />
                            </div>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-3 border-t border-white/10">
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-400">Availability Status</label>
                        <select
                            name="availabilityStatus"
                            value={form.availabilityStatus}
                            onChange={handleChange}
                            className="w-full rounded-xl border border-white/10 bg-[#071120] px-4 py-3 text-white outline-none focus:border-[#e68932] text-sm"
                        >
                            <option value="Available">Available</option>
                            <option value="Sold Out">Sold Out</option>
                        </select>
                    </div>

                    <div className="flex items-center pt-5">
                        <label className="flex items-center cursor-pointer select-none text-sm font-semibold">
                            <input
                                type="checkbox"
                                name="extraBed"
                                checked={form.extraBed}
                                onChange={handleChange}
                                className="mr-2 h-4.5 w-4.5 accent-[#e68932]"
                            />
                            Extra Bed Available
                        </label>
                    </div>

                    <div className="flex items-center pt-5">
                        <label className="flex items-center cursor-pointer select-none text-sm font-semibold">
                            <input
                                type="checkbox"
                                name="active"
                                checked={form.active}
                                onChange={handleChange}
                                className="mr-2 h-4.5 w-4.5 accent-[#e68932]"
                            />
                            Active Status
                        </label>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 rounded-xl bg-[#e68932] text-white font-bold hover:bg-[#cf7726] transition flex items-center justify-center gap-2 mt-4 cursor-pointer"
                >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Register Hotel"}
                </button>
            </form>
        </div>
    );
}
