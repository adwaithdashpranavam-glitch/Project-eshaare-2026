"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { ArrowRight } from "lucide-react";


const packages = [
  {
    title: "Dubai",
    type: "Tourist Visa",
    image:
      "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=1200&auto=format&fit=crop",
  },
  {
    title: "Maldives",
    type: "Visa on Arrival",
    image:
      "https://images.unsplash.com/photo-1573843981267-be1999ff37cd?q=80&w=1200&auto=format&fit=crop",
  },
  {
    title: "Bali",
    type: "Tourist / e-Visa",
    image:
      "https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=1200&auto=format&fit=crop",
  },
  {
    title: "Thailand",
    type: "Tourist Visa",
    image:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200&auto=format&fit=crop",
  },
];

export default function PackageSlider() {
  return (
    <section className="w-full overflow-hidden py-16 bg-white">
      <div className="mx-auto max-w-[90%]">
        {/* TOP HEADING */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold text-[#071120]">
              Visa Services
            </h2>

            <p className="text-gray-500 mt-3 text-lg">
              Explore seamless visa processing for global destinations
            </p>
          </div>

          {/* VIEW MORE */}
         <button
            className="
              hidden md:flex items-center gap-2
              bg-gradient-to-r from-[#d49237] to-[#f4d06f]
              hover:scale-105
              transition-all duration-300
              text-[#071120]
              px-6 py-3
              rounded-full
              font-semibold
              shadow-lg shadow-[#d4af37]/20
            "
          >
            View More
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* SLIDER */}
        <div className="relative overflow-hidden">
          <div className="flex gap-6 animate-scroll w-max">
            {[...packages, ...packages].map((item, index) => (
              <div
                key={index}
                className="
                  w-[260px]
                  md:w-[320px]
                  rounded-[30px]
                  overflow-hidden
                  relative
                  group
                  bg-white
                  border border-gray-200
                  hover:border-[#d4af37]/40
                  transition-all duration-500
                  hover:-translate-y-2
                  flex-shrink-0
                  shadow-sm
                  hover:shadow-2xl
                "
              >
                {/* IMAGE */}
                <div className="relative h-[220px] overflow-hidden">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="
                      object-cover
                      group-hover:scale-110
                      transition-transform duration-700
                    "
                  />

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#071120] via-black/20 to-transparent" />

                  {/* Title */}
                  <div className="absolute bottom-5 left-5">
                    <h3 className="text-3xl font-bold text-white">
                      {item.title}
                    </h3>

                    <p className="text-white/80 text-sm mt-1">
                      {item.type}
                    </p>
                  </div>
                </div>

                {/* CONTENT */}
                <div className="p-6">
                  <p className="text-gray-600 leading-relaxed text-sm">
                    Get hassle-free and quick visa processing for your travel to {item.title}.
                  </p>

                  <button
                    className="
                      mt-6 w-full
                      bg-gradient-to-r
                      from-[#d49237]
                      via-[#f4d06f]
                      to-[#d4af37]
                      text-[#071120]
                      py-3.5
                      rounded-2xl
                      font-semibold
                      hover:scale-[1.02]
                      transition-all duration-300
                      shadow-lg shadow-[#d4af37]/20
                    "
                  >
                    Apply for Visa
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* MOBILE VIEW MORE */}
        <div className="flex justify-center mt-8 md:hidden">
         <button
            className="
              flex items-center gap-2
              bg-gradient-to-r from-[#f09a39] to-[#f4d06f]
              text-[#071120]
              px-6 py-3
              rounded-full
              font-semibold
            "
          >
            View More
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
}