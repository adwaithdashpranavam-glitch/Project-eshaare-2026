"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import Footer from "@/components/layout/Footer";
import { MapPin, Calendar, Users, Star, ArrowRight, MessageSquare, Phone, X, CheckCircle, Loader2, BedDouble, Coffee, UserPlus, Percent, Sparkles, Compass } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, serverTimestamp, setDoc, doc } from "firebase/firestore";
import Image from "next/image";

interface Hotel {
  id: string;
  name: string;
  hotelType: "Luxury Hotels" | "Resorts" | "Villas" | "Family Resorts";
  location: string;
  price: string;
  rating: string;
  image: string;
  description: string;
  roomCount: number;
  extraBed: boolean;
  mealType: string;
  amenities: string[];
  nearbyAttractions: string[];
  offers: string;
  availabilityStatus: "Available" | "Sold Out";
}

const seedHotels: Hotel[] = [
  {
    id: "h1",
    name: "Atlantis The Palm",
    hotelType: "Resorts",
    location: "Dubai, UAE",
    price: "AED 1,499",
    rating: "4.9 (420 reviews)",
    image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=800",
    description: "Experience absolute luxury with world-class aquariums, waterparks, and award-winning dining on the iconic Palm island.",
    roomCount: 1539,
    extraBed: true,
    mealType: "Breakfast & Dinner (Half Board)",
    amenities: ["Wi-Fi", "Swimming Pool", "Spa", "Private Beach", "Fitness Center", "Kids Club", "Fine Dining"],
    nearbyAttractions: ["Aquaventure Waterpark (1 min walk)", "The Lost Chambers Aquarium (2 mins walk)", "The Pointe (10 mins drive)"],
    offers: "Free unlimited access to Aquaventure Waterpark",
    availabilityStatus: "Available"
  },
  {
    id: "h2",
    name: "Soneva Jani Overwater Retreat",
    hotelType: "Villas",
    location: "Noonu Atoll, Maldives",
    price: "AED 4,800",
    rating: "5.0 (180 reviews)",
    image: "https://images.unsplash.com/photo-1439066615861-d1af74d74000?q=80&w=800",
    description: "An ultimate private villa experience complete with a retractable roof for stargazing and a private waterslide into the ocean.",
    roomCount: 51,
    extraBed: false,
    mealType: "All Inclusive",
    amenities: ["Wi-Fi", "Private Pool", "Spa", "Stargazing Observatory", "Outdoor Cinema", "Water Sports", "Butler Service"],
    nearbyAttractions: ["Coral Reef Snorkeling (On-site)", "Private Sandbank Dinner (10 mins boat ride)"],
    offers: "Complimentary private seaplane transfers for 4+ nights",
    availabilityStatus: "Available"
  },
  {
    id: "h3",
    name: "Burj Al Arab Jumeirah",
    hotelType: "Luxury Hotels",
    location: "Dubai, UAE",
    price: "AED 5,500",
    rating: "4.9 (350 reviews)",
    image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=800",
    description: "Known globally as the world's most luxurious hotel, offering duplex suites, private butler service, and an iconic sail silhouette.",
    roomCount: 202,
    extraBed: true,
    mealType: "Breakfast Buffet Included",
    amenities: ["Wi-Fi", "Private Butler", "Infinity Pool", "Private Beach", "Luxury Spa", "Rolls-Royce Chauffeur", "Helipad"],
    nearbyAttractions: ["Wild Wadi Waterpark (5 mins walk)", "Souk Madinat Jumeirah (15 mins walk)"],
    offers: "Complimentary access to Summersalt Beach Club",
    availabilityStatus: "Available"
  },
  {
    id: "h4",
    name: "The Ritz-Carlton Nusa Dua",
    hotelType: "Family Resorts",
    location: "Bali, Indonesia",
    price: "AED 950",
    rating: "4.8 (290 reviews)",
    image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=800",
    description: "Perched on a cliffside overlooking the azure Indian Ocean, offering spacious family suites, kids club, and beach activities.",
    roomCount: 313,
    extraBed: true,
    mealType: "Breakfast & Lunch (Half Board)",
    amenities: ["Wi-Fi", "Large Family Pool", "Spa", "Oceanview Chapel", "Ritz Kids Club", "Fitness Center", "Beachfront Cabanas"],
    nearbyAttractions: ["Geger Beach (5 mins drive)", "Nusa Dua Shopping Center (10 mins drive)", "Uluwatu Temple (35 mins drive)"],
    offers: "Kids stay and eat free under 12 years",
    availabilityStatus: "Available"
  }
];

export default function HotelsPage() {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<string>("All");
  const [searchLocation, setSearchLocation] = useState<string>("");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [adultsCount, setAdultsCount] = useState<number>(2);

  // Firestore list state
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);

  // Callback Modal State
  const [activeHotel, setActiveHotel] = useState<Hotel | null>(null);
  const [callbackName, setCallbackName] = useState("");
  const [callbackPhone, setCallbackPhone] = useState("");
  const [callbackLoading, setCallbackLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const loadHotels = async () => {
      try {
        setLoading(true);
        const querySnapshot = await getDocs(collection(db, "hotels"));
        const list = querySnapshot.docs.map(docItem => ({
          id: docItem.id,
          ...docItem.data()
        })) as Hotel[];

        if (list.length === 0) {
          setHotels(seedHotels);
        } else {
          setHotels(list);
        }
      } catch (err) {
        console.error("Error loading hotels:", err);
        setHotels(seedHotels); // fallback
      } finally {
        setLoading(false);
      }
    };
    loadHotels();
  }, []);

  // Dynamic Filtering Logic
  const filteredHotels = useMemo(() => {
    return hotels.filter((hotel) => {
      const matchesType = selectedType === "All" || hotel.hotelType === selectedType;
      
      const matchesLocation =
        !searchLocation ||
        hotel.location.toLowerCase().includes(searchLocation.toLowerCase()) ||
        hotel.name.toLowerCase().includes(searchLocation.toLowerCase());
        
      return matchesType && matchesLocation;
    });
  }, [selectedType, searchLocation, hotels]);

  const handleCallbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!callbackName || !callbackPhone || !activeHotel) {
      alert("Please fill out all required fields.");
      return;
    }

    try {
      setCallbackLoading(true);
      await addDoc(collection(db, "appointments"), {
        customerName: callbackName,
        name: callbackName,
        phone: callbackPhone,
        visaType: "Hotel Booking",
        serviceType: "Hotel Booking",
        date: dateFrom && dateTo ? `${dateFrom} to ${dateTo}` : "",
        time: "Anytime",
        details: `Callback Inquiry for Hotel: ${activeHotel.name} (${activeHotel.hotelType}). Location: ${activeHotel.location}. Check-in: ${dateFrom || "Not Set"}, Check-out: ${dateTo || "Not Set"}. Guests: ${adultsCount} Adults.`,
        status: "pending",
        createdAt: serverTimestamp(),
      });

      setSubmitted(true);
      setCallbackName("");
      setCallbackPhone("");
    } catch (err) {
      console.error(err);
      alert("An error occurred. Please try again.");
    } finally {
      setCallbackLoading(false);
    }
  };

  return (
    <main className="bg-[#071120] text-white min-h-screen pt-20">
      
      {/* HERO SECTION */}
      <section className="relative pt-20 pb-12 px-6 bg-gradient-to-b from-[#0b1830] to-[#071120]">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-sm font-semibold uppercase tracking-[5px] text-[#00C2FF]">
            Exclusive Stays
          </p>
          <h1 className="mt-4 text-4xl md:text-6xl font-extrabold tracking-tight">
            Discover Exceptional Hotels
          </h1>
          <p className="mt-4 text-white/70 max-w-2xl mx-auto text-base md:text-lg">
            Book curated luxury boutique hotels, private overwater villas, scenic mountain resorts, and premium family getaways worldwide.
          </p>
        </div>

        {/* SEARCH FILTER BOX */}
        <div className="max-w-6xl mx-auto mt-12 p-6 rounded-3xl border border-white/10 bg-[#0b1426]/80 backdrop-blur-xl shadow-2xl relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            
            {/* Location */}
            <div className="relative">
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                Where to? (Location)
              </label>
              <div className="flex items-center h-12 rounded-xl border border-white/10 bg-white/5 px-4 focus-within:border-[#00C2FF] transition">
                <MapPin className="text-[#00C2FF] shrink-0 mr-3 w-5 h-5" />
                <input
                  type="text"
                  placeholder="e.g. Dubai, Maldives..."
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  className="bg-transparent text-white outline-none w-full placeholder:text-white/40 text-sm"
                />
              </div>
            </div>

            {/* Check-In */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                Check In
              </label>
              <div className="flex items-center h-12 rounded-xl border border-white/10 bg-white/5 px-4 focus-within:border-[#00C2FF] transition">
                <Calendar className="text-[#00C2FF] shrink-0 mr-3 w-5 h-5" />
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="bg-transparent text-white outline-none w-full text-sm [color-scheme:dark]"
                />
              </div>
            </div>

            {/* Check-Out */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                Check Out
              </label>
              <div className="flex items-center h-12 rounded-xl border border-white/10 bg-white/5 px-4 focus-within:border-[#00C2FF] transition">
                <Calendar className="text-[#00C2FF] shrink-0 mr-3 w-5 h-5" />
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="bg-transparent text-white outline-none w-full text-sm [color-scheme:dark]"
                />
              </div>
            </div>

            {/* Guests */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                Adults Count
              </label>
              <div className="flex items-center justify-between h-12 rounded-xl border border-white/10 bg-white/5 px-4">
                <div className="flex items-center">
                  <Users className="text-[#00C2FF] shrink-0 mr-3 w-5 h-5" />
                  <span className="text-sm font-semibold text-white">{adultsCount} Adults</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setAdultsCount(Math.max(1, adultsCount - 1))}
                    className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center font-bold text-lg select-none transition"
                  >
                    -
                  </button>
                  <button
                    onClick={() => setAdultsCount(Math.min(10, adultsCount + 1))}
                    className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center font-bold text-lg select-none transition"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

          </div>

          {/* Types Filter Buttons */}
          <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t border-white/10">
            {["All", "Luxury Hotels", "Resorts", "Villas", "Family Resorts"].map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`rounded-full px-5 py-2.5 text-xs md:text-sm font-semibold transition ${
                  selectedType === type
                    ? "bg-[#00C2FF] text-black"
                    : "border border-white/10 bg-white/5 text-white hover:border-[#00C2FF]/40"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* HOTEL LISTING */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold">Featured Accommodations</h2>
            <p className="text-sm text-white/50 mt-1">Showing {filteredHotels.length} option(s)</p>
          </div>
        </div>

        {loading ? (
          <div className="h-[300px] flex flex-col items-center justify-center rounded-[30px] border border-white/10 bg-white/5 text-center">
            <Loader2 className="w-8 h-8 text-[#00C2FF] animate-spin mb-4" />
            <p className="text-gray-400">Loading live hotel stays...</p>
          </div>
        ) : filteredHotels.length === 0 ? (
          <div className="h-[300px] flex flex-col items-center justify-center rounded-[30px] border border-white/10 bg-white/5 text-center">
            <h3 className="text-2xl font-bold">No Accommodations Found</h3>
            <p className="text-white/60 mt-2 max-w-sm">
              We couldn't find matches. Try adjusting your location filters or property types.
            </p>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {filteredHotels.map((hotel) => (
              <div
                key={hotel.id}
                className="group rounded-[30px] border border-white/10 bg-white/5 overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:border-[#00C2FF]/45 backdrop-blur-xl shadow-lg flex flex-col justify-between"
              >
                <div>
                  {/* Image */}
                  <div className="relative h-60 w-full overflow-hidden cursor-pointer" onClick={() => router.push(`/hotels/${hotel.id}`)}>
                    <Image
                      src={hotel.image}
                      alt={hotel.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                    <div className="absolute top-4 left-4 rounded-full bg-[#00C2FF] px-3 py-1 text-xs font-semibold text-black">
                      {hotel.hotelType}
                    </div>
                    <div className="absolute top-4 right-4 rounded-full bg-black/40 backdrop-blur-md px-3 py-1 text-xs font-semibold text-[#00C2FF] flex items-center gap-1 border border-white/10">
                      <Star className="w-3.5 h-3.5 fill-[#00C2FF]" />
                      {hotel.rating.split(" ")[0]}
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-6">
                    <div className="flex items-center text-xs text-white/50 mb-2 gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#00C2FF]" />
                      <span>{hotel.location}</span>
                    </div>
                    <h3 
                      onClick={() => router.push(`/hotels/${hotel.id}`)}
                      className="text-xl font-bold text-white group-hover:text-[#00C2FF] transition cursor-pointer"
                    >
                      {hotel.name}
                    </h3>
                    <p className="mt-3 text-sm text-gray-300 leading-relaxed line-clamp-3">
                      {hotel.description}
                    </p>
                    <p className="mt-3 text-xs text-white/40 font-semibold flex items-center gap-1.5">
                      <BedDouble size={14} className="text-[#00C2FF]" />
                      Total Rooms: {hotel.roomCount || "Luxury"}
                    </p>
                  </div>
                </div>

                {/* Footer price & buttons */}
                <div className="p-6 pt-0 border-t border-white/5 mt-4">
                  <div className="flex items-baseline justify-between mt-4">
                    <div>
                      <p className="text-[10px] text-white/40 uppercase tracking-wider font-semibold">From</p>
                      <h4 className="text-2xl font-bold text-white">{hotel.price} <span className="text-xs text-white/50 font-normal">/ Night</span></h4>
                    </div>
                    <button 
                      onClick={() => router.push(`/hotels/${hotel.id}`)}
                      className="rounded-xl bg-[#00C2FF] hover:bg-[#00a2d5] text-black px-4 py-2.5 text-xs font-semibold transition active:scale-95"
                    >
                      View details
                    </button>
                  </div>

                  {/* Secondary buttons */}
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    <a
                      href={`https://wa.me/971501234567?text=Hi%20Eshaare%2C%20I%20am%20interested%20in%20inquiring%20about%20staying%20at%20${encodeURIComponent(hotel.name)}.`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-1.5 py-2 rounded-xl bg-green-500/10 hover:bg-green-500/20 text-green-400 text-xs font-semibold transition border border-green-500/10"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      WhatsApp
                    </a>
                    <button
                      onClick={() => setActiveHotel(hotel)}
                      className="flex items-center justify-center gap-1.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-semibold transition border border-white/10"
                    >
                      <Phone className="w-3.5 h-3.5 text-[#00C2FF]" />
                      Call Back
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* DYNAMIC LANDING INFO SECTIONS FOR THE HOTEL HOME PAGE */}
      <section className="bg-gradient-to-b from-[#071120] to-[#040b16] py-20 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 space-y-16">
          <div className="text-center space-y-3">
            <span className="text-xs font-bold uppercase tracking-[5px] text-[#00C2FF]">
              Eshaare Standards
            </span>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight">
              Premium Hotel Accommodations
            </h2>
            <p className="text-white/50 text-sm max-w-xl mx-auto leading-relaxed">
              Learn about the hallmark room configurations, premium dining services, flexible family guidelines, and world-class amenities included in our stay catalog.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            {/* 1. ROOM DETAILS */}
            <div className="p-8 rounded-[30px] border border-white/10 bg-white/5 space-y-4 hover:border-[#00C2FF]/30 transition-all duration-300 backdrop-blur-md flex flex-col justify-between">
              <div className="space-y-4">
                <div className="p-3 bg-[#00C2FF]/10 w-fit rounded-2xl border border-[#00C2FF]/20 text-[#00C2FF]">
                  <BedDouble size={24} />
                </div>
                <h3 className="text-xl font-bold text-white">1. Luxury Room Details</h3>
                <p className="text-sm text-gray-400 leading-relaxed font-medium">
                  Choose from an exclusive selection of architectural stay designs tailored for pure luxury and absolute comfort:
                </p>
                <ul className="text-xs text-gray-300 space-y-2.5 pt-2 font-medium">
                  <li className="flex items-start gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#00C2FF] mt-1.5 shrink-0" />
                    <span><strong>Duplex Suites</strong>: Split-level layouts featuring private lounges and workspace desks.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#00C2FF] mt-1.5 shrink-0" />
                    <span><strong>Overwater Retreats</strong>: Built directly above crystal-clear lagoons with glass viewing floor panels.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#00C2FF] mt-1.5 shrink-0" />
                    <span><strong>Private Cliffside Villas</strong>: Feature expansive private decks and secluded infinity plunge pools.</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* 2. MEAL TYPES */}
            <div className="p-8 rounded-[30px] border border-white/10 bg-white/5 space-y-4 hover:border-yellow-500/30 transition-all duration-300 backdrop-blur-md flex flex-col justify-between">
              <div className="space-y-4">
                <div className="p-3 bg-yellow-500/10 w-fit rounded-2xl border border-yellow-500/20 text-yellow-400">
                  <Coffee size={24} />
                </div>
                <h3 className="text-xl font-bold text-white">2. Gastronomy & Meal Types</h3>
                <p className="text-sm text-gray-400 leading-relaxed font-medium">
                  Enjoy world-class dining packages curated by Michelin-trained resort culinary teams:
                </p>
                <ul className="text-xs text-gray-300 space-y-2.5 pt-2 font-medium">
                  <li className="flex items-start gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-yellow-400 mt-1.5 shrink-0" />
                    <span><strong>All-Inclusive Luxury</strong>: Unlimited fine-dining multi-course catalog meals and premium beverages.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-yellow-400 mt-1.5 shrink-0" />
                    <span><strong>Half-Board Indulgence</strong>: Flexible daily gourmet breakfast buffets and evening three-course dinners.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-yellow-400 mt-1.5 shrink-0" />
                    <span><strong>Floating Lagoon Breakfast</strong>: Exclusive private breakfast trays served in your villa pool.</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* 3. EXTRA BED INFO */}
            <div className="p-8 rounded-[30px] border border-white/10 bg-white/5 space-y-4 hover:border-green-500/30 transition-all duration-300 backdrop-blur-md flex flex-col justify-between">
              <div className="space-y-4">
                <div className="p-3 bg-green-500/10 w-fit rounded-2xl border border-green-500/20 text-green-400">
                  <UserPlus size={24} />
                </div>
                <h3 className="text-xl font-bold text-white">3. Extra Bed & Guest Policy</h3>
                <p className="text-sm text-gray-400 leading-relaxed font-medium">
                  We accommodate families of all sizes with flexible room configurations and rollaway selections:
                </p>
                <ul className="text-xs text-gray-300 space-y-2.5 pt-2 font-medium">
                  <li className="flex items-start gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-400 mt-1.5 shrink-0" />
                    <span><strong>Complimentary Extra Cribs</strong>: Safe sleep setups for toddlers under 2 years old.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-400 mt-1.5 shrink-0" />
                    <span><strong>Rollaway Single Beds</strong>: Available for older children/adults (charged per night, request on booking).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-400 mt-1.5 shrink-0" />
                    <span><strong>Daybed Conversions</strong>: High-end rooms feature lounge couches convertible to twin beds.</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* 4. OFFERS */}
            <div className="p-8 rounded-[30px] border border-white/10 bg-white/5 space-y-4 hover:border-orange-500/30 transition-all duration-300 backdrop-blur-md flex flex-col justify-between">
              <div className="space-y-4">
                <div className="p-3 bg-orange-500/10 w-fit rounded-2xl border border-orange-500/20 text-orange-400">
                  <Percent size={24} />
                </div>
                <h3 className="text-xl font-bold text-white">4. Special Offers & Packages</h3>
                <p className="text-sm text-gray-400 leading-relaxed font-medium">
                  Maximize your travel budget with hand-picked complimentary upgrades and promotions:
                </p>
                <ul className="text-xs text-gray-300 space-y-2.5 pt-2 font-medium">
                  <li className="flex items-start gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-orange-400 mt-1.5 shrink-0" />
                    <span><strong>Free Resort Transfers</strong>: Complimentary round-trip speedboat/seaplane access (4+ nights).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-orange-400 mt-1.5 shrink-0" />
                    <span><strong>Theme Park Passports</strong>: Unlimited complimentary access to partner theme parks and marine bays.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-orange-400 mt-1.5 shrink-0" />
                    <span><strong>Kids Eat Free</strong>: Complimentary dining menus for kids under 12 staying in the same villa.</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* 5. AMENITIES */}
            <div className="p-8 rounded-[30px] border border-white/10 bg-white/5 space-y-4 hover:border-purple-500/30 transition-all duration-300 backdrop-blur-md flex flex-col justify-between">
              <div className="space-y-4">
                <div className="p-3 bg-purple-500/10 w-fit rounded-2xl border border-purple-500/20 text-purple-400">
                  <Sparkles size={24} />
                </div>
                <h3 className="text-xl font-bold text-white">5. World-Class Amenities</h3>
                <p className="text-sm text-gray-400 leading-relaxed font-medium">
                  Indulge in amenities designed to elevate your stay to an international luxury standard:
                </p>
                <ul className="text-xs text-gray-300 space-y-2.5 pt-2 font-medium">
                  <li className="flex items-start gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-purple-400 mt-1.5 shrink-0" />
                    <span><strong>24/7 Private Butler</strong>: Personalized assistance for unpacking, room service, and itinerary planning.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-purple-400 mt-1.5 shrink-0" />
                    <span><strong>Infinity Pools & Spas</strong>: Overlooking skylines and ocean shorelines with dedicated wellness treatments.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-purple-400 mt-1.5 shrink-0" />
                    <span><strong>Exclusive Shorelines</strong>: Reserved private sand beaches and beachfront lounge cabanas.</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* 6. NEARBY PLACES */}
            <div className="p-8 rounded-[30px] border border-white/10 bg-white/5 space-y-4 hover:border-red-500/30 transition-all duration-300 backdrop-blur-md flex flex-col justify-between">
              <div className="space-y-4">
                <div className="p-3 bg-red-500/10 w-fit rounded-2xl border border-red-500/20 text-red-400">
                  <Compass size={24} />
                </div>
                <h3 className="text-xl font-bold text-white">6. Nearby Places & Attractions</h3>
                <p className="text-sm text-gray-400 leading-relaxed font-medium">
                  Our stays are positioned near the world's most sought-after landmarks and local excursions:
                </p>
                <ul className="text-xs text-gray-300 space-y-2.5 pt-2 font-medium">
                  <li className="flex items-start gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-400 mt-1.5 shrink-0" />
                    <span><strong>Waterparks & Marine Bays</strong>: Standard packages are located minutes away from aquariums and parks.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-400 mt-1.5 shrink-0" />
                    <span><strong>Historic Shopping Souks</strong>: Walkable access to famous heritage malls and open air traditional markets.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-400 mt-1.5 shrink-0" />
                    <span><strong>Marine Snorkeling Reserves</strong>: Protected coral reserves located directly off the resort beachfronts.</span>
                  </li>
                </ul>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* CALLBACK POPUP MODAL */}
      {activeHotel && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-md px-6">
          <div className="relative max-w-md w-full p-8 rounded-[35px] border border-white/10 bg-[#0b1426] shadow-2xl text-left overflow-hidden animate-in fade-in zoom-in-95">
            <button
              onClick={() => {
                setActiveHotel(null);
                setSubmitted(false);
              }}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition border border-white/10 text-white"
            >
              <X className="w-4 h-4" />
            </button>

            {!submitted ? (
              <form onSubmit={handleCallbackSubmit}>
                <h3 className="text-xl font-bold text-white mb-2">Request callback</h3>
                <p className="text-xs text-white/50 mb-6">
                  Fill in your details to book/enquire about <span className="text-[#00C2FF] font-semibold">{activeHotel.name}</span>.
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">
                      Your Full Name
                    </label>
                    <input
                      type="text"
                      placeholder="John Doe"
                      required
                      value={callbackName}
                      onChange={(e) => setCallbackName(e.target.value)}
                      className="w-full h-11 rounded-xl bg-[#071120] border border-white/10 px-4 text-white outline-none focus:border-[#00C2FF] focus:bg-white/5 transition text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      placeholder="+971 50 123 4567"
                      required
                      value={callbackPhone}
                      onChange={(e) => setCallbackPhone(e.target.value)}
                      className="w-full h-11 rounded-xl bg-[#071120] border border-white/10 px-4 text-white outline-none focus:border-[#00C2FF] focus:bg-white/5 transition text-sm"
                    />
                  </div>

                  {dateFrom && dateTo && (
                    <div className="p-3 bg-white/5 rounded-xl border border-white/5 text-xs text-white/60">
                      <span className="font-semibold text-white">Selected Dates:</span> {dateFrom} to {dateTo} ({adultsCount} Adults)
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={callbackLoading}
                    className="w-full h-12 rounded-xl bg-[#00C2FF] text-black font-bold hover:bg-[#00a2d5] transition flex items-center justify-center gap-2 disabled:opacity-50 mt-2 cursor-pointer"
                  >
                    {callbackLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      "Request Callback"
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <div className="text-center py-4">
                <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
                <h3 className="text-xl font-bold text-white mb-2">Request Sent!</h3>
                <p className="text-gray-300 text-sm">
                  We have registered your callback request for {activeHotel.name}. Our hotel reservations desk will contact you soon.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setActiveHotel(null);
                    setSubmitted(false);
                  }}
                  className="mt-6 w-full py-2.5 rounded-xl border border-white/20 text-white text-sm font-semibold hover:bg-white/5 transition"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <Footer />
    </main>
  );
}