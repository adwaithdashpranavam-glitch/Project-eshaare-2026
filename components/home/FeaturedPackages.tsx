"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";

import { db } from "@/lib/firebase";
import { Package } from "@/types/package";
import { packages as fallbackPackages } from "@/data/packages";

export default function FeaturedPackages() {
  const [tourPackages, setTourPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const q = query(
          collection(db, "packages"),
          where("active", "==", true),
          where("featured", "==", true)
        );
        const querySnapshot = await getDocs(q);

        let packagesData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Package[];

        if (packagesData.length === 0) {
          setTourPackages(fallbackPackages as Package[]);
        } else {
          setTourPackages(packagesData);
        }
      } catch (error) {
        console.error("Firebase package fetch error, using fallback packages:", error);
        setTourPackages(fallbackPackages as Package[]);
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
  }, []);

  return (
    <section className="bg-[#f5f5f5] px-4 py-20 md:px-8">
      <div className="mx-auto max-w-7xl">

        <div className="mb-10 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[3px] text-[#e68932]">
              Trending Tours
            </p>

            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-[#071120] md:text-4xl">
              Explore Trending Tour Packages
            </h2>
          </div>

          <Link
            href="/packages"
            className="hidden md:flex items-center gap-2 bg-gradient-to-r from-[#d49237] to-[#f4d06f] hover:scale-105 transition-all duration-300 text-[#071120] px-6 py-3 rounded-full font-semibold shadow-lg shadow-[#d4af37]/20"
          >
            View More
            <ArrowRight size={16} />
          </Link>
        </div>

        {loading ? (
            <div className="flex justify-center py-10">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#e68932] border-t-transparent"></div>
            </div>
        ) : tourPackages.length === 0 ? (
          <p className="text-gray-500 py-10 text-center">
            No featured active packages found.
          </p>
        ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {tourPackages.map((tour) => (
                <Link
                key={tour.id}
                href="/packages"
                className="group relative overflow-hidden rounded-[26px] shadow-xl"
                >
                <div className="relative h-[360px] w-full overflow-hidden">
                    <Image
                    src={tour.image || "/images/placeholder.jpg"}
                    alt={tour.title || "Tour Package"}
                    fill
                    sizes="(max-width: 768px) 100vw, 25vw"
                    className="object-cover transition duration-700 group-hover:scale-110"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/10" />

                    <div className="absolute bottom-7 left-0 w-full text-center">
                    <h3 className="text-3xl font-bold text-white drop-shadow-lg px-4">
                        {tour.destination || tour.title}
                    </h3>

                    <p className="mt-2 text-xs font-semibold uppercase tracking-[4px] text-white/90">
                        Explore
                    </p>
                    </div>
                </div>
                </Link>
            ))}
            </div>
        )}

        <div className="mt-10 flex justify-center md:hidden">
          <Link
            href="/packages"
            className="flex items-center gap-2 rounded-full bg-[#e68932] px-6 py-3 text-sm font-semibold text-white shadow-lg"
          >
            View More
            <ArrowRight size={16} />
          </Link>
        </div>

      </div>
    </section>
  );
}