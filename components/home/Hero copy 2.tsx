"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Menu, X, ChevronRight, Play, Pause } from "lucide-react";

// Video slides data
const slides = [
  {
    id: 1,
    video: "https://player.vimeo.com/external/434045526.sd.mp4?s=1c2d6f5c5a6e3b8f9e7d1c4b2a8f3e6d&profile_id=164",
    destination: "Kerala, India",
    company: "GODSOWNKERALA",
    tagline: "Experience God's Own Country",
  },
  {
    id: 2,
    video: "https://player.vimeo.com/external/456543218.sd.mp4?s=2d3e4f5g6h7i8j9k0l1m2n3o4p5q6r7s&profile_id=164",
    destination: "Bali, Indonesia",
    company: "ISLAND PARADISE",
    tagline: "Where Dreams Begin",
  },
  {
    id: 3,
    video: "https://player.vimeo.com/external/387678945.sd.mp4?s=3e4f5g6h7i8j9k0l1m2n3o4p5q6r7s8t&profile_id=164",
    destination: "Swiss Alps",
    company: "ALPINE ESCAPES",
    tagline: "Majestic Mountains Await",
  },
];

// Secondary navbar items
const secondaryNavItems = [
  { name: "Services", href: "#" },
  { name: "Tours", href: "#" },
  { name: "Events", href: "#" },
  { name: "Cruises", href: "#" },
  { name: "Hotels", href: "#" },
  { name: "Blogs", href: "#" },
];

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  // Auto-play slides
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Handle video playback when slide changes
  useEffect(() => {
    videoRefs.current.forEach((video, index) => {
      if (video) {
        if (index === currentSlide) {
          video.play().catch(() => console.log("Auto-play blocked"));
          video.muted = true;
        } else {
          video.pause();
        }
      }
    });
  }, [currentSlide]);

  return (
    <section className="relative overflow-hidden min-h-screen">
      {/* Video Background */}
      <div className="absolute inset-0">
        {slides.map((slide, index) => (
          <video
            key={slide.id}
            ref={(el) => {
              videoRefs.current[index] = el;
            }}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
              index === currentSlide ? "opacity-100" : "opacity-0"
            }`}
            loop
            muted
            playsInline
            poster="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2070"
          >
            <source src={slide.video} type="video/mp4" />
          </video>
        ))}
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Secondary Navbar */}
        <nav className="bg-black/30 backdrop-blur-md border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-14">
              {/* Desktop Secondary Nav */}
              <div className="hidden md:flex space-x-8">
                {secondaryNavItems.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className="text-white/80 hover:text-[#D4AF37] text-sm font-medium transition-colors"
                  >
                    {item.name}
                  </a>
                ))}
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden text-white"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>

              {/* Explore World Text */}
              <div className="hidden md:block">
                <p className="text-white/60 text-xs">
                  <span className="text-[#D4AF37]">✦</span> Explore the world with{" "}
                  <span className="text-[#D4AF37]">WEGOMAP</span>
                </p>
              </div>
            </div>
          </div>

          {/* Mobile Secondary Nav */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="md:hidden bg-black/50 backdrop-blur-md"
              >
                <div className="px-4 py-4 space-y-3">
                  {secondaryNavItems.map((item) => (
                    <a
                      key={item.name}
                      href={item.href}
                      className="block text-white/80 hover:text-[#D4AF37] text-sm font-medium transition-colors"
                    >
                      {item.name}
                    </a>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </nav>

        {/* Hero Content */}
        <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-4xl mx-auto text-center w-full">
            {/* Animated Text - moves from bottom to center */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, y: 100 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
                transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
                className="space-y-6"
              >
                {/* Company Name - Different Font */}
                <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-serif tracking-wider">
                  <span className="bg-gradient-to-r from-[#D4AF37] to-yellow-300 bg-clip-text text-transparent">
                    {slides[currentSlide].company}
                  </span>
                </h1>

                {/* Destination Name */}
                <p className="text-white/80 text-lg sm:text-xl tracking-wide uppercase">
                  {slides[currentSlide].tagline}
                </p>

                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white">
                  {slides[currentSlide].destination}
                </h2>
              </motion.div>
            </AnimatePresence>

            {/* Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="mt-12 max-w-2xl mx-auto w-full"
            >
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search Destinations or Events"
                  className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-full py-4 pl-12 pr-24 text-white placeholder-white/50 focus:outline-none focus:border-[#D4AF37] transition-colors"
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 w-5 h-5" />
                <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#D4AF37] text-black px-4 py-2 rounded-full text-sm font-semibold hover:bg-yellow-500 transition">
                  Search
                </button>
              </div>
            </motion.div>

            {/* Blur Button - Discover Now */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="mt-10"
            >
              <button className="group relative px-8 py-3 rounded-full bg-white/10 backdrop-blur-xl border border-white/30 text-white font-semibold overflow-hidden hover:border-[#D4AF37] transition-all duration-300">
                <span className="relative z-10 flex items-center gap-2">
                  Discover Now
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-[#D4AF37]/20 to-yellow-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            </motion.div>

            {/* Slide Navigation Dots */}
            <div className="mt-12 flex justify-center gap-3">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setCurrentSlide(index);
                    setIsPlaying(false);
                    setTimeout(() => setIsPlaying(true), 5000);
                  }}
                  className={`transition-all duration-300 rounded-full ${
                    index === currentSlide
                      ? "w-8 h-2 bg-[#D4AF37]"
                      : "w-2 h-2 bg-white/50 hover:bg-white/80"
                  }`}
                />
              ))}
            </div>

            {/* Play/Pause Button */}
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="mt-6 mx-auto flex items-center gap-2 text-white/70 hover:text-[#D4AF37] transition text-sm"
            >
              {isPlaying ? <Pause size={16} /> : <Play size={16} />}
              {isPlaying ? "Auto-Playing" : "Paused"}
            </button>
          </div>
        </div>

        {/* Bottom Gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
      </div>
    </section>
  );
}