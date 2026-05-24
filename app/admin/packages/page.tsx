"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
    collection,
    getDocs,
    doc,
    updateDoc,
    deleteDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Package } from "@/types/package";

export default function PackagesPage() {
    const [packages, setPackages] = useState<Package[]>([]);

    useEffect(() => {
        async function fetchPackages() {
            const snapshot = await getDocs(collection(db, "packages"));

            const data = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as Package[];

            setPackages(data);
        }

        fetchPackages();
    }, []);

    async function toggleActive(id: string, currentStatus: boolean) {
        await updateDoc(doc(db, "packages", id), {
            active: !currentStatus,
        });

        setPackages((prev) =>
            prev.map((item) =>
                item.id === id ? { ...item, active: !currentStatus } : item
            )
        );
    }

    async function toggleFeatured(id: string, currentStatus: boolean) {
        await updateDoc(doc(db, "packages", id), {
            featured: !currentStatus,
        });

        setPackages((prev) =>
            prev.map((item) =>
                item.id === id ? { ...item, featured: !currentStatus } : item
            )
        );
    }

    async function deletePackage(id: string) {
        const confirmDelete = confirm(
            "Are you sure you want to delete this package?"
        );

        if (!confirmDelete) return;

        await deleteDoc(doc(db, "packages", id));

        setPackages((prev) => prev.filter((item) => item.id !== id));
    }

    return (
        <div>
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">
                        Packages
                    </h1>

                    <p className="mt-2 text-gray-400">
                        Manage all tourism packages
                    </p>
                </div>

                <Link
                    href="/admin/packages/add"
                    className="rounded-xl bg-[#e68932] px-5 py-3 font-semibold text-white"
                >
                    Add Package
                </Link>
            </div>

            <div className="mt-8 grid gap-4">
                {packages.map((item) => (
                    <div
                        key={item.id}
                        className="rounded-2xl border border-white/10 bg-white/5 p-5"
                    >
                        <div className="flex items-center justify-between gap-6">
                            <div>
                                <h2 className="text-xl font-semibold text-white">
                                    {item.title}
                                </h2>

                                <p className="mt-1 text-gray-400">
                                    {item.destination} • AED {item.price} • {item.duration}
                                </p>

                                {item.supplier && (
                                    <p className="mt-1 text-xs text-[#e68932] font-semibold bg-white/5 border border-white/10 rounded-lg px-2.5 py-1 w-fit">
                                        Supplier: {item.supplier}
                                    </p>
                                )}

                                <div className="mt-3 flex flex-wrap gap-2">
                                    <span
                                        className={`rounded-full px-3 py-1 text-sm ${item.active
                                                ? "bg-green-500/20 text-green-400"
                                                : "bg-red-500/20 text-red-400"
                                            }`}
                                    >
                                        {item.active ? "Active" : "Inactive"}
                                    </span>

                                    {item.featured && (
                                        <span className="rounded-full bg-blue-500/20 px-3 py-1 text-sm text-blue-400">
                                            Featured
                                        </span>
                                    )}

                                    {item.seasonTag && (
                                        <span className="rounded-full bg-yellow-500/20 px-3 py-1 text-sm text-yellow-400">
                                            {item.seasonTag}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-3">
                                <Link
                                    href={`/admin/packages/edit/${item.id}`}
                                    className="rounded-xl bg-white/10 px-4 py-2 text-white"
                                >
                                    Edit
                                </Link>

                                <button
                                    onClick={() => toggleActive(item.id, item.active)}
                                    className="rounded-xl bg-green-500/20 px-4 py-2 text-green-400"
                                >
                                    {item.active ? "Deactivate" : "Activate"}
                                </button>

                                <button
                                    onClick={() => toggleFeatured(item.id, item.featured)}
                                    className="rounded-xl bg-blue-500/20 px-4 py-2 text-blue-400"
                                >
                                    {item.featured ? "Unfeature" : "Feature"}
                                </button>

                                <button
                                    onClick={() => deletePackage(item.id)}
                                    className="rounded-xl bg-red-500/20 px-4 py-2 text-red-400"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}