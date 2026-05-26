"use client";

import { useState, useMemo } from "react";
import Footer from "@/components/layout/Footer";
import { MapPin, Calendar, Users, Star, ArrowRight, MessageSquare, Phone, X, CheckCircle, Loader2 } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import Image from "next/image";

interface Hotel {
  id: string;
  name: string;
  type: "Luxury Hotels" | "Resorts" | "Villas" | "Family Resorts";
  location: string;
  price: string;
  rating: string;
  image: string;
  description: string;
  maxAdults: number;
}

const mockHotels: Hotel[] = [
  {
    id: "h1",
    name: "Atlantis The Palm",
    type: "Resorts",
    location: "Dubai, UAE",
    price: "AED 1,499",
    rating: "4.9 (420 reviews)",
    image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=800",
    description: "Experience absolute luxury with world-class aquariums, waterparks, and award-winning dining on the iconic Palm island.",
    maxAdults: 4,
  },
  {
    id: "h2",
    name: "Soneva Jani Overwater Retreat",
    type: "Villas",
    location: "Noonu Atoll, Maldives",
    price: "AED 4,800",
    rating: "5.0 (180 reviews)",
    image: "https://images.unsplash.com/photo-1439066615861-d1af74d74000?q=80&w=800",
    description: "An ultimate private villa experience complete with a retractable roof for stargazing and a private waterslide into the ocean.",
    maxAdults: 2,
  },
  {
    id: "h3",
    name: "Burj Al Arab Jumeirah",
    type: "Luxury Hotels",
    location: "Dubai, UAE",
    price: "AED 5,500",
    rating: "4.9 (350 reviews)",
    image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=800",
    description: "Known globally as the world's most luxurious hotel, offering duplex suites, private butler service, and an iconic sail silhouette.",
    maxAdults: 3,
  },
  {
    id: "h4",
    name: "The Ritz-Carlton Nusa Dua",
    type: "Family Resorts",
    location: "Bali, Indonesia",
    price: "AED 950",
    rating: "4.8 (290 reviews)",
    image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=800",
    description: "Perched on a cliffside overlooking the azure Indian Ocean, offering spacious family suites, kids club, and beach activities.",
    maxAdults: 6,
  },
  {
    id: "h5",
    name: "Aman Tokyo Sanctuary",
    type: "Luxury Hotels",
    location: "Tokyo, Japan",
    price: "AED 2,900",
    rating: "4.9 (120 reviews)",
    image: "https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=800",
    description: "A serene urban sanctuary high above Tokyo, blending traditional Japanese minimalism with premium modern comforts.",
    maxAdults: 2,
  },
  {
    id: "h6",
    name: "Villa d'Este Historical Estate",
    type: "Villas",
    location: "Lake Como, Italy",
    price: "AED 4,200",
    rating: "4.9 (95 reviews)",
    image: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?q=80&w=800",
    description: "A legendary 16th-century former royal residence set in 25 acres of stunning Renaissance gardens on Lake Como.",
    maxAdults: 4,
  },
];

export default function HotelsPage() {
  const [selectedType, setSelectedType] = useState<string>("All");
  const [searchLocation, setSearchLocation] = useState<string>("");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [adultsCount, setAdultsCount] = useState<number>(2);

  // Callback Modal State
  const [activeHotel, setActiveHotel] = useState<Hotel | null>(null);
  const [callbackName, setCallbackName] = useState("");
  const [callbackPhone, setCallbackPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Dynamic Filtering Logic
  const filteredHotels = useMemo(() => {
    return mockHotels.filter((hotel) => {
      // Filter by Hotel Type dropdown/button
      const matchesType = selectedType === "All" || hotel.type === selectedType;
      
      // Filter by Location search
      const matchesLocation =
        !searchLocation ||
        hotel.location.toLowerCase().includes(searchLocation.toLowerCase()) ||
        hotel.name.toLowerCase().includes(searchLocation.toLowerCase());
        
      // Filter by Capacity (Adults count must be <= hotel's max capacity)
      const matchesAdults = hotel.maxAdults >= adultsCount;

      return matchesType && matchesLocation && matchesAdults;
    });
  }, [selectedType, searchLocation, adultsCount]);

  const handleCallbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!callbackName || !callbackPhone || !activeHotel) {
      alert("Please fill out all required fields.");
      return;
    }

    try {
      setLoading(true);
      // RULE #6: All callbacks go to "appointments" collection
      await addDoc(collection(db, "appointments"), {
        customerName: callbackName,
        name: callbackName, // fallback variation
        phone: callbackPhone,
        visaType: "Hotel Booking",
        serviceType: "Hotel Booking", // fallback variation
        date: dateFrom && dateTo ? `${dateFrom} to ${dateTo}` : "",
        time: "Anytime",
        details: `Callback Inquiry for Hotel: ${activeHotel.name} (${activeHotel.type}). Location: ${activeHotel.location}. Check-in: ${dateFrom || "Not Set"}, Check-out: ${dateTo || "Not Set"}. Guests: ${adultsCount} Adults.`,
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
      setLoading(false);
    }
  };

  return (
    <main className="bg-[#071120] text-white min-h-screen">
      
      {/* HERO SECTION */}
      <section className="relative pt-32 pb-16 px-6 bg-gradient-to-b from-[#0b1830] to-[#071120]">
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

        {filteredHotels.length === 0 ? (
          <div className="h-[300px] flex flex-col items-center justify-center rounded-[30px] border border-white/10 bg-white/5 text-center">
            <h3 className="text-2xl font-bold">No Accommodations Found</h3>
            <p className="text-white/60 mt-2 max-w-sm">
              We couldn't find matches. Try adjusting your capacity requirements, location filters, or property types.
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
                  <div className="relative h-60 w-full overflow-hidden">
                    <Image
                      src={hotel.image}
                      alt={hotel.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                    <div className="absolute top-4 left-4 rounded-full bg-[#00C2FF] px-3 py-1 text-xs font-semibold text-black">
                      {hotel.type}
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
                    <h3 className="text-xl font-bold text-white group-hover:text-[#00C2FF] transition">
                      {hotel.name}
                    </h3>
                    <p className="mt-3 text-sm text-gray-300 leading-relaxed line-clamp-3">
                      {hotel.description}
                    </p>
                    <p className="mt-3 text-xs text-white/40 font-semibold">
                      Accommodates up to: {hotel.maxAdults} Adults
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
                      onClick={() => setActiveHotel(hotel)}
                      className="rounded-xl bg-[#00C2FF] hover:bg-[#00a2d5] text-black px-4 py-2.5 text-xs font-semibold transition"
                    >
                      Book Stay
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
                    disabled={loading}
                    className="w-full h-12 rounded-xl bg-[#00C2FF] text-black font-bold hover:bg-[#00a2d5] transition flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
                  >
                    {loading ? (
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