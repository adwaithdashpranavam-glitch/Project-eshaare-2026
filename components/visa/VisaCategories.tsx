import React from "react";
import Image from "next/image";
import Link from "next/link";
import { getCachedVisaCategories, VisaCategory } from "@/lib/cms";

const fallbackCategories = [
  { 
    name: "Schengen Visa", 
    image: "https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?q=80&w=600&auto=format&fit=crop", 
    desc: "Access 27 European countries seamlessly.",
    href: "/visa/schengen"
  },
  { 
    name: "UK Visa", 
    image: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?q=80&w=600&auto=format&fit=crop", 
    desc: "Visit England, Scotland, Wales, and Northern Ireland.",
    href: "/visa/uk"
  },
  { 
    name: "USA Visa", 
    image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?q=80&w=600&auto=format&fit=crop", 
    desc: "Business, tourism, and study visa assistance.",
    href: "/visa/usa"
  },
  { 
    name: "Japan Visa", 
    image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=600&auto=format&fit=crop", 
    desc: "Experience the culture and beauty of Japan.",
    href: "/visa/japan"
  },
  { 
    name: "Korea Visa", 
    image: "https://images.unsplash.com/photo-1538485399081-7191377e8241?q=80&w=600&auto=format&fit=crop", 
    desc: "Discover South Korea with ease.",
    href: "https://wa.me/971501234567?text=Hi%20Eshaare%2C%20I%20am%20interested%20in%20applying%20for%20a%20South%20Korea%20Visa."
  },
  { 
    name: "UAE Visa", 
    image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=600&auto=format&fit=crop", 
    desc: "Quick processing for Dubai and other Emirates.",
    href: "https://wa.me/971501234567?text=Hi%20Eshaare%2C%20I%20am%20interested%20in%20applying%20for%20a%20UAE%20Visa."
  },
  { 
    name: "Saudi Visa", 
    image: "https://images.unsplash.com/photo-1580418827493-f2b22c0a76cb?q=80&w=600&auto=format&fit=crop", 
    desc: "Umrah, business, and tourist visa services.",
    href: "https://wa.me/971501234567?text=Hi%20Eshaare%2C%20I%20am%20interested%20in%20applying%20for%20a%20Saudi%20Arabia%20Visa."
  },
  { 
    name: "Tourist Visa", 
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=600&auto=format&fit=crop", 
    desc: "Explore destinations across the globe.",
    href: "https://wa.me/971501234567?text=Hi%20Eshaare%2C%20I%20am%20interested%20in%20applying%20for%20a%20Tourist%20Visa."
  },
  { 
    name: "Business Visa", 
    image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=600&auto=format&fit=crop", 
    desc: "Fast-track visas for corporate travel.",
    href: "https://wa.me/971501234567?text=Hi%20Eshaare%2C%20I%20am%20interested%20in%20applying%20for%20a%20Business%20Visa."
  },
];

export default async function VisaCategories() {
  let categories: VisaCategory[] = [];
  try {
    categories = await getCachedVisaCategories();
    if (categories.length === 0) {
      categories = fallbackCategories;
    }
  } catch (error) {
    console.error("Firebase visa category fetch error, using fallbacks:", error);
    categories = fallbackCategories;
  }

  return (
    <section id="categories" className="py-20 px-4 md:px-8 bg-[#071120]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-sm font-semibold uppercase tracking-widest text-[#00C2FF] mb-3">Choose Your Destination</p>
          <h2 className="text-4xl md:text-5xl font-extrabold text-white">Popular Visa Categories</h2>
          <p className="mt-4 text-gray-400 max-w-2xl mx-auto text-lg">We provide expert assistance for a wide range of visa categories globally.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((cat, idx) => (
            <div key={idx} className="group rounded-[24px] border border-white/10 bg-white/5 overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
              <div className="relative h-48 w-full overflow-hidden">
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <h3 className="absolute bottom-4 left-6 text-2xl font-bold text-white">{cat.name}</h3>
              </div>
              <div className="p-6">
                <p className="text-gray-300 mb-6">{cat.desc}</p>
                <Link 
                  href={cat.href}
                  className="block w-full py-3 rounded-xl bg-white/5 border border-white/10 text-white font-semibold group-hover:bg-[#00C2FF] group-hover:text-black transition-colors duration-300 text-center"
                >
                  Apply Now
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
