"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
    doc, 
    setDoc, 
    collection, 
    getDocs 
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Loader2 } from "lucide-react";

export default function AddPackagePage() {
    const router = useRouter();

    const [loading, setLoading] = useState(false);
    const [parentPackages, setParentPackages] = useState<any[]>([]);

    const [form, setForm] = useState({
        title: "",
        slug: "",
        image: "",
        price: "",
        seasonalPrice: "",
        duration: "",
        category: "",
        destination: "",
        featured: false,
        active: true,
        seatsLeft: "",
        offerText: "",
        seasonTag: "",
        overview: "",
        gallery: "",
        itinerary: "",
        inclusions: "",
        exclusions: "",
        supplier: "",
        parentId: "", // New hierarchical reference
        isPromoOffer: false,
        promoTitle: "",
        promoDescription: "",
        promoDiscountText: "",
        promoExpiryDate: "",
    });

    useEffect(() => {
        async function fetchParents() {
            try {
                const snap = await getDocs(collection(db, "packages"));
                const list = snap.docs.map(docItem => ({
                    id: docItem.id,
                    title: docItem.data().title || docItem.id
                }));
                setParentPackages(list);
            } catch (err) {
                console.error("Error loading parent packages:", err);
            }
        }
        fetchParents();
    }, []);

    function handleChange(
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) {
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
                    if (!next.promoTitle) next.promoTitle = prev.title;
                    if (!next.promoDescription) next.promoDescription = prev.overview;
                    if (!next.promoDiscountText) next.promoDiscountText = prev.offerText;
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
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        try {
            setLoading(true);

            const slug =
                form.slug ||
                form.title
                    .toLowerCase()
                    .replace(/\s+/g, "-")
                    .replace(/[^a-z0-9-]/g, "");

            await setDoc(
                doc(db, "packages", slug),
                {
                    title: form.title,
                    slug,
                    image: form.image,
                    price: form.price,
                    seasonalPrice: form.seasonalPrice,
                    duration: form.duration,
                    category: form.category,
                    destination: form.destination,
                    featured: form.featured,
                    active: form.active,
                    seatsLeft: Number(form.seatsLeft || 0),
                    offerText: form.offerText,
                    seasonTag: form.seasonTag,
                    overview: form.overview,
                    supplier: form.supplier,
                    parentId: form.parentId || "",
                    gallery: form.gallery
                        ? form.gallery.split(",").map((item) => item.trim()).filter(Boolean)
                        : [],
                    itinerary: form.itinerary
                        ? form.itinerary.split("\n").map((item) => item.trim()).filter(Boolean)
                        : [],
                    inclusions: form.inclusions
                        ? form.inclusions.split("\n").map((item) => item.trim()).filter(Boolean)
                        : [],
                    exclusions: form.exclusions
                        ? form.exclusions.split("\n").map((item) => item.trim()).filter(Boolean)
                        : [],
                    createdAt: new Date(),
                }
            );

            // Sync with offers collection
            if (form.isPromoOffer) {
                await setDoc(doc(db, "offers", `pkg-${slug}`), {
                    id: `pkg-${slug}`,
                    title: form.promoTitle || form.title,
                    description: form.promoDescription || form.overview,
                    discountText: form.promoDiscountText || form.offerText || "Deal",
                    offerType: "package",
                    expiryDate: form.promoExpiryDate || new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
                    targetUrl: `/packages/${slug}`,
                    image: form.image,
                    active: true,
                    referenceId: slug,
                    referenceType: "package",
                    createdAt: new Date(),
                });
            }

            alert("Package added successfully");
            router.push("/admin/packages");

        } catch (error) {
            console.log(error);
            alert("Something went wrong");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-white">Add Package</h1>
                <p className="mt-2 text-gray-400">Create a new tourism package or child sub-package.</p>
            </div>

            <form
                onSubmit={handleSubmit}
                className="mt-8 grid gap-5 rounded-3xl border border-white/10 bg-white/5 p-6 text-white max-w-4xl"
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-400">Package Title</label>
                        <input
                            name="title"
                            value={form.title}
                            onChange={handleChange}
                            required
                            placeholder="e.g. Ooty Holiday Package"
                            className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:border-[#e68932] text-sm"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-400">Slug (optional)</label>
                        <input
                            name="slug"
                            value={form.slug}
                            onChange={handleChange}
                            placeholder="e.g. ooty-package"
                            className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:border-[#e68932] text-sm"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-400">Parent Package (for Nesting/Hierarchies)</label>
                        <select
                            name="parentId"
                            value={form.parentId}
                            onChange={handleChange}
                            className="w-full rounded-xl border border-white/10 bg-[#071120] px-4 py-3 text-white outline-none focus:border-[#e68932] text-sm"
                        >
                            <option value="">No Parent (Top-Level Destination, e.g. India)</option>
                            {parentPackages.map((p) => (
                                <option key={p.id} value={p.id}>
                                    {p.title} ({p.id})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-400">Main Image URL</label>
                        <input
                            name="image"
                            value={form.image}
                            onChange={handleChange}
                            required
                            placeholder="https://..."
                            className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:border-[#e68932] text-sm"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-400">Price (AED)</label>
                        <input
                            name="price"
                            value={form.price}
                            onChange={handleChange}
                            required
                            placeholder="e.g. AED 1,400"
                            className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:border-[#e68932] text-sm"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-400">Seasonal Price (AED)</label>
                        <input
                            name="seasonalPrice"
                            value={form.seasonalPrice}
                            onChange={handleChange}
                            placeholder="e.g. AED 1,800"
                            className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:border-[#e68932] text-sm"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-400">Duration</label>
                        <input
                            name="duration"
                            value={form.duration}
                            onChange={handleChange}
                            required
                            placeholder="e.g. 5 Days / 4 Nights"
                            className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:border-[#e68932] text-sm"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-400">Category Tag</label>
                        <input
                            name="category"
                            value={form.category}
                            onChange={handleChange}
                            placeholder="e.g. Honeymoon, Luxury, Adventure"
                            className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:border-[#e68932] text-sm"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-400">Destination</label>
                        <input
                            name="destination"
                            value={form.destination}
                            onChange={handleChange}
                            placeholder="e.g. Madurai, Tamil Nadu"
                            className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:border-[#e68932] text-sm"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-400">Offer Badge Text</label>
                        <input
                            name="offerText"
                            value={form.offerText}
                            onChange={handleChange}
                            placeholder="e.g. 15% OFF, Buy 1 Get 1"
                            className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:border-[#e68932] text-sm"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-400">Season Tag</label>
                        <input
                            name="seasonTag"
                            value={form.seasonTag}
                            onChange={handleChange}
                            placeholder="e.g. Winter 2026, Summer Special"
                            className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:border-[#e68932] text-sm"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-400">Supplier Name</label>
                        <input
                            name="supplier"
                            value={form.supplier}
                            onChange={handleChange}
                            placeholder="e.g. Eshaare Local Operator"
                            className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:border-[#e68932] text-sm"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-400">Seats Left</label>
                        <input
                            name="seatsLeft"
                            value={form.seatsLeft}
                            onChange={handleChange}
                            type="number"
                            placeholder="e.g. 12"
                            className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:border-[#e68932] text-sm"
                        />
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-400">Overview / Summary</label>
                    <textarea
                        name="overview"
                        value={form.overview}
                        onChange={handleChange}
                        placeholder="Detailed overview description..."
                        rows={4}
                        className="w-full rounded-xl border border-white/10 bg-black/40 p-4 text-white outline-none focus:border-[#e68932] text-sm"
                    />
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-400">Gallery Image URLs (comma separated)</label>
                    <textarea
                        name="gallery"
                        value={form.gallery}
                        onChange={handleChange}
                        placeholder="https://img1.jpg, https://img2.jpg"
                        rows={3}
                        className="w-full rounded-xl border border-white/10 bg-black/40 p-4 text-white outline-none focus:border-[#e68932] text-sm"
                    />
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-400">Itinerary Description Steps (one per line)</label>
                    <textarea
                        name="itinerary"
                        value={form.itinerary}
                        onChange={handleChange}
                        placeholder="Day 1: Arrival & Hotel Check-in&#10;Day 2: City Tours & Sightseeing"
                        rows={4}
                        className="w-full rounded-xl border border-white/10 bg-black/40 p-4 text-white outline-none focus:border-[#e68932] text-sm"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-400">Inclusions (one per line)</label>
                        <textarea
                            name="inclusions"
                            value={form.inclusions}
                            onChange={handleChange}
                            placeholder="Complimentary airport transfer&#10;Daily breakfast buffet"
                            rows={3}
                            className="w-full rounded-xl border border-white/10 bg-black/40 p-4 text-white outline-none focus:border-[#e68932] text-sm"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-400">Exclusions (one per line)</label>
                        <textarea
                            name="exclusions"
                            value={form.exclusions}
                            onChange={handleChange}
                            placeholder="Extra meals & laundry fees&#10;Entry visa application costs"
                            rows={3}
                            className="w-full rounded-xl border border-white/10 bg-black/40 p-4 text-white outline-none focus:border-[#e68932] text-sm"
                        />
                    </div>
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
                                    <label className="text-xs font-semibold text-gray-400">Promo Discount Badge (e.g. 15% DISCOUNT, AED 800 OFF)</label>
                                    <input
                                        name="promoDiscountText"
                                        value={form.promoDiscountText}
                                        onChange={handleChange}
                                        required={form.isPromoOffer}
                                        placeholder="e.g. AED 500 OFF"
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

                <div className="flex gap-6 text-white pt-3 border-t border-white/10">
                    <label className="flex items-center cursor-pointer select-none text-sm font-semibold">
                        <input
                            type="checkbox"
                            name="featured"
                            checked={form.featured}
                            onChange={handleChange}
                            className="mr-2 h-4.5 w-4.5 accent-[#e68932]"
                        />
                        Featured Package
                    </label>

                    <label className="flex items-center cursor-pointer select-none text-sm font-semibold">
                        <input
                            type="checkbox"
                            name="active"
                            checked={form.active}
                            onChange={handleChange}
                            className="mr-2 h-4.5 w-4.5 accent-[#e68932]"
                        />
                        Active Package
                    </label>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 rounded-xl bg-[#e68932] text-white font-bold hover:bg-[#cf7726] transition flex items-center justify-center gap-2 mt-4 cursor-pointer"
                >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Create Package"}
                </button>
            </form>
        </div>
    );
}