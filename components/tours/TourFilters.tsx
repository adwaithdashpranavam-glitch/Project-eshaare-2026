"use client";

import {
    SlidersHorizontal,
    Heart,
    BadgePercent,
    Star,
} from "lucide-react";

const filters = [
    "Best Sellers",
    "Adventure",
    "Luxury",
    "Family Tours",
    "Honeymoon",
    "Cruises",
];

export default function TourFilters() {
    return (
        <section className="bg-white px-4 py-8 md:px-8">

            <div className="mx-auto max-w-7xl">

                {/* TOP BAR */}
                <div className="flex flex-wrap items-center gap-3">

                    {/* FILTER BTN */}
                    <button className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-[#071120] transition hover:border-[#00C2FF]">

                        <SlidersHorizontal size={16} />

                        Filters

                    </button>

                    {/* BEST SELLER */}
                    <button className="flex items-center gap-2 rounded-full bg-[#00C2FF] px-5 py-3 text-sm font-semibold text-black">

                        <Star size={16} />

                        Best Sellers

                    </button>

                    {/* LIKES */}
                    <button className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-[#071120] transition hover:border-[#00C2FF]">

                        <Heart size={16} />

                        Most Liked

                    </button>

                    {/* OFFERS */}
                    <button className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-[#071120] transition hover:border-[#00C2FF]">

                        <BadgePercent size={16} />

                        Special Offers

                    </button>

                    {/* TAGS */}
                    {filters.map((item) => (
                        <button
                            key={item}
                            className="rounded-full border border-gray-200 bg-[#f8fafc] px-5 py-3 text-sm font-medium text-gray-700 transition hover:border-[#00C2FF] hover:text-[#00C2FF]"
                        >
                            {item}
                        </button>
                    ))}

                </div>

            </div>

        </section>
    );
}