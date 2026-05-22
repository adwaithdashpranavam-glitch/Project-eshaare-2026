"use client";

import { useState } from "react";
import { Phone, MessageSquare, X, Clock, User, PhoneCall, Loader2 } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

interface VisaCTAProps {
  country: string;
  whatsappUrl: string;
}

export default function VisaCTA({ country, whatsappUrl }: VisaCTAProps) {
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
        name: formData.name,
        phone: formData.phone,
        serviceType: "Visa Callback Request",
        details: `Callback Request for ${country} Visa. Preferred time: ${formData.preferredTime}`,
        status: "New",
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
      console.error("Error submitting callback:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-12 flex flex-wrap gap-4">
      {/* WHATSAPP BUTTON */}
      <a 
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-8 py-4 text-lg font-semibold text-white transition hover:bg-[#20ba59] hover:scale-105 shadow-lg shadow-green-500/10"
      >
        <MessageSquare className="w-5 h-5" />
        Apply Via WhatsApp
      </a>

      {/* CALLBACK BUTTON */}
      <button 
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 rounded-full bg-[#FF9F1C] px-8 py-4 text-lg font-semibold text-black transition hover:bg-[#F48C06] hover:scale-105 shadow-lg shadow-[#FF9F1C]/10"
      >
        <Phone className="w-5 h-5" />
        Request a Call Back
      </button>

      {/* CALLBACK MODAL OVERLAY */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm animate-fade-in text-white">
          <div className="relative w-full max-w-md overflow-hidden rounded-[32px] border border-white/10 bg-[#071120]/90 p-8 shadow-2xl backdrop-blur-xl animate-scale-up">
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
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#FF9F1C]/10 text-[#FF9F1C]">
                    <Phone className="h-5.5 w-5.5" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">Request a Callback</h3>
                    <p className="text-gray-400 text-xs mt-0.5">Let us know how and when to reach you for {country} Visa</p>
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
                    className="w-full mt-4 h-13 bg-[#FF9F1C] hover:bg-[#F48C06] text-black font-bold rounded-2xl transition duration-300 disabled:opacity-60 flex items-center justify-center gap-2 text-sm shadow-lg shadow-[#FF9F1C]/10"
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin text-black" />
                    ) : (
                      <>
                        <Phone className="h-4.5 w-4.5 text-black" />
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
    </div>
  );
}
