"use client";

import { useState } from "react";
import Footer from "@/components/layout/Footer";
import { Plane, CheckCircle, Loader2, MapPin } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { AutomationService } from "@/lib/automation";

export default function FlightsPage() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    origin: "Dubai (DXB)",
    destination: "",
    departureDate: "",
    returnDate: "",
    adults: "1",
    children: "0",
    infants: "0",
    cabinClass: "1 Traveller(s) - Economy",
    airline: "",
    labourFares: false,
    directFlight: false,
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      alert("Please fill in both Name and Phone number");
      return;
    }
    if (!formData.destination) {
      alert("Please enter a Destination");
      return;
    }

    try {
      setLoading(true);

      // Submit flight inquiry to the appointments collection in Firestore
      await addDoc(collection(db, "appointments"), {
        customerName: formData.name,
        name: formData.name, // fallback mapping
        phone: formData.phone,
        visaType: "Flight Booking",
        serviceType: "Flight Booking", // fallback mapping
        date: formData.departureDate || "",
        time: "Anytime",
        details: `Flight booking request: ${formData.origin} to ${formData.destination}. Departure: ${formData.departureDate || "N/A"}, Return: ${formData.returnDate || "N/A"}. Passengers: ${formData.adults} Adults, ${formData.children} Children, ${formData.infants} Infants. Class: ${formData.cabinClass}. Airline preference: ${formData.airline || "Any"}. Direct Flight: ${formData.directFlight ? "Yes" : "No"}. Labour Fares: ${formData.labourFares ? "Yes" : "No"}.`,
        status: "pending",
        createdAt: serverTimestamp(),
      });

      // Send WhatsApp notification
      try {
        await AutomationService.sendWhatsAppNotification(
          formData.phone,
          `Hi ${formData.name}, thank you for your flight inquiry! One of our travel experts will contact you shortly to coordinate your flights.`
        );
      } catch (err) {
        console.error("WhatsApp notification failed", err);
      }

      setSubmitted(true);
    } catch (error) {
      console.error(error);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="bg-[#071120] text-white min-h-screen flex flex-col justify-between">
      
      <section className="relative flex-1 flex items-center justify-center pt-36 pb-24 px-6 overflow-hidden bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-950/20 via-[#071120] to-[#071120]">

        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-[#d4af37]/5 blur-[80px] pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/4 w-[250px] h-[250px] rounded-full bg-[#00C2FF]/5 blur-[70px] pointer-events-none" />

        <div className="relative max-w-5xl w-full p-8 md:p-12 rounded-[40px] border border-white/10 bg-[#0b1426]/75 backdrop-blur-xl shadow-2xl text-center overflow-hidden">
          {/* Accent Gold Top Line */}
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#d49237] via-[#f4d06f] to-[#d4af37]" />

          {submitted ? (
            <div className="mt-4 p-8 rounded-[30px] bg-green-500/10 border border-green-500/20 text-center max-w-md mx-auto animate-in fade-in zoom-in-95">
              <CheckCircle className="w-14 h-14 text-green-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">
                We will call you soon!
              </h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                Thank you. Our ticketing specialist will contact you shortly to coordinate your flight plans.
              </p>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setFormData({
                    name: "",
                    phone: "",
                    origin: "Dubai (DXB)",
                    destination: "",
                    departureDate: "",
                    returnDate: "",
                    adults: "1",
                    children: "0",
                    infants: "0",
                    cabinClass: "1 Traveller(s) - Economy",
                    airline: "",
                    labourFares: false,
                    directFlight: false,
                  });
                }}
                className="mt-6 text-sm text-[#00C2FF] hover:underline font-semibold"
              >
                Submit another request
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="text-left space-y-6">

              {/* Header Title */}
              <div className="text-center mb-8">
                <div className="mx-auto w-14 h-14 rounded-full bg-gradient-to-r from-[#d49237] to-[#f4d06f] flex items-center justify-center text-[#071120] mb-5 shadow-lg shadow-[#d4af37]/20">
                  <Plane className="w-7 h-7 -rotate-45" />
                </div>
                <p className="uppercase tracking-[4px] text-[#00C2FF] text-xs font-bold mb-2">
                  Eshaare Sky Travel
                </p>
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">
                  Book Your Flight
                </h1>
                <p className="text-gray-400 mt-2 text-sm max-w-md mx-auto">
                  Provide your destination and preferences below. We will offer exclusive corporate and airline rates.
                </p>
              </div>

              {/* ROW 1: SEARCH DETAILS GRID (FROM, TO, DATE, DATE, PAX) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3 bg-white/5 p-4 rounded-3xl border border-white/10">

                {/* Origin */}
                <div className="lg:col-span-2 flex flex-col">
                  <label className="text-[10px] uppercase font-bold text-[#e68932] px-2 mb-1">From</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="w-1.5 h-1.5 rounded-full border-2 border-gray-400" />
                    </span>
                    <input
                      type="text"
                      required
                      value={formData.origin}
                      onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                      placeholder="Dubai-(DXB)"
                      className="w-full h-11 pl-8 pr-3 rounded-xl bg-black/40 border border-white/10 text-white outline-none focus:border-[#e68932] transition text-sm"
                    />
                  </div>
                </div>

                {/* Destination */}
                <div className="lg:col-span-2 flex flex-col">
                  <label className="text-[10px] uppercase font-bold text-[#e68932] px-2 mb-1">To</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MapPin className="w-3.5 h-3.5 text-gray-400" />
                    </span>
                    <input
                      type="text"
                      required
                      value={formData.destination}
                      onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                      placeholder="Enter Destination"
                      className="w-full h-11 pl-8 pr-3 rounded-xl bg-black/40 border border-white/10 text-white outline-none focus:border-[#e68932] transition text-sm"
                    />
                  </div>
                </div>

                {/* Departure Date */}
                <div className="flex flex-col">
                  <label className="text-[10px] uppercase font-bold text-[#e68932] px-2 mb-1">Departure</label>
                  <input
                    type="date"
                    required
                    value={formData.departureDate}
                    onChange={(e) => setFormData({ ...formData, departureDate: e.target.value })}
                    className="w-full h-11 px-3 rounded-xl bg-black/40 border border-white/10 text-white outline-none focus:border-[#e68932] transition text-sm"
                  />
                </div>

                {/* Return Date */}
                <div className="flex flex-col">
                  <label className="text-[10px] uppercase font-bold text-[#e68932] px-2 mb-1">Return</label>
                  <input
                    type="date"
                    value={formData.returnDate}
                    onChange={(e) => setFormData({ ...formData, returnDate: e.target.value })}
                    className="w-full h-11 px-3 rounded-xl bg-black/40 border border-white/10 text-white outline-none focus:border-[#e68932] transition text-sm"
                  />
                </div>

                {/* Travellers Grid */}
                <div className="grid grid-cols-3 gap-1">
                  <div className="flex flex-col">
                    <label className="text-[9px] uppercase font-bold text-gray-400 text-center mb-1" title="Adult 12+ yrs">Adt</label>
                    <select
                      value={formData.adults}
                      onChange={(e) => setFormData({ ...formData, adults: e.target.value })}
                      className="h-11 rounded-xl bg-black/40 border border-white/10 text-white outline-none text-xs text-center"
                    >
                      {[1, 2, 3, 4, 5, 6].map(n => <option key={n} value={n} className="bg-[#071120]">{n}</option>)}
                    </select>
                  </div>
                  <div className="flex flex-col">
                    <label className="text-[9px] uppercase font-bold text-gray-400 text-center mb-1" title="Child 2-12 yrs">Chd</label>
                    <select
                      value={formData.children}
                      onChange={(e) => setFormData({ ...formData, children: e.target.value })}
                      className="h-11 rounded-xl bg-black/40 border border-white/10 text-white outline-none text-xs text-center"
                    >
                      {[0, 1, 2, 3, 4].map(n => <option key={n} value={n} className="bg-[#071120]">{n}</option>)}
                    </select>
                  </div>
                  <div className="flex flex-col">
                    <label className="text-[9px] uppercase font-bold text-gray-400 text-center mb-1" title="Infant <= 2 yrs">Inf</label>
                    <select
                      value={formData.infants}
                      onChange={(e) => setFormData({ ...formData, infants: e.target.value })}
                      className="h-11 rounded-xl bg-black/40 border border-white/10 text-white outline-none text-xs text-center"
                    >
                      {[0, 1, 2].map(n => <option key={n} value={n} className="bg-[#071120]">{n}</option>)}
                    </select>
                  </div>
                </div>

              </div>

              {/* ROW 2: CLASS, AIRLINE, LABOUR FARES */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">

                {/* Cabin Class */}
                <div className="flex flex-col">
                  <label className="text-[10px] uppercase font-bold text-gray-400 px-2 mb-1">Cabin Class & Travellers</label>
                  <select
                    value={formData.cabinClass}
                    onChange={(e) => setFormData({ ...formData, cabinClass: e.target.value })}
                    className="w-full h-11 px-3 rounded-xl bg-white/5 border border-white/10 text-white outline-none focus:border-[#e68932] transition text-sm"
                  >
                    <option value="1 Traveller - Economy" className="bg-[#071120]">1 Traveller(s) - Economy</option>
                    <option value="1 Traveller - Premium Economy" className="bg-[#071120]">1 Traveller(s) - Premium Economy</option>
                    <option value="1 Traveller - Business" className="bg-[#071120]">1 Traveller(s) - Business</option>
                    <option value="1 Traveller - First Class" className="bg-[#071120]">1 Traveller(s) - First Class</option>
                  </select>
                </div>

                {/* Airlines Preference */}
                <div className="flex flex-col">
                  <label className="text-[10px] uppercase font-bold text-gray-400 px-2 mb-1">Select Airlines</label>
                  <input
                    type="text"
                    value={formData.airline}
                    onChange={(e) => setFormData({ ...formData, airline: e.target.value })}
                    placeholder="Select airlines (optional)"
                    className="w-full h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-white outline-none focus:border-[#e68932] transition text-sm"
                  />
                </div>

                {/* Labour Fares */}
                <div className="flex items-center gap-2.5 h-11 mt-5 pl-2">
                  <label className="flex items-center gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={formData.labourFares}
                      onChange={(e) => setFormData({ ...formData, labourFares: e.target.checked })}
                      className="w-4 h-4 rounded-full accent-[#e68932] border-white/20 bg-black cursor-pointer"
                    />
                    <span className="text-sm text-gray-300 font-medium">Labour Fares</span>
                  </label>
                </div>

              </div>

              {/* Direct Flight Choice */}
              <div className="flex items-center pl-2">
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formData.directFlight}
                    onChange={(e) => setFormData({ ...formData, directFlight: e.target.checked })}
                    className="w-4 h-4 rounded accent-[#e68932] border-white/20 bg-black cursor-pointer"
                  />
                  <span className="text-sm text-gray-300 font-medium">Direct Flight Only</span>
                </label>
              </div>

              {/* Separator */}
              <hr className="border-white/10" />

              {/* USER CONTACT DETAILS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">
                    Your Full Name
                  </label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full h-12 rounded-xl bg-white/5 border border-white/10 px-4 text-white outline-none focus:border-[#e68932] transition"
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
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full h-12 rounded-xl bg-white/5 border border-white/10 px-4 text-white outline-none focus:border-[#e68932] transition"
                  />
                </div>
              </div>

              {/* Submit Action */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-14 rounded-2xl bg-gradient-to-r from-[#d49237] via-[#f4d06f] to-[#d4af37] text-[#071120] font-bold text-lg hover:brightness-110 hover:scale-[1.01] transition flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-[#d4af37]/20 mt-4 cursor-pointer"
              >
                {loading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  "Submit Flight Inquiry"
                )}
              </button>

            </form>
          )}

        </div>
      </section>

      <Footer />
    </main>
  );
}