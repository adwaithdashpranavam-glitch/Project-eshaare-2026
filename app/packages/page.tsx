"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { collection, getDocs, query, where } from "firebase/firestore";
import { Star, Heart, BadgePercent, Coins } from "lucide-react";

import { db } from "@/lib/firebase";
import { Package } from "@/types/package";
import PackageCard from "@/components/packages/PackageCard";
import { packages as fallbackPackages } from "@/data/packages";

export default function PackagesPage() {
    const [packages, setPackages] = useState<Package[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [selectedFilter, setSelectedFilter] = useState("All");
    const [likedSlugs, setLikedSlugs] = useState<string[]>([]);

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

                if (packagesData.length === 0) {
                    setPackages(fallbackPackages as Package[]);
                } else {
                    setPackages(packagesData);
                }

            } catch (error) {
                console.error("Firebase packages fetch error, using fallback data:", error);
                setPackages(fallbackPackages as Package[]);
            } finally {
                setLoading(false);
            }
        };

        fetchPackages();

        // Load liked packages from localStorage
        const saved = localStorage.getItem("liked_packages");
        if (saved) {
            try {
                setLikedSlugs(JSON.parse(saved));
            } catch (e) {
                console.error("Error loading liked packages", e);
            }
        }
    }, []);

    const toggleLike = (slug: string) => {
        setLikedSlugs((prev) => {
            const next = prev.includes(slug)
                ? prev.filter((s) => s !== slug)
                : [...prev, slug];
            localStorage.setItem("liked_packages", JSON.stringify(next));
            return next;
        });
    };

    // UNIQUE CATEGORIES
    const categories = useMemo(() => {
        const allCategories = packages.map((item) => item.category);
        return ["All", ...new Set(allCategories.filter(Boolean))];
    }, [packages]);

    // FILTERED PACKAGES
    const filteredPackages = useMemo(() => {
        return packages.filter((item) => {
            const matchesSearch =
                item.title.toLowerCase().includes(search.toLowerCase()) ||
                item.destination.toLowerCase().includes(search.toLowerCase());

            let matchesFilter = true;
            if (selectedFilter === "All") {
                matchesFilter = true;
            } else if (selectedFilter === "Budget Package") {
                // Price under AED 5,500 or category matches "Budget"
                const priceNum = parseInt(item.price.replace(/[^0-9]/g, "")) || 0;
                matchesFilter = priceNum <= 5500 || item.category.toLowerCase() === "budget";
            } else if (selectedFilter === "Best Sellers") {
                matchesFilter = item.featured === true || item.offerText?.toLowerCase() === "best seller";
            } else if (selectedFilter === "Most Liked") {
                matchesFilter = likedSlugs.includes(item.slug);
            } else if (selectedFilter === "Special Offers") {
                matchesFilter = !!item.offerText && item.offerText !== "";
            } else {
                matchesFilter = item.category === selectedFilter;
            }

            return matchesSearch && matchesFilter && item.active;
        });
    }, [packages, search, selectedFilter, likedSlugs]);

    return (
        <main className="min-h-screen bg-[#071120] text-white">

            {/* HERO */}
            <section className="relative overflow-hidden border-b border-white/10">
                {/* BACKGROUND IMAGE */}
                <div className="absolute inset-0 z-0">
                    <Image
                        src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2000&auto=format&fit=crop"
                        alt="Tour Packages Background"
                        fill
                        className="object-cover animate-fade-in"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-[#071120]/85 to-[#071120]" />
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-6 py-24">

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
                            onChange={(e) => setSearch(e.target.value)}
                            className="h-14 w-full max-w-2xl rounded-2xl border border-white/10 bg-white/5 px-6 text-white outline-none backdrop-blur-xl placeholder:text-white/40 focus:border-[#00C2FF]"
                        />
                    </div>

                    {/* FILTERS */}
                    <div className="mt-8 flex flex-wrap items-center gap-3">
                        {/* BUDGET PACKAGE */}
                        <button
                            onClick={() => setSelectedFilter("Budget Package")}
                            className={`flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition ${
                                selectedFilter === "Budget Package"
                                    ? "bg-[#00C2FF] text-black"
                                    : "border border-white/10 bg-white/5 text-white hover:border-[#00C2FF]/40"
                            }`}
                        >
                            <Coins size={16} />
                            Budget Package
                        </button>

                        {/* BEST SELLERS */}
                        <button
                            onClick={() => setSelectedFilter("Best Sellers")}
                            className={`flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition ${
                                selectedFilter === "Best Sellers"
                                    ? "bg-[#00C2FF] text-black"
                                    : "border border-white/10 bg-white/5 text-white hover:border-[#00C2FF]/40"
                            }`}
                        >
                            <Star size={16} />
                            Best Sellers
                        </button>

                        {/* MOST LIKED */}
                        <button
                            onClick={() => setSelectedFilter("Most Liked")}
                            className={`flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition ${
                                selectedFilter === "Most Liked"
                                    ? "bg-[#00C2FF] text-black"
                                    : "border border-white/10 bg-white/5 text-white hover:border-[#00C2FF]/40"
                            }`}
                        >
                            <Heart size={16} />
                            Most Liked
                        </button>

                        {/* SPECIAL OFFERS */}
                        <button
                            onClick={() => setSelectedFilter("Special Offers")}
                            className={`flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition ${
                                selectedFilter === "Special Offers"
                                    ? "bg-[#00C2FF] text-black"
                                    : "border border-white/10 bg-white/5 text-white hover:border-[#00C2FF]/40"
                            }`}
                        >
                            <BadgePercent size={16} />
                            Special Offers
                        </button>

                        <div className="h-6 w-px bg-white/10 mx-2 hidden md:block" />

                        {/* CATEGORY TAGS */}
                        {categories.map((category) => (
                            <button
                                key={category}
                                onClick={() => setSelectedFilter(category)}
                                className={`rounded-full px-5 py-3 text-sm font-semibold transition ${
                                    selectedFilter === category
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
                    <div className="flex h-[300px] items-center justify-center text-xl text-white/70 animate-pulse">
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
                            <div key={item.id} className="flex flex-col">
                                <PackageCard 
                                    item={item} 
                                    isLiked={likedSlugs.includes(item.slug)}
                                    onLikeToggle={() => toggleLike(item.slug)}
                                />

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