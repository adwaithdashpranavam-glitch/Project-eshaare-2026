"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Plane, Phone, MessageSquare, CheckCircle, Loader2 } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { AutomationService } from "@/lib/automation";

export default function FlightsPage() {
  const [showCallbackForm, setShowCallbackForm] = useState(false);
  const [formData, setFormData] = useState({ name: "", phone: "", origin: "", destination: "", date: "" });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const handleHashChange = () => {
        if (window.location.hash === "#callback") {
          setShowCallbackForm(true);
        }
      };
      
      handleHashChange();

      window.addEventListener("hashchange", handleHashChange);
      return () => window.removeEventListener("hashchange", handleHashChange);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      alert("Please fill in both Name and Phone number");
      return;
    }

    try {
      setLoading(true);
      // RULE #6: All callbacks go to "appointments" collection
      await addDoc(collection(db, "appointments"), {
        customerName: formData.name,
        name: formData.name, // fallback variation
        phone: formData.phone,
        visaType: "Flight Booking",
        serviceType: "Flight Booking", // fallback variation
        date: formData.date || "",
        time: "Anytime",
        details: `Flight booking request: ${formData.origin || "Not Specified"} to ${formData.destination || "Not Specified"}. Departure: ${formData.date || "Not Specified"}.`,
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
      setFormData({ name: "", phone: "", origin: "", destination: "", date: "" });
    } catch (error) {
      console.error(error);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="bg-[#071120] text-white min-h-screen flex flex-col justify-between">
      <Navbar />

      <section className="relative flex-1 flex items-center justify-center pt-36 pb-24 px-6 overflow-hidden bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-950/20 via-[#071120] to-[#071120]">
        
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-[#d4af37]/5 blur-[80px] pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/4 w-[250px] h-[250px] rounded-full bg-[#00C2FF]/5 blur-[70px] pointer-events-none" />

        <div className="relative max-w-2xl w-full p-8 md:p-12 rounded-[40px] border border-white/10 bg-[#0b1426]/75 backdrop-blur-xl shadow-2xl text-center overflow-hidden">
          {/* Accent Gold Top Line */}
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#d49237] via-[#f4d06f] to-[#d4af37]" />

          {/* Plane Badge */}
          <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-r from-[#d49237] to-[#f4d06f] flex items-center justify-center text-[#071120] mb-8 shadow-lg shadow-[#d4af37]/20">
            <Plane className="w-8 h-8 -rotate-45" />
          </div>

          <p className="uppercase tracking-[4px] text-[#00C2FF] text-sm font-semibold mb-3">
            Eshaare Sky Travel
          </p>

          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-6">
            Flight Bookings <br />
            <span className="bg-gradient-to-r from-[#d49237] via-[#f4d06f] to-[#d4af37] bg-clip-text text-transparent">
              Coming Soon
            </span>
          </h1>

          <p className="text-gray-300 leading-relaxed mb-10 max-w-md mx-auto">
            We are launching our direct flight ticketing platform with exclusive corporate fares, multi-city itineraries, and airport transfer services. Get premium airline offers and seamless reservations in a few clicks.
          </p>

          {!submitted ? (
            <div className="space-y-6">
              {!showCallbackForm ? (
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <a
                    href="https://wa.me/971501234567?text=Hi%20Eshaare%2C%20I%20am%20interested%20in%20booking%20flights."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20ba5a] text-white px-8 py-4 rounded-full font-bold transition duration-300 hover:scale-105 shadow-md shadow-green-500/10"
                  >
                    <MessageSquare className="w-5 h-5" />
                    WhatsApp Inquiry
                  </a>
                  <button
                    onClick={() => setShowCallbackForm(true)}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-[#d49237] to-[#f4d06f] hover:from-[#c39e26] hover:to-[#e4c05f] text-[#071120] px-8 py-4 rounded-full font-bold transition duration-300 hover:scale-105 shadow-md shadow-[#d4af37]/10"
                  >
                    <Phone className="w-5 h-5" />
                    Request a Call Back
                  </button>
                </div>
              ) : (
                <form
                  onSubmit={handleSubmit}
                  id="callback"
                  className="mt-4 p-6 rounded-[24px] bg-white/5 border border-white/10 text-left max-w-md mx-auto transition-all duration-500 animate-in fade-in zoom-in-95"
                >
                  <h3 className="text-xl font-bold mb-4 text-white">
                    Request a Call Back
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">
                        Your Full Name
                      </label>
                      <input
                        type="text"
                        placeholder="John Doe"
                        required
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        className="w-full h-11 rounded-xl bg-[#071120] border border-white/10 px-4 text-white outline-none focus:border-[#d4af37] focus:bg-white/5 transition"
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
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        className="w-full h-11 rounded-xl bg-[#071120] border border-white/10 px-4 text-white outline-none focus:border-[#d4af37] focus:bg-white/5 transition"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">
                          From (Origin)
                        </label>
                        <input
                          type="text"
                          placeholder="DXB"
                          value={formData.origin}
                          onChange={(e) =>
                            setFormData({ ...formData, origin: e.target.value })
                          }
                          className="w-full h-11 rounded-xl bg-[#071120] border border-white/10 px-4 text-white outline-none focus:border-[#d4af37] focus:bg-white/5 transition"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">
                          To (Destination)
                        </label>
                        <input
                          type="text"
                          placeholder="LHR"
                          value={formData.destination}
                          onChange={(e) =>
                            setFormData({ ...formData, destination: e.target.value })
                          }
                          className="w-full h-11 rounded-xl bg-[#071120] border border-white/10 px-4 text-white outline-none focus:border-[#d4af37] focus:bg-white/5 transition"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">
                        Departure Date
                      </label>
                      <input
                        type="date"
                        value={formData.date}
                        onChange={(e) =>
                          setFormData({ ...formData, date: e.target.value })
                        }
                        className="w-full h-11 rounded-xl bg-[#071120] border border-white/10 px-4 text-white outline-none focus:border-[#d4af37] focus:bg-white/5 transition"
                      />
                    </div>
                    <div className="flex gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowCallbackForm(false)}
                        className="flex-1 h-11 rounded-xl border border-white/20 text-white font-semibold hover:bg-white/5 transition"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 h-11 rounded-xl bg-gradient-to-r from-[#d49237] to-[#f4d06f] text-[#071120] font-bold hover:brightness-110 transition flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {loading ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          "Submit"
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          ) : (
            <div className="mt-4 p-6 rounded-[24px] bg-green-500/10 border border-green-500/20 text-center max-w-md mx-auto animate-in fade-in">
              <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
              <h3 className="text-xl font-bold text-white mb-2">
                We will call you soon!
              </h3>
              <p className="text-gray-300 text-sm">
                Thank you. Our ticketing specialist will contact you shortly to coordinate your flight plans.
              </p>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setShowCallbackForm(false);
                }}
                className="mt-4 text-sm text-[#00C2FF] hover:underline"
              >
                Submit another request
              </button>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}