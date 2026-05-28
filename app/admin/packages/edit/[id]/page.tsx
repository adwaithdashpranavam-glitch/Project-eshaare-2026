"use client";

import { useEffect, useState } from "react";
import { doc, getDoc, updateDoc, setDoc, collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useRouter, useParams } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function EditPackagePage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
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
        parentId: "",
        isPromoOffer: false,
        promoTitle: "",
        promoDescription: "",
        promoDiscountText: "",
        promoExpiryDate: "",
    });

    useEffect(() => {
        async function loadParentsAndPackage() {
            if (!id) return;
            try {
                // 1. Fetch parent packages
                const parentSnap = await getDocs(collection(db, "packages"));
                const parentList = parentSnap.docs
                    .filter(docItem => docItem.id !== id) // Prevent cyclic dependency
                    .map(docItem => ({
                        id: docItem.id,
                        title: docItem.data().title || docItem.id
                    }));
                setParentPackages(parentList);

                // 2. Fetch target package details
                const ref = doc(db, "packages", id);
                const snap = await getDoc(ref);
                if (!snap.exists()) {
                    alert("Package not found");
                    router.push("/admin/packages");
                    return;
                }

                const data = snap.data();

                // 3. Fetch corresponding promo offer details if any
                let isPromo = false;
                let promoTitle = "";
                let promoDesc = "";
                let promoDiscount = "";
                let promoExpiry = "";
                try {
                    const offerSnap = await getDoc(doc(db, "offers", `pkg-${id}`));
                    if (offerSnap.exists()) {
                        const offerData = offerSnap.data();
                        isPromo = offerData.active || false;
                        promoTitle = offerData.title || "";
                        promoDesc = offerData.description || "";
                        promoDiscount = offerData.discountText || "";
                        promoExpiry = offerData.expiryDate || "";
                    }
                } catch (offerErr) {
                    console.error("Error fetching corresponding offer:", offerErr);
                }

                setForm({
                    title: data.title || "",
                    slug: data.slug || id,
                    image: data.image || "",
                    price: data.price || "",
                    seasonalPrice: data.seasonalPrice || "",
                    duration: data.duration || "",
                    category: data.category || "",
                    destination: data.destination || "",
                    featured: data.featured || false,
                    active: data.active ?? true,
                    seatsLeft: String(data.seatsLeft || ""),
                    offerText: data.offerText || "",
                    seasonTag: data.seasonTag || "",
                    overview: data.overview || "",
                    supplier: data.supplier || "",
                    parentId: data.parentId || "",
                    gallery: data.gallery ? data.gallery.join(", ") : "",
                    itinerary: data.itinerary ? data.itinerary.join("\n") : "",
                    inclusions: data.inclusions ? data.inclusions.join("\n") : "",
                    exclusions: data.exclusions ? data.exclusions.join("\n") : "",
                    isPromoOffer: isPromo,
                    promoTitle: promoTitle || data.title || "",
                    promoDescription: promoDesc || data.overview || "",
                    promoDiscountText: promoDiscount || data.offerText || "",
                    promoExpiryDate: promoExpiry || "",
                });
            } catch (err) {
                console.error("Error loading package edit details:", err);
            } finally {
                setLoading(false);
            }
        }
        loadParentsAndPackage();
    }, [id, router]);

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
            setSaving(true);
            await updateDoc(doc(db, "packages", id), {
                title: form.title,
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
                gallery: form.gallery ? form.gallery.split(",").map((s) => s.trim()).filter(Boolean) : [],
                itinerary: form.itinerary ? form.itinerary.split("\n").map((s) => s.trim()).filter(Boolean) : [],
                inclusions: form.inclusions ? form.inclusions.split("\n").map((s) => s.trim()).filter(Boolean) : [],
                exclusions: form.exclusions ? form.exclusions.split("\n").map((s) => s.trim()).filter(Boolean) : [],
                updatedAt: new Date(),
            });

            // Sync with offers collection
            if (form.isPromoOffer) {
                await setDoc(doc(db, "offers", `pkg-${id}`), {
                    id: `pkg-${id}`,
                    title: form.promoTitle || form.title,
                    description: form.promoDescription || form.overview,
                    discountText: form.promoDiscountText || form.offerText || "Deal",
                    offerType: "package",
                    expiryDate: form.promoExpiryDate || new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
                    targetUrl: `/packages/${form.slug || id}`,
                    image: form.image,
                    active: true,
                    referenceId: id,
                    referenceType: "package",
                    updatedAt: new Date(),
                });
            } else {
                // If it is unchecked, update the active state to false in the offers collection
                await setDoc(doc(db, "offers", `pkg-${id}`), {
                    active: false,
                    updatedAt: new Date(),
                }, { merge: true });
            }

            alert("Package updated successfully");
            router.push("/admin/packages");
        } catch (error) {
            console.error(error);
            alert("Something went wrong");
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return (
            <div className="text-white text-xl flex items-center gap-3 py-12">
                <Loader2 className="w-6 h-6 animate-spin text-[#e68932]" />
                <span>Loading Package Details...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-white">Edit Package</h1>
                <p className="mt-2 text-gray-400">Modify properties of package: {id}</p>
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
                            className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:border-[#e68932] text-sm"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-400">Slug (Read-only)</label>
                        <input
                            name="slug"
                            value={form.slug}
                            disabled
                            className="w-full rounded-xl border border-white/5 bg-black/60 px-4 py-3 text-gray-400 outline-none text-sm cursor-not-allowed"
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
                            <option value="">No Parent (Top-Level Destination)</option>
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
                            className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:border-[#e68932] text-sm"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-400">Seasonal Price (AED)</label>
                        <input
                            name="seasonalPrice"
                            value={form.seasonalPrice}
                            onChange={handleChange}
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
                            className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:border-[#e68932] text-sm"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-400">Destination</label>
                        <input
                            name="destination"
                            value={form.destination}
                            onChange={handleChange}
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
                            className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:border-[#e68932] text-sm"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-400">Season Tag</label>
                        <input
                            name="seasonTag"
                            value={form.seasonTag}
                            onChange={handleChange}
                            className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:border-[#e68932] text-sm"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-400">Supplier Name</label>
                        <input
                            name="supplier"
                            value={form.supplier}
                            onChange={handleChange}
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
                        rows={3}
                        className="w-full rounded-xl border border-white/10 bg-black/40 p-4 text-white outline-none focus:border-[#e68932] text-sm"
                    />
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-400">Itinerary Steps (one per line)</label>
                    <textarea
                        name="itinerary"
                        value={form.itinerary}
                        onChange={handleChange}
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
                    disabled={saving}
                    className="w-full h-12 rounded-xl bg-[#e68932] text-white font-bold hover:bg-[#cf7726] transition flex items-center justify-center gap-2 mt-4 cursor-pointer"
                >
                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save Changes"}
                </button>
            </form>
        </div>
    );
}