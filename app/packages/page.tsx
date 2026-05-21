"use client";

import { useEffect, useMemo, useState } from "react";

import { collection, getDocs, query, where, } from "firebase/firestore";

import { db } from "@/lib/firebase";

import { Package } from "@/types/package";

import PackageCard from "@/components/packages/PackageCard";

export default function PackagesPage() {
    const [packages, setPackages] = useState<Package[]>([]);

    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState("");

    const [selectedCategory, setSelectedCategory] =
        useState("All");

    useEffect(() => {
        const fetchPackages = async () => {
            try {
                const q = query(collection(db, "packages"), where("active", "==", true));

                const querySnapshot = await getDocs(q);

                const packagesData: Package[] = [];

                querySnapshot.forEach((doc) => {
                    const data = doc.data();

                    packagesData.push({
                        id: doc.id,
                        title: data.title || "",
                        slug: data.slug || "",
                        image: data.image || "",
                        price: data.price || "",
                        seasonalPrice: data.seasonalPrice || "",
                        duration: data.duration || "",
                        category: data.category || "",
                        destination: data.destination || "",
                        featured: data.featured || false,
                        overview: data.overview || "",
                        gallery: data.gallery || [],
                        itinerary: data.itinerary || [],
                        inclusions: data.inclusions || [],
                        exclusions: data.exclusions || [],
                        offerText: data.offerText || "",
                        seasonTag: data.seasonTag || "",
                        seatsLeft: data.seatsLeft || 0,
                        active: data.active ?? true,
                    });
                });

                setPackages(packagesData);

            } catch (error) {
                console.log(error);
            } finally {
                setLoading(false);
            }
        };

        fetchPackages();
    }, []);

    // UNIQUE CATEGORIES
    const categories = useMemo(() => {
        const allCategories = packages.map(
            (item) => item.category
        );

        return ["All", ...new Set(allCategories)];
    }, [packages]);

    // FILTERED PACKAGES
    const filteredPackages = useMemo(() => {
        return packages.filter((item) => {

            const matchesSearch =
                item.title
                    .toLowerCase()
                    .includes(search.toLowerCase()) ||

                item.destination
                    .toLowerCase()
                    .includes(search.toLowerCase());

            const matchesCategory =
                selectedCategory === "All" ||
                item.category === selectedCategory;

            return (
                matchesSearch &&
                matchesCategory &&
                item.active
            );
        });
    }, [packages, search, selectedCategory]);

    return (
        <main className="min-h-screen bg-[#071120] text-white">

            {/* HERO */}
            <section className="relative overflow-hidden border-b border-white/10 bg-gradient-to-b from-[#0b1830] to-[#071120]">

                <div className="max-w-7xl mx-auto px-6 py-24">

                    <p className="text-sm uppercase tracking-[5px] text-[#00C2FF]">
                        Luxury Experiences
                    </p>

                    <h1 className="mt-4 text-5xl font-bold md:text-6xl">
                        Explore Tour Packages
                    </h1>

                    <p className="mt-6 max-w-2xl text-lg leading-8 text-white/70">
                        Discover premium international holiday
                        experiences, seasonal offers, luxury escapes,
                        honeymoon packages, and adventure tours.
                    </p>

                    {/* SEARCH */}
                    <div className="mt-10">

                        <input
                            type="text"
                            placeholder="Search destination or package..."
                            value={search}
                            onChange={(e) =>
                                setSearch(e.target.value)
                            }
                            className="h-14 w-full max-w-2xl rounded-2xl border border-white/10 bg-white/5 px-6 text-white outline-none backdrop-blur-xl placeholder:text-white/40 focus:border-[#00C2FF]"
                        />

                    </div>

                    {/* FILTERS */}
                    <div className="mt-8 flex flex-wrap gap-3">

                        {categories.map((category) => (
                            <button
                                key={category}
                                onClick={() =>
                                    setSelectedCategory(category)
                                }
                                className={`rounded-full px-5 py-3 text-sm font-semibold transition ${selectedCategory === category
                                    ? "bg-[#00C2FF] text-black"
                                    : "border border-white/10 bg-white/5 text-white hover:border-[#00C2FF]/40"
                                    }`}
                            >
                                {category}
                            </button>
                        ))}

                    </div>

                </div>

            </section>

            {/* PACKAGES */}
            <section className="max-w-7xl mx-auto px-6 py-20">

                {/* TOP */}
                <div className="mb-10 flex items-center justify-between">

                    <div>

                        <h2 className="text-3xl font-bold">
                            Available Packages
                        </h2>

                        <p className="mt-2 text-white/60">
                            Showing {filteredPackages.length} package(s)
                        </p>

                    </div>

                </div>

                {/* LOADING */}
                {loading ? (
                    <div className="flex h-[300px] items-center justify-center text-xl text-white/70">
                        Loading Packages...
                    </div>

                ) : filteredPackages.length === 0 ? (

                    <div className="flex h-[300px] flex-col items-center justify-center rounded-[30px] border border-white/10 bg-white/5 text-center">

                        <h3 className="text-3xl font-bold">
                            No Packages Found
                        </h3>

                        <p className="mt-3 text-white/60">
                            Try another search or filter.
                        </p>

                    </div>

                ) : (

                    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">

                        {filteredPackages.map((item) => (
                            <div key={item.id}>

                                {/* OFFER BADGE */}
                                {item.offerText && (
                                    <div className="mb-4 inline-flex rounded-full bg-[#00C2FF]/10 px-4 py-2 text-sm font-semibold text-[#00C2FF]">
                                        {item.offerText}
                                    </div>
                                )}

                                <PackageCard item={item} />

                                {/* EXTRA INFO */}
                                <div className="mt-4 flex items-center justify-between px-2">

                                    {item.seasonTag ? (
                                        <p className="text-sm text-white/50">
                                            {item.seasonTag}
                                        </p>
                                    ) : (
                                        <div />
                                    )}

                                    {item.seatsLeft ? (
                                        <p className="text-sm font-semibold text-[#00C2FF]">
                                            {item.seatsLeft} Seats Left
                                        </p>
                                    ) : null}

                                </div>

                            </div>
                        ))}

                    </div>

                )}

            </section>

        </main>
    );
}