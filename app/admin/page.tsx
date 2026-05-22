"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminPage() {
    const router = useRouter();

    useEffect(() => {
        router.replace("/admin/login");
    }, [router]);

    return (
        <div className="flex min-h-screen items-center justify-center bg-[#071120] text-white">
            <div className="flex flex-col items-center gap-4">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#e68932] border-t-transparent"></div>
                <p className="text-sm font-medium text-gray-400">Redirecting to login...</p>
            </div>
        </div>
    );
}
