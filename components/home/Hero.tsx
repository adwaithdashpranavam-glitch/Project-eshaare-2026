"use client";

import { motion } from "framer-motion";

export default function Hero() {
  return (
    <section className="relative overflow-hidden min-h-screen flex items-center">

      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2070')",
        }}
      />

      <div className="absolute inset-0 bg-black/70" />

      <div className="relative max-w-7xl mx-auto px-6 py-32 w-full">

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl"
        >

          <p className="text-[#D4AF37] text-lg mb-6">
            Premium Travel & Visa Solutions
          </p>

          <h1 className="text-5xl md:text-7xl font-bold leading-tight">
            Explore The World With ESHAARE TOUR
          </h1>

          <p className="text-gray-300 text-lg mt-8 leading-8">
            Luxury holidays, visa services, flights,
            insurance, and worldwide travel support.
          </p>

          <div className="flex flex-wrap gap-4 mt-10">

            <button className="bg-[#D4AF37] text-black px-7 py-4 rounded-2xl font-semibold hover:bg-yellow-500 transition hover:scale-105">
              Apply Visa
            </button>

            <button className="border border-white/20 bg-white/5 backdrop-blur-md px-7 py-4 rounded-2xl hover:border-[#D4AF37] transition">
              Explore Packages
            </button>

          </div>

        </motion.div>

      </div>

    </section>
  );
}