import { getCachedPackages } from "@/lib/packages";
import { Package } from "@/types/package";
import PackagesList from "@/components/packages/PackagesList";
import { packages as fallbackPackages } from "@/data/packages";

export default async function PackagesPage() {
    let initialPackages: Package[] = [];
    try {
        initialPackages = await getCachedPackages();
        if (initialPackages.length === 0) {
            initialPackages = fallbackPackages as Package[];
        }
    } catch (error) {
        console.error("Firebase packages fetch error, using fallback data:", error);
        initialPackages = fallbackPackages as Package[];
    }

    return (
        <main className="min-h-screen bg-[#071120] text-white">
            <PackagesList initialPackages={initialPackages} />
        </main>
    );
}