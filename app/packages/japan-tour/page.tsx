"use client";

import { useState } from "react";
import Image from "next/image";
import { Calendar, Users, CheckCircle2, MessageSquare, PhoneCall, ArrowRight, ShieldCheck, Star } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const japanPackages = [
  {
    title: "Classic Golden Route (Tokyo & Kyoto)",
    duration: "7 Days / 6 Nights",
    price: "AED 6,499",
    oldPrice: "AED 7,500",
    description: "Explore the ultimate mix of modern neon cities and rich cultural heritage. Ride the Shinkansen bullet train, visit golden shrines, and witness Mt. Fuji.",
    rating: "5.0",
    inclusions: ["Premium 4-star Hotel Stays", "Bullet Train (Shinkansen) Tickets", "Daily Japanese Buffet Breakfast", "English-speaking Local Guide", "Mt. Fuji Scenic Viewing Tour"]
  },
  {
    title: "Cherry Blossom (Sakura) Premium Tour",
    duration: "6 Days / 5 Nights",
    price: "AED 7,499",
    oldPrice: "AED 8,600",
    description: "Witness the magical cherry blossom season in full bloom. Explore scenic parks in Tokyo and historical gardens of Kyoto with VIP entrance access.",
    rating: "4.9",
    inclusions: ["Boutique Heritage Stays", "Sakura Viewing VIP Day Passes", "Traditional Tea Ceremony Experience", "Daily Breakfast & Lunch", "Airport Transfers"]
  },
  {
    title: "Hokkaido Snow & Hot Springs Luxury",
    duration: "7 Days / 6 Nights",
    price: "AED 8,999",
    oldPrice: "AED 9,800",
    description: "Escape to the winter wonderland of Hokkaido. Enjoy premium ski chalet access, natural thermal baths (onsens), and legendary seafood culinary tours.",
    rating: "4.9",
    inclusions: ["Ski-in Ski-out Chalet Stay", "Onsen Thermal Bath Access Pass", "Daily Breakfast & Gourmet Dinners", "Private Skiing Instructor Session", "Seafood Tasting Tour"]
  }
];

export default function JapanTourPage() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    travelDate: "",
    travelers: "1",
    packageType: japanPackages[0].title,
    message: ""
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      alert("Please enter your name and phone number.");
      return;
    }

    try {
      setLoading(true);
      await addDoc(collection(db, "leads"), {
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        destination: "Japan",
        visaType: "Japan Tour Booking",
        travelDate: formData.travelDate,
        travelers: formData.travelers,
        budget: `Selected: ${formData.packageType}`,
        message: formData.message || `Inquiry for package: ${formData.packageType}`,
        currentCountry: "",
        passport: "",
        source: "Website Destination Page",
        travelHistory: "",
        rejectionHistory: "",
        status: "New",
        assignedTo: "",
        revenue: 0,
        createdAt: serverTimestamp()
      });

      setSubmitted(true);
      setFormData({
        name: "",
        phone: "",
        email: "",
        travelDate: "",
        travelers: "1",
        packageType: japanPackages[0].title,
        message: ""
      });
    } catch (error) {
      console.error("Error submitting lead:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="bg-[#071120] text-white min-h-screen">
      <Navbar />

      {/* HERO BANNER */}
      <section className="relative h-[65vh] w-full flex items-center justify-center overflow-hidden pt-20">
        <Image
          src="https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=1800"
          alt="Japan"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#071120]/30 via-[#071120]/60 to-[#071120]" />
        
        <div className="relative z-10 text-center max-w-4xl px-6">
          <p className="text-sm font-semibold uppercase tracking-[5px] text-[#00C2FF]">
            Land of the Rising Sun
          </p>
          <h1 className="mt-4 text-5xl md:text-7xl font-extrabold tracking-tight text-white drop-shadow-2xl">
            Japan Packages
          </h1>
          <p className="mt-6 text-lg md:text-xl text-gray-200 drop-shadow-lg leading-relaxed max-w-2xl mx-auto">
            Witness Mount Fuji, wander through traditional shrines, and explore high-tech cities. Discover our premium Japan packages.
          </p>
        </div>
      </section>

      {/* PACKAGES CONTAINER */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold">Immerse in Japan's Majesty</h2>
          <p className="mt-4 text-gray-400 max-w-xl mx-auto">Browse our elite, pre-planned Japan itineraries tailored for a seamless, luxurious travel experience.</p>
        </div>

        {/* PACKAGE CARDS GRID */}
        <div className="grid gap-8 lg:grid-cols-3">
          {japanPackages.map((pkg, idx) => (
            <div 
              key={idx}
              className="flex flex-col rounded-[32px] border border-white/10 bg-[#0a1425]/60 backdrop-blur-xl p-8 hover:border-[#00C2FF]/40 hover:-translate-y-2 transition-all duration-500 shadow-xl"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-1.5 bg-[#00C2FF]/10 text-[#00C2FF] px-3.5 py-1.5 rounded-full text-xs font-semibold">
                  <Star className="w-3.5 h-3.5 fill-[#00C2FF]" />
                  <span>{pkg.rating} Rating</span>
                </div>
                <span className="text-sm text-gray-400 font-semibold">{pkg.duration}</span>
              </div>

              <h3 className="text-2xl font-bold mb-3">{pkg.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-6">{pkg.description}</p>

              {/* INCLUSIONS LIST */}
              <div className="flex-grow mb-8">
                <p className="text-xs text-white/50 font-bold uppercase tracking-wider mb-3.5">What's Included:</p>
                <ul className="space-y-2.5">
                  {pkg.inclusions.map((inc, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-gray-300">
                      <CheckCircle2 className="w-4 h-4 text-[#00C2FF] mt-0.5 shrink-0" />
                      <span>{inc}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* PRICE & BUTTONS */}
              <div className="border-t border-white/10 pt-6 mt-auto">
                <div className="flex items-end justify-between mb-6">
                  <div>
                    <span className="text-xs text-gray-500 line-through block">{pkg.oldPrice}</span>
                    <span className="text-2xl font-black text-white">{pkg.price}</span>
                    <span className="text-xs text-gray-400"> / person</span>
                  </div>
                  <span className="text-xs bg-red-500/10 text-red-400 font-bold px-3 py-1 rounded-full">Limited Deal</span>
                </div>

                <div className="flex flex-col gap-2.5">
                  <button 
                    onClick={() => {
                      setFormData({ ...formData, packageType: pkg.title });
                      document.getElementById("inquiry-section")?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="w-full bg-[#00C2FF] hover:bg-[#009ed4] text-black font-semibold py-3.5 rounded-2xl transition duration-300 text-sm text-center flex items-center justify-center gap-2"
                  >
                    <span>Enquire Now</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  
                  <a 
                    href={`https://wa.me/971501234567?text=Hi%20Eshaare%2C%20I%20want%20to%20know%20more%20about%20your%20Japan%20${encodeURIComponent(pkg.title)}.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/40 text-[#25D366] font-semibold py-3.5 rounded-2xl transition duration-300 text-sm text-center flex items-center justify-center gap-2"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>WhatsApp Inquiry</span>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CALLBACK & INQUIRY FORM */}
      <section id="inquiry-section" className="bg-[#0b1425] border-t border-b border-white/10 py-24">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold">Request a Call Back / Custom Inquiry</h2>
            <p className="mt-4 text-gray-400">Tell us your preferences and our Japan travel specialists will structure the ideal itinerary for you.</p>
          </div>

          {submitted ? (
            <div className="bg-[#00C2FF]/10 border border-[#00C2FF]/30 p-8 rounded-3xl text-center">
              <h3 className="text-2xl font-bold text-white mb-3">Thank you for your Inquiry!</h3>
              <p className="text-gray-300 max-w-md mx-auto mb-6">Our travel expert will connect with you via Phone or WhatsApp within 2 hours to offer customized quotes.</p>
              <button 
                onClick={() => setSubmitted(false)}
                className="bg-[#00C2FF] hover:bg-[#009ed4] text-black font-semibold px-6 py-2.5 rounded-xl transition duration-300 text-sm"
              >
                Submit another inquiry
              </button>
            </div>
          ) : (
            <form onSubmit={handleInquirySubmit} className="space-y-6 bg-white/5 border border-white/10 p-8 md:p-12 rounded-[40px] backdrop-blur-2xl">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Your Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="Enter name"
                    value={formData.name}
                    onChange={handleChange}
                    className="h-14 rounded-2xl border border-white/10 bg-white/5 px-5 outline-none text-white focus:border-[#00C2FF] transition"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Contact Number *</label>
                  <input
                    type="text"
                    name="phone"
                    required
                    placeholder="Enter phone number"
                    value={formData.phone}
                    onChange={handleChange}
                    className="h-14 rounded-2xl border border-white/10 bg-white/5 px-5 outline-none text-white focus:border-[#00C2FF] transition"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Email Address (Optional)</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="Enter email address"
                    value={formData.email}
                    onChange={handleChange}
                    className="h-14 rounded-2xl border border-white/10 bg-white/5 px-5 outline-none text-white focus:border-[#00C2FF] transition"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Preferred Package *</label>
                  <select
                    name="packageType"
                    value={formData.packageType}
                    onChange={handleChange}
                    className="h-14 rounded-2xl border border-white/10 bg-white/5 px-5 outline-none text-white focus:border-[#00C2FF] transition"
                  >
                    {japanPackages.map((pkg, i) => (
                      <option key={i} value={pkg.title} className="bg-[#071120] text-white">
                        {pkg.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Travel Date</label>
                  <input
                    type="date"
                    name="travelDate"
                    value={formData.travelDate}
                    onChange={handleChange}
                    className="h-14 rounded-2xl border border-white/10 bg-white/5 px-5 outline-none text-gray-400 focus:border-[#00C2FF] transition"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-400">No. of Travelers</label>
                  <input
                    type="number"
                    name="travelers"
                    min="1"
                    value={formData.travelers}
                    onChange={handleChange}
                    className="h-14 rounded-2xl border border-white/10 bg-white/5 px-5 outline-none text-white focus:border-[#00C2FF] transition"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Message / Custom Requirements</label>
                <textarea
                  name="message"
                  placeholder="E.g. Visa assistance required, vegetarian food options, bullet train tickets booking, premium hotel class..."
                  value={formData.message}
                  onChange={handleChange}
                  className="h-32 rounded-2xl border border-white/10 bg-white/5 p-5 outline-none text-white focus:border-[#00C2FF] transition resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-14 bg-[#00C2FF] hover:bg-[#009ed4] text-black font-semibold rounded-2xl transition duration-300 disabled:opacity-60 flex items-center justify-center gap-2.5 text-lg"
              >
                {loading ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-black border-t-transparent"></div>
                ) : (
                  <>
                    <PhoneCall className="w-5 h-5" />
                    <span>Request Callback & Custom Quote</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* DUAL WIDGET FOR DIRECT CONTACT */}
          <div className="mt-14 grid gap-6 md:grid-cols-2">
            <div className="flex items-center gap-5 p-6 bg-white/5 rounded-3xl border border-white/10">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#00C2FF]/10 text-[#00C2FF]">
                <PhoneCall className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-gray-400 font-semibold">Immediate Callback Support</p>
                <p className="text-lg font-bold text-white mt-0.5">+971 4 123 4567</p>
              </div>
            </div>

            <div className="flex items-center gap-5 p-6 bg-white/5 rounded-3xl border border-white/10">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#25D366]/10 text-[#25D366]">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-gray-400 font-semibold">Verified Safe Escrow Booking</p>
                <p className="text-lg font-bold text-white mt-0.5">100% Secure Payment</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}