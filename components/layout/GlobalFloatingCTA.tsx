"use client";

import { useState } from "react";
import { Phone, MessageSquare, X, Clock, User, PhoneCall } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function GlobalFloatingCTA() {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    preferredTime: "Anytime"
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCallbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      alert("Please enter both your name and phone number.");
      return;
    }

    try {
      setLoading(true);
      // RULE #6: All callbacks go to "appointments" collection
      await addDoc(collection(db, "appointments"), {
        customerName: formData.name,
        name: formData.name, // fallback variation
        phone: formData.phone,
        visaType: "General Callback Request",
        serviceType: "General Callback Request", // fallback variation
        date: "",
        time: formData.preferredTime,
        preferredTime: formData.preferredTime, // fallback variation
        details: `Callback Request - Preferred time: ${formData.preferredTime}`,
        status: "pending",
        createdAt: serverTimestamp()
      });

      setSubmitted(true);
      setFormData({
        name: "",
        phone: "",
        preferredTime: "Anytime"
      });
      
      // Auto close after 3 seconds
      setTimeout(() => {
        setIsOpen(false);
        setSubmitted(false);
      }, 3000);

    } catch (error) {
      console.error("Error submitting callback appointment:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* FLOATING ACTION BUTTONS */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
        {/* WHATSAPP CTA */}
        <a
          href="https://wa.me/971501234567?text=Hi%20Eshaare%2C%20I%20want%20to%20enquire%20about%20your%20tours%20and%20services."
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-xl shadow-[#25D366]/20 transition-all duration-300 hover:scale-110 hover:bg-[#20ba59]"
          title="Inquire on WhatsApp"
        >
          <MessageSquare className="h-6 w-6" />
        </a>

        {/* CALLBACK MODAL TOGGLE */}
        <button
          onClick={() => setIsOpen(true)}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-[#e68932] text-white shadow-xl shadow-[#e68932]/20 transition-all duration-300 hover:scale-110 hover:bg-[#cf7726]"
          title="Request a Callback"
        >
          <Phone className="h-6 w-6" />
        </button>
      </div>

      {/* CALLBACK MODAL OVERLAY */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm animate-fade-in">
          <div 
            className="relative w-full max-w-md overflow-hidden rounded-[32px] border border-white/10 bg-[#071120]/90 p-8 shadow-2xl backdrop-blur-xl animate-scale-up"
          >
            {/* CLOSE BUTTON */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-6 right-6 flex h-8 w-8 items-center justify-center rounded-full bg-white/5 border border-white/10 text-white transition hover:bg-white hover:text-black"
            >
              <X className="h-4 w-4" />
            </button>

            {submitted ? (
              <div className="text-center py-6">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366]/10 text-[#25D366] mb-4">
                  <PhoneCall className="h-6 w-6" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Request Received!</h3>
                <p className="text-gray-400 text-sm">
                  Thank you, we will call you back at your preferred time.
                </p>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-3.5 mb-6">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#e68932]/10 text-[#e68932]">
                    <Phone className="h-5.5 w-5.5" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">Request a Callback</h3>
                    <p className="text-gray-400 text-xs mt-0.5">Let us know how and when to reach you</p>
                  </div>
                </div>

                <form onSubmit={handleCallbackSubmit} className="space-y-4">
                  {/* NAME */}
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/40" />
                    <input
                      type="text"
                      name="name"
                      required
                      placeholder="Your Full Name *"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="h-13 w-full rounded-2xl border border-white/10 bg-white/5 pl-12 pr-4 text-sm text-white outline-none focus:border-[#00C2FF] transition"
                    />
                  </div>

                  {/* PHONE */}
                  <div className="relative">
                    <PhoneCall className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/40" />
                    <input
                      type="text"
                      name="phone"
                      required
                      placeholder="Phone Number *"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="h-13 w-full rounded-2xl border border-white/10 bg-white/5 pl-12 pr-4 text-sm text-white outline-none focus:border-[#00C2FF] transition"
                    />
                  </div>

                  {/* PREFERRED TIME */}
                  <div className="relative">
                    <Clock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/40" />
                    <select
                      name="preferredTime"
                      value={formData.preferredTime}
                      onChange={handleInputChange}
                      className="h-13 w-full rounded-2xl border border-white/10 bg-[#071120] pl-12 pr-4 text-sm text-white outline-none focus:border-[#00C2FF] transition appearance-none"
                    >
                      <option value="Anytime">Call me Anytime</option>
                      <option value="Morning (9 AM - 12 PM)">Morning (9 AM - 12 PM)</option>
                      <option value="Afternoon (12 PM - 4 PM)">Afternoon (12 PM - 4 PM)</option>
                      <option value="Evening (4 PM - 8 PM)">Evening (4 PM - 8 PM)</option>
                    </select>
                  </div>

                  {/* SUBMIT BUTTON */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-4 h-13 bg-[#e68932] hover:bg-[#cf7726] text-white font-bold rounded-2xl transition duration-300 disabled:opacity-60 flex items-center justify-center gap-2 text-sm shadow-lg shadow-[#e68932]/10"
                  >
                    {loading ? (
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    ) : (
                      <>
                        <Phone className="h-4.5 w-4.5" />
                        <span>Submit Callback Request</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
