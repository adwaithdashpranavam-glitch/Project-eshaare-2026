"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import {
    doc,
    setDoc,
} from "firebase/firestore";

import { db } from "@/lib/firebase";

export default function AddPackagePage() {
    const router = useRouter();

    const [loading, setLoading] = useState(false);

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
    });

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

    async function handleSubmit(
        e: React.FormEvent
    ) {
        e.preventDefault();

        try {
            setLoading(true);

            const slug =
                form.slug ||
                form.title
                    .toLowerCase()
                    .replace(/\s+/g, "-");

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

                    gallery: form.gallery
                        .split(",")
                        .map((item) => item.trim()),

                    itinerary: form.itinerary
                        .split("\n")
                        .map((item) => item.trim()),

                    inclusions: form.inclusions
                        .split("\n")
                        .map((item) => item.trim()),

                    exclusions: form.exclusions
                        .split("\n")
                        .map((item) => item.trim()),

                    createdAt: new Date(),
                }
            );

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
        <div>
            <h1 className="text-3xl font-bold text-white">
                Add Package
            </h1>

            <p className="mt-2 text-gray-400">
                Create a new tourism package
            </p>

            <form
                onSubmit={handleSubmit}
                className="mt-8 grid gap-5 rounded-3xl border border-white/10 bg-white/5 p-6"
            >

                <input
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    placeholder="Package Title"
                    className="rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white"
                />

                <input
                    name="slug"
                    value={form.slug}
                    onChange={handleChange}
                    placeholder="Slug (optional)"
                    className="rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white"
                />

                <input
                    name="image"
                    value={form.image}
                    onChange={handleChange}
                    placeholder="Main Image URL"
                    className="rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white"
                />

                <input
                    name="price"
                    value={form.price}
                    onChange={handleChange}
                    placeholder="Price"
                    className="rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white"
                />

                <input
                    name="seasonalPrice"
                    value={form.seasonalPrice}
                    onChange={handleChange}
                    placeholder="Seasonal Price"
                    className="rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white"
                />

                <input
                    name="duration"
                    value={form.duration}
                    onChange={handleChange}
                    placeholder="Duration"
                    className="rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white"
                />

                <input
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    placeholder="Category"
                    className="rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white"
                />

                <input
                    name="destination"
                    value={form.destination}
                    onChange={handleChange}
                    placeholder="Destination"
                    className="rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white"
                />

                <input
                    name="offerText"
                    value={form.offerText}
                    onChange={handleChange}
                    placeholder="Offer Text"
                    className="rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white"
                />

                <input
                    name="seasonTag"
                    value={form.seasonTag}
                    onChange={handleChange}
                    placeholder="Season Tag"
                    className="rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white"
                />

                <input
                    name="seatsLeft"
                    value={form.seatsLeft}
                    onChange={handleChange}
                    type="number"
                    placeholder="Seats Left"
                    className="rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white"
                />

                <textarea
                    name="overview"
                    value={form.overview}
                    onChange={handleChange}
                    placeholder="Overview"
                    rows={5}
                    className="rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white"
                />

                <textarea
                    name="gallery"
                    value={form.gallery}
                    onChange={handleChange}
                    placeholder="Gallery URLs (comma separated)"
                    rows={4}
                    className="rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white"
                />

                <textarea
                    name="itinerary"
                    value={form.itinerary}
                    onChange={handleChange}
                    placeholder="Itinerary (one per line)"
                    rows={5}
                    className="rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white"
                />

                <textarea
                    name="inclusions"
                    value={form.inclusions}
                    onChange={handleChange}
                    placeholder="Inclusions (one per line)"
                    rows={4}
                    className="rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white"
                />

                <textarea
                    name="exclusions"
                    value={form.exclusions}
                    onChange={handleChange}
                    placeholder="Exclusions (one per line)"
                    rows={4}
                    className="rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white"
                />

                <div className="flex gap-6 text-white">

                    <label>
                        <input
                            type="checkbox"
                            name="featured"
                            checked={form.featured}
                            onChange={handleChange}
                            className="mr-2"
                        />

                        Featured
                    </label>

                    <label>
                        <input
                            type="checkbox"
                            name="active"
                            checked={form.active}
                            onChange={handleChange}
                            className="mr-2"
                        />

                        Active
                    </label>

                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="rounded-xl bg-[#e68932] px-6 py-3 font-semibold text-white"
                >
                    {loading ? "Saving..." : "Create Package"}
                </button>

            </form>
        </div>
    );
}