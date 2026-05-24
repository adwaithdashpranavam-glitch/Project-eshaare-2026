"use client";

import { useEffect, useState } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useRouter, useParams } from "next/navigation";

export default function EditPackagePage() {
    const router = useRouter();
    const params = useParams();

    const id = params.id as string;

    const [loading, setLoading] = useState(true);

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
        supplier: "",
    });

    useEffect(() => {
        async function fetchPackage() {
            if (!id) return;

            const ref = doc(db, "packages", id);
            const snap = await getDoc(ref);

            if (!snap.exists()) {
                alert("Package not found");
                setLoading(false);
                return;
            }

            const data = snap.data();

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
            });

            setLoading(false);
        }

        fetchPackage();
    }, [id]);

    function handleChange(
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) {
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
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        await updateDoc(doc(db, "packages", id), {
            ...form,
            seatsLeft: Number(form.seatsLeft || 0),
            updatedAt: new Date(),
        });

        alert("Package updated successfully");
        router.push("/admin/packages");
    }

    if (loading) {
        return <p className="text-white">Loading package details...</p>;
    }

    return (
        <div>
            <h1 className="text-3xl font-bold text-white">Edit Package</h1>

            <p className="mt-2 text-gray-400">
                Editing: {id}
            </p>

            <form
                onSubmit={handleSubmit}
                className="mt-8 grid gap-5 rounded-3xl border border-white/10 bg-white/5 p-6"
            >
                <input name="title" value={form.title} onChange={handleChange} placeholder="Package Title" className="rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white" />

                <input name="slug" value={form.slug} disabled className="rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-gray-400" />

                <input name="image" value={form.image} onChange={handleChange} placeholder="Image URL" className="rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white" />

                <input name="price" value={form.price} onChange={handleChange} placeholder="Price" className="rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white" />

                <input name="seasonalPrice" value={form.seasonalPrice} onChange={handleChange} placeholder="Seasonal Price" className="rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white" />

                <input name="duration" value={form.duration} onChange={handleChange} placeholder="Duration" className="rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white" />

                <input name="category" value={form.category} onChange={handleChange} placeholder="Category" className="rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white" />

                <input name="destination" value={form.destination} onChange={handleChange} placeholder="Destination" className="rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white" />

                <input name="offerText" value={form.offerText} onChange={handleChange} placeholder="Offer Text" className="rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white" />

                <input name="seasonTag" value={form.seasonTag} onChange={handleChange} placeholder="Season Tag" className="rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white" />

                <input name="supplier" value={form.supplier} onChange={handleChange} placeholder="Supplier Name" className="rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white" />

                <input name="seatsLeft" value={form.seatsLeft} onChange={handleChange} type="number" placeholder="Seats Left" className="rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white" />

                <textarea name="overview" value={form.overview} onChange={handleChange} placeholder="Overview" rows={5} className="rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white" />

                <div className="flex gap-6 text-white">
                    <label>
                        <input type="checkbox" name="featured" checked={form.featured} onChange={handleChange} className="mr-2" />
                        Featured
                    </label>

                    <label>
                        <input type="checkbox" name="active" checked={form.active} onChange={handleChange} className="mr-2" />
                        Active
                    </label>
                </div>

                <button type="submit" className="rounded-xl bg-[#e68932] px-6 py-3 font-semibold text-white">
                    Update Package
                </button>
            </form>
        </div>
    );
}