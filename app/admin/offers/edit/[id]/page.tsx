"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Loader2 } from "lucide-react";

export default function EditOfferPage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [form, setForm] = useState({
        title: "",
        description: "",
        discountText: "",
        offerType: "package",
        expiryDate: "",
        targetUrl: "",
        image: "",
        active: true,
    });

    useEffect(() => {
        const fetchOffer = async () => {
            if (!id) return;
            try {
                const snap = await getDoc(doc(db, "offers", id));
                if (!snap.exists()) {
                    alert("Offer not found");
                    router.push("/admin/offers");
                    return;
                }
                const data = snap.data();
                setForm({
                    title: data.title || "",
                    description: data.description || "",
                    discountText: data.discountText || "",
                    offerType: data.offerType || "package",
                    expiryDate: data.expiryDate || "",
                    targetUrl: data.targetUrl || "/",
                    image: data.image || "",
                    active: data.active ?? true,
                });
            } catch (err) {
                console.error("Error fetching offer detail:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchOffer();
    }, [id, router]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value, type } = e.target;
        if (type === "checkbox") {
            setForm((prev) => ({
                ...prev,
                [name]: (e.target as HTMLInputElement).checked,
            }));
            return;
        }

        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.title || !form.discountText || !form.expiryDate || !form.image) {
            alert("Please fill in Title, Discount Value, Expiry Date, and Image URL.");
            return;
        }

        try {
            setSaving(true);
            await updateDoc(doc(db, "offers", id), {
                title: form.title,
                description: form.description,
                discountText: form.discountText,
                offerType: form.offerType,
                expiryDate: form.expiryDate,
                targetUrl: form.targetUrl || "/",
                image: form.image,
                active: form.active,
                updatedAt: new Date(),
            });

            alert("Offer updated successfully!");
            router.push("/admin/offers");
        } catch (err) {
            console.error("Error updating offer:", err);
            alert("Something went wrong. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="text-white text-xl flex items-center gap-3 py-12">
                <Loader2 className="w-6 h-6 animate-spin text-[#e68932]" />
                <span>Loading Offer Data...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-white">Edit Offer</h1>
                <p className="mt-2 text-gray-400">Modify properties of campaign: {id}</p>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 grid gap-5 rounded-3xl border border-white/10 bg-white/5 p-6 text-white max-w-4xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-400">Offer Title</label>
                        <input
                            name="title"
                            value={form.title}
                            onChange={handleChange}
                            required
                            className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:border-[#e68932] text-sm"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-400">Discount/Promo Label</label>
                        <input
                            name="discountText"
                            value={form.discountText}
                            onChange={handleChange}
                            required
                            className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:border-[#e68932] text-sm"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-400">Offer Type</label>
                        <select
                            name="offerType"
                            value={form.offerType}
                            onChange={handleChange}
                            className="w-full rounded-xl border border-white/10 bg-[#071120] px-4 py-3 text-white outline-none focus:border-[#e68932] text-sm"
                        >
                            <option value="hotel">Hotel Deal</option>
                            <option value="package">Package Deal</option>
                            <option value="event">Event Deal</option>
                            <option value="visa">Visa Service Deal</option>
                            <option value="seasonal">Seasonal Promo</option>
                        </select>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-400">Expiry Date</label>
                        <input
                            name="expiryDate"
                            type="date"
                            value={form.expiryDate}
                            onChange={handleChange}
                            required
                            className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:border-[#e68932] text-sm [color-scheme:dark]"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-400">Target Action URL</label>
                        <input
                            name="targetUrl"
                            value={form.targetUrl}
                            onChange={handleChange}
                            className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:border-[#e68932] text-sm"
                        />
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-400">Image Cover URL</label>
                    <input
                        name="image"
                        value={form.image}
                        onChange={handleChange}
                        required
                        className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:border-[#e68932] text-sm"
                    />
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-400">Offer Subtitle / Description</label>
                    <textarea
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        rows={3}
                        className="w-full rounded-xl border border-white/10 bg-black/40 p-4 text-white outline-none focus:border-[#e68932] text-sm"
                    />
                </div>

                <div className="flex items-center pt-3 border-t border-white/10">
                    <label className="flex items-center cursor-pointer select-none text-sm font-semibold">
                        <input
                            type="checkbox"
                            name="active"
                            checked={form.active}
                            onChange={handleChange}
                            className="mr-2 h-4.5 w-4.5 accent-[#e68932]"
                        />
                        Active (Visible on homepage)
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
