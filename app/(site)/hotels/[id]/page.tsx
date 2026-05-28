"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc, addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Footer from "@/components/layout/Footer";
import { 
  MapPin, 
  Calendar, 
  Star, 
  Bed, 
  Coffee, 
  Award, 
  Tag, 
  CheckCircle, 
  X, 
  Loader2, 
  Compass, 
  ArrowLeft,
  ChevronRight,
  MessageSquare,
  Phone
} from "lucide-react";
import Image from "next/image";

interface Hotel {
  id: string;
  name: string;
  hotelType: string;
  location: string;
  price: string;
  rating: string;
  image: string;
  gallery?: string[];
  roomCount: number;
  extraBed: boolean;
  mealType: string;
  amenities: string[];
  nearbyAttractions: string[];
  offers: string;
  availabilityStatus: string;
  description?: string;
}

export default function HotelDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [loading, setLoading] = useState(true);

  // Booking Form States
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [guests, setGuests] = useState(2);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Active Gallery Image
  const [activeImage, setActiveImage] = useState("");

  useEffect(() => {
    const fetchHotelDetails = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const ref = doc(db, "hotels", id);
        const snap = await getDoc(ref);
        if (!snap.exists()) {
          alert("Hotel stay accommodation not found.");
          router.push("/hotels");
          return;
        }
        const data = snap.data() as Hotel;
        setHotel(data);
        setActiveImage(data.image);
      } catch (err) {
        console.error("Error loading hotel details:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHotelDetails();
  }, [id, router]);

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !hotel) {
      alert("Please fill in your Name and Phone Number.");
      return;
    }

    try {
      setBookingLoading(true);
      
      // Add booking details into appointments collection
      await addDoc(collection(db, "appointments"), {
        customerName: name,
        name: name,
        phone: phone,
        visaType: "Hotel Booking",
        serviceType: "Hotel Booking",
        date: dateFrom && dateTo ? `${dateFrom} to ${dateTo}` : "Flexible Dates",
        time: "Anytime",
        details: `Detailed Booking Request for Hotel: ${hotel.name} (${hotel.hotelType}). Location: ${hotel.location}. Check-in: ${dateFrom || "Not Set"}, Check-out: ${dateTo || "Not Set"}. Total Guests: ${guests}. Extra Bed: ${hotel.extraBed ? "Yes" : "No"}.`,
        status: "pending",
        createdAt: serverTimestamp(),
      });

      setBookingSuccess(true);
      setName("");
      setPhone("");
    } catch (err) {
      console.error("Error creating stay request:", err);
      alert("Failed to submit inquiry. Please try again.");
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#071120] text-white">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-[#00C2FF] animate-spin" />
          <p className="text-sm font-medium text-gray-400">Loading hotel details...</p>
        </div>
      </div>
    );
  }

  if (!hotel) return null;

  const galleryList = hotel.gallery && hotel.gallery.length > 0 
    ? [hotel.image, ...hotel.gallery] 
    : [hotel.image];

  return (
    <main className="bg-[#071120] text-white min-h-screen pt-24 pb-16">
      <div className="max-w-[95rem] mx-auto px-4 xl:px-6">
        
        {/* BACK TO HOTELS */}
        <button
          onClick={() => router.push("/hotels")}
          className="flex items-center gap-2 text-xs uppercase tracking-wider text-gray-400 hover:text-[#00C2FF] mb-6 transition"
        >
          <ArrowLeft size={14} />
          Back to Stays list
        </button>

        {/* HERO BANNER & SLIDESHOW */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          
          {/* GALLERY CAROUSEL */}
          <div className="lg:col-span-2 space-y-4">
            <div className="relative h-[450px] w-full rounded-[30px] overflow-hidden border border-white/10 shadow-2xl">
              <Image
                src={activeImage}
                alt={hotel.name}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 66vw"
                className="object-cover transition-all duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute top-6 left-6 rounded-full bg-[#00C2FF] px-4 py-1.5 text-xs font-bold text-black uppercase tracking-wider shadow-md">
                {hotel.hotelType}
              </div>
              <div className="absolute top-6 right-6 rounded-full bg-black/50 backdrop-blur-md px-3.5 py-1.5 text-xs font-bold text-[#00C2FF] flex items-center gap-1.5 border border-white/15">
                <Star className="w-4 h-4 fill-[#00C2FF]" />
                {hotel.rating}
              </div>
              <h1 className="absolute bottom-6 left-8 text-3xl md:text-5xl font-extrabold text-white tracking-tight">
                {hotel.name}
              </h1>
            </div>

            {/* THUMBNAILS LIST */}
            {galleryList.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-white/10">
                {galleryList.map((imgUrl, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(imgUrl)}
                    className={`relative h-20 w-32 rounded-xl overflow-hidden shrink-0 border-2 transition ${
                      activeImage === imgUrl ? "border-[#00C2FF]" : "border-white/5 opacity-60 hover:opacity-100"
                    }`}
                  >
                    <Image
                      src={imgUrl}
                      alt=""
                      fill
                      sizes="120px"
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* QUICK BOOKING / INQUIRY SIDEBAR */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 bg-[#0b1426] border border-white/10 rounded-[30px] p-6 shadow-2xl space-y-6">
              <div>
                <p className="text-gray-400 text-xs uppercase tracking-wider font-semibold">Starting From</p>
                <h2 className="text-4xl font-extrabold text-white mt-1">
                  {hotel.price}
                  <span className="text-sm font-normal text-white/50"> / Night</span>
                </h2>
                <div className="mt-3 flex items-center justify-between text-xs text-white/60">
                  <span>Status: <span className={`font-bold uppercase ${hotel.availabilityStatus === "Available" ? "text-green-400" : "text-yellow-400"}`}>{hotel.availabilityStatus}</span></span>
                  <span>Rooms: {hotel.roomCount || "10+"} Stays</span>
                </div>
              </div>

              {bookingSuccess ? (
                <div className="text-center py-8 border border-white/5 rounded-2xl bg-white/5">
                  <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
                  <h3 className="text-lg font-bold text-white mb-2">Request Registered!</h3>
                  <p className="text-white/60 text-xs px-2 leading-relaxed">
                    We have received your stay booking details for {hotel.name}. Our reservations supervisor will contact you shortly.
                  </p>
                  <button
                    onClick={() => setBookingSuccess(false)}
                    className="mt-5 w-full py-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-xs font-bold transition"
                  >
                    Send Another Request
                  </button>
                </div>
              ) : (
                <form onSubmit={handleBookingSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-semibold text-gray-400 uppercase">Check In</label>
                      <input
                        type="date"
                        required
                        value={dateFrom}
                        onChange={(e) => setDateFrom(e.target.value)}
                        className="w-full h-10 rounded-xl border border-white/10 bg-black/40 px-3 text-white text-xs outline-none focus:border-[#00C2FF] [color-scheme:dark]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-semibold text-gray-400 uppercase">Check Out</label>
                      <input
                        type="date"
                        required
                        value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)}
                        className="w-full h-10 rounded-xl border border-white/10 bg-black/40 px-3 text-white text-xs outline-none focus:border-[#00C2FF] [color-scheme:dark]"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-gray-400 uppercase">Adult Guests</label>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={guests}
                      onChange={(e) => setGuests(Number(e.target.value))}
                      className="w-full h-10 rounded-xl border border-white/10 bg-black/40 px-4 text-white text-xs outline-none focus:border-[#00C2FF]"
                    />
                  </div>

                  <div className="space-y-1 pt-2 border-t border-white/5">
                    <label className="text-[10px] font-semibold text-gray-400 uppercase">Your Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full h-11 rounded-xl border border-white/10 bg-black/40 px-4 text-white text-xs outline-none focus:border-[#00C2FF]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-gray-400 uppercase">Phone Number</label>
                    <input
                      type="tel"
                      required
                      placeholder="+971 50 123 4567"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full h-11 rounded-xl border border-white/10 bg-black/40 px-4 text-white text-xs outline-none focus:border-[#00C2FF]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={bookingLoading || hotel.availabilityStatus !== "Available"}
                    className="w-full h-12 rounded-xl bg-[#00C2FF] text-black font-bold hover:bg-[#00a2d5] transition flex items-center justify-center gap-2 text-sm disabled:opacity-50 cursor-pointer"
                  >
                    {bookingLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      hotel.availabilityStatus === "Available" ? "Book Luxury Stay" : "Sold Out"
                    )}
                  </button>
                </form>
              )}

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5">
                <a
                  href={`https://wa.me/971501234567?text=Hi%20Eshaare%2C%20I%20am%20interested%20in%20staying%20at%20${encodeURIComponent(hotel.name)}.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-green-500/10 hover:bg-green-500/20 text-green-400 text-xs font-semibold transition border border-green-500/10"
                >
                  <MessageSquare className="w-4 h-4" />
                  WhatsApp
                </a>
                <a
                  href="tel:+971501234567"
                  className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-semibold transition border border-white/10"
                >
                  <Phone className="w-4 h-4 text-[#00C2FF]" />
                  Call Office
                </a>
              </div>
            </div>
          </div>

        </div>

        {/* DETAIL CONTENT BLOCKS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* DETAILS PANELS */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Overview */}
            <div className="bg-white/5 border border-white/10 rounded-[30px] p-8 backdrop-blur-md">
              <h2 className="text-2xl font-bold mb-4">Accommodation Description</h2>
              <p className="text-white/70 text-sm leading-8 font-medium">
                {hotel.description || "Indulge in a premium stay characterized by elegant architectures, modern amenities, personalized room services, and beautiful landscape views. Perfect for corporate travelers, honeymooners, and family groups looking to create unforgettable holiday memories."}
              </p>
            </div>

            {/* Quick Specs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Room details */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex items-start gap-4">
                <div className="p-3 rounded-xl bg-[#00C2FF]/10 text-[#00C2FF]">
                  <Bed className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-xs uppercase tracking-wider text-gray-400 font-semibold">Rooms Status</h4>
                  <p className="text-sm font-bold text-white mt-1">{hotel.roomCount || "Luxury"} Suites</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">{hotel.availabilityStatus}</p>
                </div>
              </div>

              {/* Meals */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex items-start gap-4">
                <div className="p-3 rounded-xl bg-yellow-500/10 text-yellow-400">
                  <Coffee className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-xs uppercase tracking-wider text-gray-400 font-semibold">Meal Options</h4>
                  <p className="text-sm font-bold text-white mt-1 truncate max-w-[150px]">{hotel.mealType || "Breakfast Included"}</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">Complimentary Buffet</p>
                </div>
              </div>

              {/* Extra Bed */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex items-start gap-4">
                <div className="p-3 rounded-xl bg-green-500/10 text-green-400">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-xs uppercase tracking-wider text-gray-400 font-semibold">Extra Bed</h4>
                  <p className="text-sm font-bold text-white mt-1">{hotel.extraBed ? "Available" : "Not Available"}</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">Upon request</p>
                </div>
              </div>

            </div>

            {/* Special Offers Banner */}
            {hotel.offers && (
              <div className="bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-500/20 rounded-[25px] p-6 flex items-start gap-4">
                <div className="p-2.5 rounded-xl bg-orange-500/20 text-[#e68932]">
                  <Tag className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#e68932] uppercase tracking-wide">Stay Special Offer!</h4>
                  <p className="text-sm text-white/80 mt-1 font-medium">{hotel.offers}</p>
                </div>
              </div>
            )}

            {/* Amenities */}
            {hotel.amenities && hotel.amenities.length > 0 && (
              <div className="bg-white/5 border border-white/10 rounded-[30px] p-8 backdrop-blur-md">
                <h2 className="text-2xl font-bold mb-6">Amenity Conveniences</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {hotel.amenities.map((item) => (
                    <div key={item} className="flex items-center gap-2 text-sm text-gray-300 font-medium bg-black/20 p-3 rounded-xl border border-white/5">
                      <span className="h-2 w-2 rounded-full bg-[#00C2FF]" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Nearby Attractions */}
            {hotel.nearbyAttractions && hotel.nearbyAttractions.length > 0 && (
              <div className="bg-white/5 border border-white/10 rounded-[30px] p-8 backdrop-blur-md">
                <h2 className="text-2xl font-bold mb-6">Nearby Attractions</h2>
                <div className="space-y-3">
                  {hotel.nearbyAttractions.map((attraction, i) => (
                    <div key={i} className="flex items-start gap-3.5 text-sm text-gray-300 font-medium bg-black/20 p-4 rounded-xl border border-white/5">
                      <Compass size={18} className="text-yellow-500 shrink-0 mt-0.5" />
                      <span>{attraction}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>

      </div>
      <Footer />
    </main>
  );
}
