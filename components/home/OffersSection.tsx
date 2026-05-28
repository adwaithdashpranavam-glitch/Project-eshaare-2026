"use client";

import { useEffect, useState, useRef } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Image from "next/image";
import Link from "next/link";
import { Tag, Timer, ChevronRight } from "lucide-react";

interface Offer {
  id: string;
  title: string;
  description: string;
  discountText: string;
  offerType: string;
  expiryDate: string;
  targetUrl: string;
  image: string;
  active: boolean;
}

// Countdown Clock Component
function CountdownClock({ expiryDate, onExpire }: { expiryDate: string; onExpire?: () => void }) {
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null);

  // Keep a mutable ref of the callback to avoid resetting the timer interval when it changes
  const onExpireRef = useRef(onExpire);
  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  useEffect(() => {
    const calculateTime = () => {
      const diff = +new Date(expiryDate) - +new Date();
      if (diff <= 0) return null;
      return {
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / 1000 / 60) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      };
    };

    const initial = calculateTime();
    setTimeLeft(initial);
    if (!initial) {
      onExpireRef.current?.();
    }

    const interval = setInterval(() => {
      const left = calculateTime();
      setTimeLeft(left);
      if (!left) {
        clearInterval(interval);
        onExpireRef.current?.();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiryDate]);

  if (!timeLeft) {
    return <span className="text-red-500 font-extrabold uppercase text-[10px] tracking-wide bg-white/90 backdrop-blur-md rounded-lg p-1.5 shadow-sm border border-red-100">Deal Ended</span>;
  }

  return (
    <div className="flex items-center gap-1 bg-black/55 backdrop-blur-md rounded-lg p-1.5 border border-white/10 text-[10px] md:text-xs font-black tracking-wider text-white shadow-md">
      <Timer size={12} className="text-[#e68932] mr-0.5" />
      <span className="text-[#e68932]">{timeLeft.days}d</span>
      <span className="text-white/30">:</span>
      <span>{timeLeft.hours}h</span>
      <span className="text-white/30">:</span>
      <span>{timeLeft.minutes}m</span>
      <span className="text-white/30">:</span>
      <span className="text-yellow-400">{timeLeft.seconds}s</span>
    </div>
  );
}

export default function OffersSection() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOffers = async () => {
      try {
        // Query active offers only
        const q = query(collection(db, "offers"), where("active", "==", true));
        const snap = await getDocs(q);
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() })) as Offer[];
        
        // Filter out expired offers client-side for safety
        const nowStr = new Date().toISOString().split("T")[0];
        const activeList = list.filter(o => o.expiryDate >= nowStr);

        setOffers(activeList);
      } catch (err) {
        console.error("Error loading offers:", err);
      } finally {
        setLoading(false);
      }
    };
    loadOffers();
  }, []);

  const handleExpire = (id: string) => {
    setOffers(prev => prev.filter(o => o.id !== id));
  };

  // If loading or no active offers exist, render absolutely nothing
  // to protect the homepage layout from breaking/showing default placeholders
  if (loading || offers.length === 0) {
    return null;
  }

  return (
    <section className="w-full bg-[#f5f5f5] py-20 px-4 md:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between border-b border-gray-200 pb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-[4px] text-[#e68932] flex items-center gap-1.5">
              <Tag size={12} />
              Limited Campaigns
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight text-[#071120] mt-2 md:text-4xl">
              Special Flash Offers
            </h2>
          </div>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {offers.map((offer) => (
            <div
              key={offer.id}
              className="group relative rounded-[30px] border border-gray-100 bg-white overflow-hidden flex flex-col justify-between hover:border-[#e68932]/20 hover:shadow-2xl transition-all duration-500 min-h-[240px] shadow-sm"
            >
              {/* Background Image Overlay */}
              <div className="absolute inset-0 z-0">
                <Image
                  src={offer.image}
                  alt={offer.title}
                  fill
                  priority={false}
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                {/* Clean premium gradient overlay: white text background on left, fading to transparent image on right */}
                <div className="absolute inset-0 bg-gradient-to-r from-white via-white/95 via-white/80 to-transparent" />
              </div>

              {/* Content layer */}
              <div className="relative z-10 p-7 flex flex-col justify-between h-full space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <span className="rounded-full bg-[#e68932] text-white px-3.5 py-1 text-[10px] font-extrabold uppercase tracking-wide shadow-sm">
                    {offer.discountText}
                  </span>
                  <CountdownClock expiryDate={offer.expiryDate} onExpire={() => handleExpire(offer.id)} />
                </div>

                <div className="space-y-2.5 max-w-[75%] md:max-w-[70%]">
                  <h3 className="text-lg md:text-xl font-extrabold text-[#071120] leading-snug group-hover:text-[#e68932] transition-colors duration-300">
                    {offer.title}
                  </h3>
                  <p className="text-xs text-gray-600 leading-relaxed font-semibold line-clamp-2">
                    {offer.description}
                  </p>
                </div>

                <div className="pt-2">
                  <Link
                    href={offer.targetUrl}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#e68932] hover:text-[#cf7726] transition-colors duration-300"
                  >
                    Claim Offer Now
                    <ChevronRight size={14} />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
