"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import "@fontsource/pinyon-script";

const slides = [
  {
    id: 1,
    video: "/videos/burj khalifa in dubai.mp4",
    title: "BURJ KHALIFA",
  },
  {
    id: 2,
    video: "/videos/dubai united arab emirates.mp4",
    title: "DUBAI",
  },
  {
    id: 3,
    video: "/videos/kawazu town japan.mp4",
    title: "KAWAZU TOWN",
  },
  {
    id: 4,
    video: "/videos/komodo island indonesia.mp4",
    title: "KOMODO ISLAND",
  },
  {
    id: 5,
    video: "/videos/lake bohinj in slovenia.mp4",
    title: "LAKE BOHINJ",
  },
  {
    id: 6,
    video: "/videos/lauterbrunnen valley of switzerland.mp4",
    title: "LAUTERBRUNNEN",
  },
  {
    id: 7,
    video: "/videos/Seoul South Korea.mp4",
    title: "SEOUL",
  },
];

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  // Auto transition slide every 6 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  // Control video playback based on active slide
  useEffect(() => {
    videoRefs.current.forEach((video, index) => {
      if (video) {
        if (index === currentSlide) {
          video.currentTime = 0;
          video.play().catch((err) => console.log("Video play failed:", err));
        } else {
          video.pause();
        }
      }
    });
  }, [currentSlide]);

  return (
    <section className="relative w-full h-screen bg-[#071120] overflow-hidden">
      {/* VISUAL BACKGROUND LAYER */}
      <div className="absolute inset-0 overflow-hidden">
        {slides.map((slide, index) => (
          <video
            key={slide.id}
            ref={(el) => {
              videoRefs.current[index] = el;
            }}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${
              index === currentSlide ? "opacity-100" : "opacity-0"
            }`}
            loop
            muted
            playsInline
            autoPlay={index === 0}
          >
            <source src={slide.video} type="video/mp4" />
          </video>
        ))}
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