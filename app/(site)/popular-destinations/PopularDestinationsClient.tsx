"use client";

import { useState, useMemo } from "react";
import { Search, MapPin, Calendar, Compass, ArrowRight, Camera } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface EventItem {
  id: string;
  title: string;
  type: "Trending" | "Festivals" | "Activities" | "Highlights";
  location: string;
  date: string;
  image: string;
  description: string;
  price: string;
}

export default function PopularDestinationsClient({
  initialItems,
  galleryPhotos,
}: {
  initialItems: EventItem[];
  galleryPhotos: string[];
}) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string>("All");

  const filteredItems = useMemo(() => {
    return initialItems.filter((item) => {
      const matchesSearch = 
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.location.toLowerCase().includes(search.toLowerCase()) ||
        item.description.toLowerCase().includes(search.toLowerCase());
      
      const matchesFilter = filter === "All" || item.type === filter;
      return matchesSearch && matchesFilter;
    });
  }, [search, filter, initialItems]);

  return (
    <>
      {/* SEARCH AND FILTERS */}
      <div className="max-w-4xl mx-auto mt-12 space-y-6 p-6 rounded-3xl border border-white/10 bg-[#0b1426]/85 backdrop-blur-md shadow-xl">
        <div className="flex items-center h-12 rounded-xl border border-white/10 bg-white/5 px-4 focus-within:border-[#00C2FF] transition">
          <Search className="text-gray-400 mr-3 w-5 h-5" />
          <input
            type="text"
            placeholder="Search destinations, festivals, activities..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent text-white outline-none w-full placeholder:text-white/40 text-sm"
          />
        </div>

        <div className="flex flex-wrap gap-2.5 pt-4 border-t border-white/5 justify-center">
          {["All", "Trending", "Festivals", "Activities", "Highlights"].map((category) => (
            <button
              key={category}
              onClick={() => setFilter(category)}
              className={`rounded-full px-5 py-2.5 text-xs font-semibold transition cursor-pointer ${
                filter === category
                  ? "bg-[#00C2FF] text-black shadow-md"
                  : "border border-white/10 bg-white/5 text-white hover:border-[#00C2FF]/30"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* DYNAMIC Grid */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        {filteredItems.length === 0 ? (
          <div className="text-center py-20 border border-white/10 rounded-[35px] bg-white/5">
            <Compass className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold">No Events or Destinations Found</h3>
            <p className="text-gray-400 text-sm mt-1">Try modifying your search text or switching categories.</p>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {filteredItems.map((item) => (
              <div 
                key={item.id}
                className="group rounded-[30px] border border-white/10 bg-white/5 overflow-hidden flex flex-col justify-between hover:border-[#00C2FF]/30 transition duration-300 backdrop-blur-sm"
              >
                <div>
                  <div className="relative h-56 w-full overflow-hidden">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute top-4 left-4 rounded-full bg-[#00C2FF] px-3 py-1 text-[10px] font-bold text-black uppercase">
                      {item.type}
                    </div>
                  </div>
                  <div className="p-6 space-y-3">
                    <div className="flex items-center gap-1.5 text-xs text-[#00C2FF] font-semibold">
                      <MapPin size={14} />
                      <span>{item.location}</span>
                    </div>
                    <h3 className="text-lg font-bold text-white group-hover:text-[#00C2FF] transition line-clamp-1">{item.title}</h3>
                    <p className="text-xs text-gray-400 leading-relaxed line-clamp-3">{item.description}</p>
                  </div>
                </div>
                <div className="p-6 pt-0 border-t border-white/5 mt-4">
                  <div className="flex items-center justify-between pt-4">
                    <div className="flex items-center gap-1 text-[10px] text-gray-400 font-semibold">
                      <Calendar size={12} className="text-gray-500" />
                      <span>{item.date}</span>
                    </div>
                    <Link href="/packages" className="text-xs text-[#00C2FF] font-bold hover:underline flex items-center gap-0.5">
                      Explore Tours <ArrowRight size={12} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* MEDIA GALLERY */}
      <section className="max-w-7xl mx-auto px-6 py-16 border-t border-white/5 space-y-8">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2"><Camera className="text-[#00C2FF]" /> Media Highlights Gallery</h2>
          <p className="text-sm text-gray-400 mt-1">Stunning snippets of culture, activities, and environments from our destinations.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {galleryPhotos.map((photoUrl, idx) => (
            <div key={idx} className="relative h-32 rounded-2xl overflow-hidden border border-white/5 group">
              <Image
                src={photoUrl}
                alt=""
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw"
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                <Camera size={18} className="text-[#00C2FF]" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
