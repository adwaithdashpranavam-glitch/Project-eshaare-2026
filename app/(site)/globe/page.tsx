"use client";

import dynamic from "next/dynamic";

const LuxuryEarth = dynamic(() => import("@/components/home/LuxuryEarth"), {
    ssr: false,
    loading: () => (
        <div className="flex h-screen items-center justify-center bg-black text-white">
            <div className="flex flex-col items-center gap-4">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#e68932] border-t-transparent"></div>
                <p className="text-sm font-medium text-gray-400">Loading Earth...</p>
            </div>
        </div>
    )
});

export default function Page() {
    return <LuxuryEarth />;
}