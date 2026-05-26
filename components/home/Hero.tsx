"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import "@fontsource/pinyon-script";

const slides = [
  {
    id: 1,
    video: "/videos/burj khalifa in dubai.mp4",
    image: "https://images.unsplash.com/photo-1582672060674-bc2bd808a8b5?q=80&w=1200&auto=format&fit=crop",
    title: "BURJ KHALIFA",
  },
  {
    id: 2,
    video: "/videos/dubai united arab emirates.mp4",
    image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=1200&auto=format&fit=crop",
    title: "DUBAI",
  },
  {
    id: 3,
    video: "/videos/kawazu town japan.mp4",
    image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=1200&auto=format&fit=crop",
    title: "KAWAZU TOWN",
  },
  {
    id: 4,
    video: "/videos/komodo island indonesia.mp4",
    image: "https://images.unsplash.com/photo-1516690561799-46d8f74f9abf?q=80&w=1200&auto=format&fit=crop",
    title: "KOMODO ISLAND",
  },
  {
    id: 5,
    video: "/videos/lake bohinj in slovenia.mp4",
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1200&auto=format&fit=crop",
    title: "LAKE BOHINJ",
  },
  {
    id: 6,
    video: "/videos/lauterbrunnen valley of switzerland.mp4",
    image: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=1200&auto=format&fit=crop",
    title: "LAUTERBRUNNEN",
  },
  {
    id: 7,
    video: "/videos/Seoul South Korea.mp4",
    image: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=1200&auto=format&fit=crop",
    title: "SEOUL",
  },
];

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [videoLoaded, setVideoLoaded] = useState(false);

  // Auto transition slide every 6 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  // Reset video loaded flag when slide changes to show placeholder image instantly
  useEffect(() => {
    setVideoLoaded(false);
  }, [currentSlide]);

  return (
    <section className="relative w-full h-screen bg-[#071120] overflow-hidden">
      {/* VISUAL BACKGROUND LAYER */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Instant Static Placeholder Image */}
        <Image
          src={slides[currentSlide].image}
          alt={slides[currentSlide].title}
          fill
          priority
          sizes="100vw"
          className="object-cover transition-opacity duration-1000"
        />

        {/* Dynamic Single Video Overlay */}
        <video
          key={currentSlide}
          src={slides[currentSlide].video}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${
            videoLoaded ? "opacity-100" : "opacity-0"
          }`}
          autoPlay
          loop
          muted
          playsInline
          onPlay={() => setVideoLoaded(true)}
          onLoadedData={() => setVideoLoaded(true)}
        />
      </div>

      {/* DARK OVERLAY */}
      <div className="absolute inset-0 bg-black/45" />

      {/* CONTENT */}
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* TITLE */}
            <h1 className="text-5xl font-extrabold tracking-tight text-white md:text-7xl lg:text-8xl">
              {slides[currentSlide].title}
            </h1>

            {/* SUBTITLE */}
            <p
              className="mt-6 text-4xl text-white/95 md:text-5xl"
              style={{
                fontFamily: "'Pinyon Script', cursive",
              }}
            >
              Explore the world with Eshaare Tour
            </p>
          </motion.div>
        </AnimatePresence>

        {/* BUTTON */}
        <div className="mt-10">
          <Link href="/packages">
            <button className="rounded-full border border-white/30 bg-white/10 px-10 py-4 text-lg font-semibold text-white backdrop-blur-md transition hover:bg-white hover:text-black">
              Discover Now
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}