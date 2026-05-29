"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Heart, Loader2, ChevronRight } from "lucide-react";

export default function SavedTab({ savedPackageIds = [], t }: { savedPackageIds: string[]; t: any }) {
  const [loading, setLoading] = useState(true);
  const [savedPackages, setSavedPackages] = useState<any[]>([]);

  useEffect(() => {
    async function loadSavedPackages() {
      if (savedPackageIds.length === 0) {
        setSavedPackages([]);
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        // Parallel Firebase fetching (Fix 4)
        const pkgPromises = savedPackageIds.map((slug: string) => 
          getDoc(doc(db, "packages", slug))
        );
        const snaps = await Promise.all(pkgPromises);
        const pkgList = snaps
          .filter(snap => snap.exists())
          .map(snap => ({ id: snap.id, ...snap.data() }));
        setSavedPackages(pkgList);
      } catch (err) {
        console.error("Failed to load saved wishlist packages:", err);
      } finally {
        setLoading(false);
      }
    }
    loadSavedPackages();
  }, [savedPackageIds]);

  if (loading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <Loader2 className="w-6 h-6 text-[#e68932] animate-spin" />
      </div>
    );
  }

  return (
    <div className="text-left rtl:text-right">
      <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
        <Heart className="text-[#e68932]" />
        {t("Saved / Wishlist")}
      </h2>

      {savedPackages.length === 0 ? (
        <div className="text-center py-20 border border-white/5 rounded-2xl bg-white/5">
          <Heart className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <p className="text-gray-400 font-semibold">{t("Your wishlist is empty.")}</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {savedPackages.map((pkg) => (
            <div key={pkg.id} className="group rounded-2xl border border-white/10 bg-white/5 overflow-hidden transition-all duration-300 hover:border-[#e68932]/45">
              <div className="relative h-44 w-full bg-[#0c192e]">
                {pkg.image ? (
                  <Image
                    src={pkg.image}
                    alt={pkg.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="h-full w-full bg-white/5" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <span className="absolute top-4 left-4 rounded-full bg-[#00C2FF] px-2.5 py-1 text-[10px] font-semibold text-black">
                  {pkg.duration}
                </span>
              </div>
              <div className="p-4">
                <h3 className="text-base font-bold text-white group-hover:text-[#e68932] transition truncate">
                  {pkg.title}
                </h3>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
                  <span className="text-sm font-semibold text-white">{pkg.price}</span>
                  <Link href={`/packages/${pkg.slug}`} className="text-xs text-[#00C2FF] font-bold flex items-center gap-0.5 hover:underline">
                    {t("View More")} <ChevronRight size={12} />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
