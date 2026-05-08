"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search } from "lucide-react";
import "@fontsource/pinyon-script";
import { CiLocationOn } from "react-icons/ci";

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
  const [searchQuery, setSearchQuery] = useState("");
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    videoRefs.current.forEach((video, index) => {
      if (video) {
        if (index === currentSlide) {
          video.currentTime = 0;
          video.play().catch((err) => console.log(err));
        } else {
          video.pause();
        }
      }
    });
  }, [currentSlide]);

  return (
    <section className="min-h-screen bg-[#f5f5f5] px-4 pt-20 pb-6 md:px-8">
      <div className="mx-auto max-w-7xl">

        {/* HERO CARD */}
        <div className="relative mt-6 h-[72vh] overflow-visible rounded-[40px] shadow-2xl">

          {/* VIDEOS */}
          <div className="absolute inset-0 overflow-hidden rounded-[40px]">
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

          {/* OVERLAY */}
          <div className="absolute inset-0 rounded-[40px] bg-black/35" />

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
              <button className="rounded-full border border-white/30 bg-white/10 px-10 py-4 text-lg font-semibold text-white backdrop-blur-md transition hover:bg-white hover:text-black">
                Discover Now
              </button>
            </div>

            {/* SEARCH BAR */}
<div className="absolute -bottom-12 left-1/2 z-30 w-full max-w-3xl -translate-x-1/2 px-6">
  <div className="flex h-16 items-center overflow-hidden rounded-full bg-white shadow-[0_18px_45px_rgba(0,0,0,0.16)]">

    <CiLocationOn
      className="ml-6 text-3xl text-gray-400"
    />

    <input
      type="text"
      placeholder="Search Destinations or Events"
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      className="w-full bg-transparent px-4 text-base text-gray-700 outline-none"
    />

    <button className="mr-2 rounded-full bg-orange-500 p-4 text-white transition hover:bg-orange-600">
      <Search size={22} />
    </button>

  </div>
</div>

          </div>
        </div>

     
      </div>
    </section>
  );
}