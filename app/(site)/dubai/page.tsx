"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Footer from "@/components/layout/Footer";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, limit } from "firebase/firestore";
import { 
  MapPin, 
  Compass, 
  Sparkles, 
  Waves, 
  Sunset, 
  Music, 
  CalendarDays, 
  Star, 
  ArrowRight,
  Phone,
  MessageSquare,
  Hotel,
  Loader2
} from "lucide-react";
import Image from "next/image";

export default function DubaiExperiencePage() {
  const [hotels, setHotels] = useState<any[]>([]);
  const [loadingHotels, setLoadingHotels] = useState(true);

  // Fetch Dubai hotels from Firestore
  useEffect(() => {
    const fetchDubaiHotels = async () => {
      try {
        setLoadingHotels(true);
        const q = query(
          collection(db, "hotels"),
          where("location", "==", "Dubai, UAE"),
          limit(3)
        );
        const snap = await getDocs(q);
        const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setHotels(list);
      } catch (err) {
        console.error("Error fetching Dubai hotels:", err);
      } finally {
        setLoadingHotels(false);
      }
    };
    fetchDubaiHotels();
  }, []);

  const attractions = [
    {
      name: "Burj Khalifa",
      desc: "Stand on top of the world at the 148th floor observatory, soaring 828m above the clouds.",
      image: "https://images.unsplash.com/photo-1582672060674-bc2bd808a8b5?q=80&w=600"
    },
    {
      name: "Palm Jumeirah",
      desc: "The world-famous tree-shaped artificial archipelago featuring private beaches and super resorts.",
      image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=600"
    },
    {
      name: "Museum of the Future",
      desc: "Step 50 years into the future inside the world's most beautiful architectural masterpiece.",
      image: "https://images.unsplash.com/photo-1647427017067-8f33ccbae493?q=80&w=600"
    }
  ];

  const luxuryTours = [
    {
      name: "Private Yacht Rental",
      desc: "Cruise the Arabian Gulf in a custom luxury superyacht with a personal crew and buffet dinner.",
      price: "From AED 450/hr",
      icon: <Waves className="w-6 h-6 text-blue-400" />
    },
    {
      name: "Scenic Helicopter Tour",
      desc: "Take off from Atlantis and fly above the Palm Jumeirah, Burj Al Arab, and Dubai canals.",
      price: "From AED 699/person",
      icon: <Sparkles className="w-6 h-6 text-yellow-400" />
    },
    {
      name: "Supercar Desert Drive",
      desc: "Pilot a Lamborghini or Ferrari through winding desert roads with guided pacing.",
      price: "From AED 1,800/day",
      icon: <Compass className="w-6 h-6 text-red-400" />
    }
  ];

  const safaris = [
    {
      name: "Premium Red Dunes Safari",
      desc: "Thrilling dune bashing, camel riding, sandboarding, and live BBQ dinner show in an VIP desert camp.",
      image: "https://images.unsplash.com/photo-1473580044384-7ba9967e16a0?q=80&w=800"
    },
    {
      name: "Overnight Bedouin Camping",
      desc: "Sleep under the clear desert stars inside traditional tents, with sunrise breakfast and falconry.",
      image: "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?q=80&w=800"
    }
  ];

  const events = [
    { name: "Dubai Shopping Festival", date: "Dec 2026 - Jan 2027", desc: "Unbelievable discounts, daily raffles, and citywide fireworks." },
    { name: "Dubai Food Festival", date: "April 2026", desc: "Fine dining beach pop-ups and masterclasses by global Michelin chefs." },
    { name: "Dubai World Cup", date: "March 2026", desc: "The richest horse racing day in the world at Meydan Racecourse." }
  ];

  return (
    <main className="bg-[#040b16] text-white min-h-screen">
      
      {/* 1. DUBAI HERO HEADER */}
      <section className="relative h-[85vh] w-full flex items-center justify-center overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=1920"
          alt="Dubai Skyline"
          fill
          priority
          className="object-cover object-center scale-105 animate-pulse-slow"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-[#040b16]" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center space-y-6">
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-xs font-bold uppercase tracking-widest text-[#e68932]">
            <Sparkles size={12} />
            Ultimate Luxury Portal
          </span>
          <h1 className="text-5xl md:text-8xl font-black tracking-tight leading-none uppercase">
            Dubai <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#e68932] to-amber-400">Experience</span>
          </h1>
          <p className="text-white/80 max-w-2xl mx-auto text-base md:text-xl font-medium leading-relaxed">
            Unveil the city of gold. Explore record-breaking architecture, high-adrenaline desert safaris, private yachts, and Michelin dining.
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <Link href="#attractions" className="bg-[#e68932] hover:bg-[#cf7726] text-white px-8 py-3.5 rounded-full font-bold text-sm transition-transform hover:scale-[1.02] shadow-lg shadow-yellow-600/10">
              Explore Attractions
            </Link>
            <Link href="/#inquiry" className="bg-white/5 border border-white/10 hover:bg-white/10 text-white px-8 py-3.5 rounded-full font-bold text-sm transition">
              Custom Tour Inquiry
            </Link>
          </div>
        </div>
      </section>

      {/* 2. ICONIC PLACES & ATTRACTIONS */}
      <section id="attractions" className="max-w-7xl mx-auto px-6 py-20 space-y-12">
        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-[4px] text-[#e68932]">Must-See Highlights</p>
          <h2 className="text-3xl md:text-5xl font-black mt-3">Iconic Landmarks</h2>
          <p className="text-white/50 text-sm mt-3 max-w-lg mx-auto">Discover the sights that make Dubai one of the most visited destinations on Earth.</p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {attractions.map((attr) => (
            <div key={attr.name} className="group rounded-[30px] border border-white/10 bg-white/5 overflow-hidden transition-all duration-300 hover:border-yellow-500/30">
              <div className="relative h-60 w-full">
                <Image
                  src={attr.image}
                  alt={attr.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-white group-hover:text-[#e68932] transition">{attr.name}</h3>
                <p className="text-sm text-gray-400 mt-2 leading-relaxed">{attr.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. DESERT SAFARI SECTION */}
      <section className="bg-[#061020] border-y border-white/5 py-20">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="text-xs font-bold uppercase tracking-widest text-[#e68932] flex items-center gap-1.5"><Sunset size={14} /> Golden Desert Adventures</span>
            <h2 className="text-3xl md:text-5xl font-black leading-tight">Dubai Desert Safaris</h2>
            <p className="text-gray-300 text-sm leading-8 font-medium">
              Venture into the heart of Dubai's conservation reserve. Experience high-octane 4x4 dune bashing, camel trekking, sandboarding, and traditional Arabian hospitality at our luxury desert camps.
            </p>
            <div className="space-y-4 pt-2">
              {safaris.map((s) => (
                <div key={s.name} className="flex gap-4 p-4 rounded-2xl border border-white/5 bg-white/5">
                  <div className="relative h-20 w-28 rounded-xl overflow-hidden shrink-0">
                    <img src={s.image} alt={s.name} className="h-full w-full object-cover" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-base">{s.name}</h4>
                    <p className="text-xs text-gray-400 mt-1">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative h-[480px] rounded-[35px] overflow-hidden border border-white/10 shadow-2xl">
            <Image
              src="https://images.unsplash.com/photo-1473580044384-7ba9967e16a0?q=80&w=800"
              alt="Dubai Desert Safari"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#061020]/90 to-transparent" />
            <div className="absolute bottom-8 left-8 right-8 text-center p-6 rounded-2xl border border-white/10 bg-black/60 backdrop-blur-md">
              <h4 className="font-bold text-white text-lg">Book Private Desert Tour</h4>
              <p className="text-xs text-gray-300 mt-1">Starting from AED 180 / Person</p>
              <Link href="/#inquiry" className="mt-4 inline-block bg-[#e68932] text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-[#cf7726] transition">
                Book Safari Now
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 4. LUXURY EXPERIENCES */}
      <section className="max-w-7xl mx-auto px-6 py-20 space-y-12">
        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-[4px] text-[#e68932]">Premium Lifestyles</p>
          <h2 className="text-3xl md:text-5xl font-black mt-3">Luxury Travel Services</h2>
          <p className="text-white/50 text-sm mt-3 max-w-lg mx-auto">Elevate your stay with Eshaare's signature VIP services and customized private itineraries.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {luxuryTours.map((tour) => (
            <div key={tour.name} className="p-8 rounded-[30px] border border-white/10 bg-white/5 space-y-4 hover:border-yellow-500/20 transition-all duration-300 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="p-3 bg-white/5 w-fit rounded-2xl border border-white/10">
                  {tour.icon}
                </div>
                <h3 className="text-xl font-bold text-white">{tour.name}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{tour.desc}</p>
              </div>
              <div className="flex items-center justify-between border-t border-white/5 pt-4 mt-6">
                <span className="text-sm font-bold text-[#e68932]">{tour.price}</span>
                <Link href="/#inquiry" className="text-xs text-blue-400 font-bold hover:underline flex items-center gap-0.5">
                  Book VIP <ArrowRight size={12} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. FINE HOTELS IN DUBAI */}
      <section className="bg-[#050c18] border-t border-white/5 py-20">
        <div className="max-w-7xl mx-auto px-6 space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#e68932] flex items-center gap-1"><Hotel size={12} /> Luxury Lodgings</p>
              <h2 className="text-3xl md:text-5xl font-black mt-3">Premium Dubai Hotels</h2>
              <p className="text-white/50 text-sm mt-2">Book the most exclusive and world-renowned stays directly through our reservations desk.</p>
            </div>
            <Link href="/hotels" className="text-sm text-[#00C2FF] font-bold hover:underline shrink-0 flex items-center gap-1">
              View All Hotels <ArrowRight size={14} />
            </Link>
          </div>

          {loadingHotels ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 text-[#00C2FF] animate-spin" />
            </div>
          ) : hotels.length === 0 ? (
            <div className="text-center py-12 bg-white/5 rounded-3xl border border-white/5">
              <p className="text-gray-500 text-sm font-semibold">No hotels registered in Dubai currently.</p>
            </div>
          ) : (
            <div className="grid gap-8 md:grid-cols-3">
              {hotels.map((hotelItem) => (
                <div key={hotelItem.id} className="group rounded-[25px] border border-white/10 bg-white/5 overflow-hidden flex flex-col justify-between hover:border-[#00C2FF]/30 transition duration-300">
                  <div className="relative h-56 w-full">
                    <Image
                      src={hotelItem.image}
                      alt={hotelItem.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover transition duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-4 left-4 rounded-full bg-[#00C2FF] px-3 py-1 text-[10px] font-bold text-black uppercase">
                      {hotelItem.hotelType}
                    </div>
                  </div>
                  <div className="p-5 space-y-3">
                    <h3 className="font-bold text-lg text-white">{hotelItem.name}</h3>
                    <p className="text-xs text-gray-400 line-clamp-2">{hotelItem.description}</p>
                    <div className="flex items-center justify-between border-t border-white/5 pt-3 mt-4">
                      <span className="text-sm font-extrabold text-white">{hotelItem.price} <span className="text-[10px] text-gray-500 font-normal">/ Night</span></span>
                      <Link href={`/hotels/${hotelItem.id}`} className="text-xs text-[#00C2FF] font-bold hover:underline">
                        Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 6. NIGHTLIFE, DINING & EVENTS */}
      <section className="max-w-7xl mx-auto px-6 py-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6 order-2 lg:order-1">
          <span className="text-xs font-bold uppercase tracking-widest text-[#e68932] flex items-center gap-1.5"><CalendarDays size={14} /> Dubai Calendars</span>
          <h2 className="text-3xl md:text-5xl font-black">Upcoming Events & Festivals</h2>
          <p className="text-gray-300 text-sm leading-8 font-medium">
            Plan your stay around Dubai's major seasonal festivals. From elite horse racing cups and chef masterclasses to month-long shopping discounts and live arena concerts.
          </p>

          <div className="space-y-4">
            {events.map((e, idx) => (
              <div key={idx} className="p-5 rounded-2xl bg-white/5 border border-white/5">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-white text-base">{e.name}</h4>
                  <span className="text-xs text-[#e68932] font-semibold">{e.date}</span>
                </div>
                <p className="text-xs text-gray-400 mt-2">{e.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative h-[480px] rounded-[35px] overflow-hidden border border-white/10 shadow-2xl order-1 lg:order-2">
          <Image
            src="https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=800"
            alt="Dubai Event Nightlife"
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#040b16]/95 to-transparent" />
          <div className="absolute bottom-8 left-8 right-8 text-center p-6 rounded-2xl border border-white/10 bg-black/60 backdrop-blur-md flex flex-col items-center gap-1">
            <Music className="w-8 h-8 text-[#e68932] mb-1 animate-bounce" />
            <h4 className="font-bold text-white text-lg">Dubai Beach Clubs & Nightlife</h4>
            <p className="text-xs text-gray-300 mt-1">Book reservations at Dubai's most exclusive rooftop lounges and clubs.</p>
            <Link href="/#inquiry" className="mt-4 inline-block bg-[#e68932] text-white px-6 py-2.5 rounded-xl text-xs font-bold hover:bg-[#cf7726] transition">
              Get VIP Reservations
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
