import React from "react";
import Image from "next/image";

export default function VisaHero() {
  return (
    <section className="relative w-full h-[60vh] min-h-[500px] flex items-center justify-center overflow-hidden">
      {/* BACKGROUND IMAGE */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=2000&auto=format&fit=crop"
          alt="Visa Services Background"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/60" />
      </div>

      {/* CONTENT */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto mt-16">
        <h1 className="text-5xl md:text-6xl font-extrabold text-white tracking-tight mb-6">
          Seamless Visa <span className="text-[#00C2FF]">Processing</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-200 mb-10 max-w-2xl mx-auto leading-relaxed">
          Unlock your global journey with expert visa assistance. From tourist visas to business travel, we ensure a smooth and hassle-free experience.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="#categories"
            className="px-8 py-4 bg-[#00C2FF] text-black font-semibold rounded-full hover:bg-white transition-colors duration-300 shadow-lg"
          >
            Explore Visa Types
          </a>
          <a
            href="#whatsapp"
            className="px-8 py-4 bg-transparent border-2 border-white text-white font-semibold rounded-full hover:bg-white hover:text-black transition-colors duration-300"
          >
            Contact Experts
          </a>
        </div>
      </div>
    </section>
  );
}
