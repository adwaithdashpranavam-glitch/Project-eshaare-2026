// app/components/Hero.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ChevronRight, Play, Pause, Menu, X } from "lucide-react";

// Replace these with your actual video paths or URLs
const slides = [
  { id: 1, video: "/videos/kerala-backwaters.mp4", destination: "Kerala Backwaters", company: "GODSOWNKERALA", tagline: "Explore God's Own Country" },
  { id: 2, video: "/videos/munnar-hills.mp4", destination: "Munnar Hills", company: "GODSOWNKERALA", tagline: "Rolling Tea Gardens" },
  { id: 3, video: "/videos/varkala-beach.mp4", destination: "Varkala Beach", company: "GODSOWNKERALA", tagline: "Coastal Paradise" },
];

const secondaryNavItems = ["Services", "Tours", "Events", "Cruises", "Hotels", "Blogs"];

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isPlaying]);

  useEffect(() => {
    videoRefs.current.forEach((video, idx) => {
      if (video) {
        idx === currentSlide ? video.play().catch(e => console.log(e)) : video.pause();
      }
    });
  }, [currentSlide]);

  return (
    <section className="relative min-h-screen overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0">
        {slides.map((slide, idx) => (
          <video
            key={slide.id}
            ref={el => { videoRefs.current[idx] = el; }}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${idx === currentSlide ? "opacity-100" : "opacity-0"}`}
            loop muted playsInline autoPlay={idx === 0}
          >
            <source src={slide.video} type="video/mp4" />
          </video>
        ))}
        <div className="absolute inset-0 bg-black/50" /> {/* Dark Overlay */}
      </div>

      {/* Content */}
      <div className="relative z-10 flex min-h-screen flex-col">
        {/* Secondary Navbar */}
        <nav className="border-b border-white/10 bg-black/30 backdrop-blur-md">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
            <div className="hidden space-x-8 md:flex">
              {secondaryNavItems.map(item => (
                <a key={item} href="#" className="text-sm font-medium text-white/80 transition hover:text-[#D4AF37]">{item}</a>
              ))}
            </div>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-white md:hidden">
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <div className="hidden md:block">
              <p className="text-xs text-white/60"><span className="text-[#D4AF37]">✦</span> Explore the world with <span className="text-[#D4AF37]">WEGOMAP</span></p>
            </div>
          </div>
          {/* Mobile Nav Links */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden bg-black/50 backdrop-blur-md md:hidden">
                <div className="space-y-2 px-6 py-4">
                  {secondaryNavItems.map(item => (<a key={item} href="#" className="block text-white/80">{item}</a>))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </nav>

        {/* Hero Main Content */}
        <div className="flex flex-1 items-center justify-center px-6 py-20 text-center">
          <div className="max-w-4xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, y: 100 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
                transition={{ duration: 0.6 }}
                className="space-y-6"
              >
                <h1 className="font-serif text-5xl tracking-wider md:text-7xl bg-gradient-to-r from-[#D4AF37] to-yellow-300 bg-clip-text text-transparent">
                  {slides[currentSlide].company}
                </h1>
                <p className="text-lg uppercase tracking-wide text-white/80">{slides[currentSlide].tagline}</p>
                <h2 className="text-4xl font-bold text-white md:text-5xl">{slides[currentSlide].destination}</h2>
              </motion.div>
            </AnimatePresence>

            {/* Search Bar */}
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mt-12">
              <div className="relative mx-auto max-w-2xl">
                <input
                  type="text"
                  placeholder="Search Destinations or Events"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-full border border-white/20 bg-white/10 py-4 pl-12 pr-24 text-white placeholder-white/50 backdrop-blur-md focus:border-[#D4AF37] focus:outline-none"
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" size={20} />
                <button className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-[#D4AF37] px-4 py-2 text-sm font-semibold text-black transition hover:bg-yellow-500">
                  Search
                </button>
              </div>
            </motion.div>

            {/* Blur Button */}
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="mt-10">
              <button className="group rounded-full border border-white/30 bg-white/10 px-8 py-3 font-semibold text-white backdrop-blur-xl transition hover:border-[#D4AF37]">
                <span className="flex items-center gap-2">Discover Now <ChevronRight size={16} className="transition group-hover:translate-x-1" /></span>
              </button>
            </motion.div>

            {/* Slide Controls */}
            <div className="mt-12 flex justify-center gap-3">
              {slides.map((_, idx) => (
                <button key={idx} onClick={() => { setCurrentSlide(idx); setIsPlaying(false); setTimeout(() => setIsPlaying(true), 5000); }} 
                  className={`h-2 rounded-full transition-all duration-300 ${idx === currentSlide ? "w-8 bg-[#D4AF37]" : "w-2 bg-white/50"}`} />
              ))}
            </div>
            <button onClick={() => setIsPlaying(!isPlaying)} className="mx-auto mt-6 flex items-center gap-2 text-sm text-white/70">
              {isPlaying ? <Pause size={14} /> : <Play size={14} />} {isPlaying ? "Auto-Playing" : "Paused"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}