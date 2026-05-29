"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import "@fontsource/pinyon-script";

const slides = [
  {
    id: 1,
    video: "/videos/burj khalifa in dubai.mp4",
    image: "/images/dubai-travel.webp",
    title: "BURJ KHALIFA",
  },
  {
    id: 2,
    video: "/videos/dubai united arab emirates.mp4",
    image: "/images/dubai-travel.webp",
    title: "DUBAI",
  },
  {
    id: 3,
    video: "/videos/kawazu town japan.mp4",
    image: "/images/japan.webp",
    title: "KAWAZU TOWN",
  },
  {
    id: 4,
    video: "/videos/komodo island indonesia.mp4",
    image: "/images/thailand-beach.webp",
    title: "KOMODO ISLAND",
  },
  {
    id: 5,
    video: "/videos/lake bohinj in slovenia.mp4",
    image: "/images/switzerland.webp",
    title: "LAKE BOHINJ",
  },
  {
    id: 6,
    video: "/videos/lauterbrunnen valley of switzerland.mp4",
    image: "/images/switzerland.webp",
    title: "LAUTERBRUNNEN",
  },
  {
    id: 7,
    video: "/videos/Seoul South Korea.mp4",
    image: "/images/japan.webp",
    title: "SEOUL",
  },
];

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loadedIndices, setLoadedIndices] = useState<number[]>([0, 1]);
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [videoReady, setVideoReady] = useState<boolean[]>(new Array(slides.length).fill(false));
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  useEffect(() => {
    setMounted(true);
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Progressive preloading of the next slide in sequence
  useEffect(() => {
    if (isMobile) return;
    setLoadedIndices((prev) => {
      const nextIdx = (currentSlide + 1) % slides.length;
      if (prev.includes(currentSlide) && prev.includes(nextIdx)) {
        return prev;
      }
      const nextList = [...prev];
      if (!nextList.includes(currentSlide)) nextList.push(currentSlide);
      if (!nextList.includes(nextIdx)) nextList.push(nextIdx);
      return nextList;
    });
  }, [currentSlide, isMobile]);

  // Auto transition slide every 6 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  // Control video playback based on active slide
  useEffect(() => {
    if (isMobile || !mounted) return;
    videoRefs.current.forEach((video, index) => {
      if (video) {
        if (index === currentSlide) {
          // Play current slide from start
          video.currentTime = 0;
          video.play().catch((err) => console.log("Video play failed:", err));
        } else {
          video.pause();
        }
      }
    });
  }, [currentSlide, isMobile, mounted]);

  return (
    <section className="relative w-full h-screen bg-[#071120] overflow-hidden">
      {/* VISUAL BACKGROUND LAYER */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Always render optimized image placeholders for smooth cross-fades and instant LCP paint */}
        {slides.map((slide, index) => {
          const isActive = index === currentSlide;
          return (
            <div
              key={`img-${slide.id}`}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                isActive ? "opacity-100" : "opacity-0"
              }`}
            >
              <Image
                src={slide.image}
                alt={slide.title}
                fill
                priority={index === 0}
                quality={55} // highly optimized for fast visual paint
                className="object-cover"
                sizes="100vw"
              />
            </div>
          );
        })}

        {/* Video overlay layer for desktop */}
        {mounted && !isMobile && (
          slides.map((slide, index) => {
            const isLoaded = loadedIndices.includes(index);
            const isActive = index === currentSlide;
            return (
              <video
                key={`vid-${slide.id}`}
                ref={(el) => {
                  videoRefs.current[index] = el;
                }}
                src={isLoaded ? slide.video : undefined}
                className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${
                  isActive && videoReady[index] ? "opacity-100" : "opacity-0"
                }`}
                loop
                muted
                playsInline
                onLoadedData={() => {
                  setVideoReady((prev) => {
                    const next = [...prev];
                    next[index] = true;
                    return next;
                  });
                }}
              />
            );
          })
        )}
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