import React from "react";
import { MessageCircle } from "lucide-react";

export default function VisaWhatsAppInquiry() {
  return (
    <section id="whatsapp" className="py-16 px-4 md:px-8 bg-[#071120] text-white">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 bg-[#111e33] p-10 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden">
        
        {/* Glowing effect */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#25D366]/20 rounded-full blur-[80px]" />
        
        <div className="relative z-10 text-center md:text-left flex-1">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Need Help With Your Visa?
          </h2>
          <p className="text-white/70 text-lg max-w-xl">
            Our visa experts are available 24/7 on WhatsApp to answer your questions, evaluate your profile, and guide you through the process.
          </p>
        </div>

        <div className="relative z-10">
          <a
            href="https://wa.me/1234567890" // Replace with actual WhatsApp number
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 bg-[#25D366] text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-[#20b858] transition-colors duration-300 shadow-lg shadow-[#25D366]/30 hover:-translate-y-1"
          >
            <MessageCircle className="w-6 h-6" />
            Chat on WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}
