"use client";

import { useEffect, useState } from "react";

import { useParams } from "next/navigation";

import Image from "next/image";

import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";

import { db } from "@/lib/firebase";

import { Package } from "@/types/package";

export default function PackageDetails() {
  const params = useParams();

  const slug = params.slug as string;

  const [pkg, setPkg] = useState<Package | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPackage = async () => {
      try {
        const q = query(
          collection(db, "packages"),
          where("slug", "==", slug)
        );

        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const doc = querySnapshot.docs[0];

          const data = doc.data();

          setPkg({
            id: doc.id,
            title: data.title || "",
            slug: data.slug || "",
            image: data.image || "",
            price: data.price || "",
            duration: data.duration || "",
            category: data.category || "",
            destination: data.destination || "",
            featured: data.featured || false,

            overview: data.overview || "",

            gallery: data.gallery || [],

            itinerary: data.itinerary || [],

            inclusions: data.inclusions || [],

            exclusions: data.exclusions || [],
          });
        }

      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    fetchPackage();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-[#071120]">
        Loading Package...
      </div>
    );
  }

  if (!pkg) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-[#071120]">
        Package not found
      </div>
    );
  }

  return (
    <main className="bg-[#071120] text-white">

      {/* HERO */}
      <section className="relative h-[70vh]">

        <Image
          src={pkg.image}
          alt={pkg.title}
          fill
          className="object-cover"
        />

        <div className="absolute inset-0 bg-black/50" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 h-full flex flex-col justify-center">

          <p className="text-[#00C2FF] uppercase tracking-[3px]">
            Luxury Package
          </p>

          <h1 className="text-6xl font-bold mt-4">
            {pkg.title}
          </h1>

          <p className="text-white/80 mt-4 text-lg">
            {pkg.duration}
          </p>

        </div>

      </section>

      {/* CONTENT */}
      <section className="max-w-7xl mx-auto px-6 py-20 grid lg:grid-cols-3 gap-10">

        {/* LEFT */}
        <div className="lg:col-span-2">

          {/* Overview */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8">

            <h2 className="text-3xl font-bold mb-6">
              Overview
            </h2>

            <p className="text-white/70 leading-8">
              {pkg.overview}
            </p>

          </div>

          {/* Gallery */}
          <div className="mt-10">

            <h2 className="text-3xl font-bold mb-6">
              Gallery
            </h2>

            <div className="grid md:grid-cols-3 gap-4">

              {pkg.gallery?.map((img) => (
                <div
                  key={img}
                  className="relative h-60 rounded-2xl overflow-hidden"
                >

                  <Image
                    src={img}
                    alt=""
                    fill
                    className="object-cover hover:scale-110 transition duration-500"
                  />

                </div>
              ))}

            </div>

          </div>

          {/* Itinerary */}
          <div className="mt-14">

            <h2 className="text-3xl font-bold mb-8">
              Itinerary
            </h2>

            <div className="space-y-6">

              {pkg.itinerary?.map((day, index) => (
                <div
                  key={index}
                  className="flex gap-4 items-start"
                >

                  <div className="h-10 w-10 rounded-full bg-[#00C2FF] text-black flex items-center justify-center font-bold">
                    {index + 1}
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex-1">
                    {day}
                  </div>

                </div>
              ))}

            </div>

          </div>

          {/* Includes */}
          <div className="mt-14 grid md:grid-cols-2 gap-6">

            <div className="bg-white/5 border border-white/10 rounded-3xl p-8">

              <h3 className="text-2xl font-bold mb-6">
                Includes
              </h3>

              <div className="space-y-4">

                {pkg.inclusions?.map((item) => (
                  <div key={item}>
                    ✓ {item}
                  </div>
                ))}

              </div>

            </div>

            <div className="bg-white/5 border border-white/10 rounded-3xl p-8">

              <h3 className="text-2xl font-bold mb-6">
                Excludes
              </h3>

              <div className="space-y-4 text-white/70">

                {pkg.exclusions?.map((item) => (
                  <div key={item}>
                    ✕ {item}
                  </div>
                ))}

              </div>

            </div>

          </div>

        </div>

        {/* RIGHT SIDEBAR */}
        <div>

          <div className="sticky top-28 bg-white text-black rounded-3xl p-8">

            <p className="text-gray-500">
              Starting From
            </p>

            <h2 className="text-5xl font-bold mt-2">
              {pkg.price}
            </h2>

            <button className="w-full mt-8 bg-[#00C2FF] text-black py-4 rounded-2xl font-semibold hover:opacity-90 transition">
              Book Now
            </button>

            <button className="w-full mt-4 border border-black/10 py-4 rounded-2xl font-semibold">
              WhatsApp Inquiry
            </button>

          </div>

        </div>

      </section>

    </main>
  );
}