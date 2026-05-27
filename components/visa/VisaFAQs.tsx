"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "How long does it usually take to process a Schengen Visa?",
    answer: "Typically, Schengen Visa processing takes 10 to 15 working days. However, we recommend applying at least 3-4 weeks in advance, especially during peak travel seasons.",
  },
  {
    question: "Do I need to attend an interview for my visa application?",
    answer: "It depends on the country and your visa history. Countries like the USA often require an interview, while many others, like UAE or e-Visas, do not. We will inform you if an interview or biometrics appointment is necessary.",
  },
  {
    question: "Are your processing fees refundable if my visa is rejected?",
    answer: "Embassy fees are strictly non-refundable. However, our service fees cover the thorough review and submission of your application, significantly minimizing the risk of rejection.",
  },
  {
    question: "What documents are generally required for a Tourist Visa?",
    answer: "Common requirements include a valid passport (at least 6 months validity), passport-sized photographs, proof of funds (bank statements), flight itinerary, and hotel bookings. Specific requirements vary by country.",
  },
];

export default function VisaFAQs() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-20 px-4 md:px-8 bg-[#071120] border-t border-white/5">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-extrabold text-white">Frequently Asked Questions</h2>
          <p className="mt-4 text-gray-400 text-lg">Everything you need to know about our visa services.</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className={`border ${openIndex === index ? 'border-[#00C2FF] bg-[#00C2FF]/5' : 'border-white/10 bg-white/5'} rounded-2xl overflow-hidden transition-all duration-300`}
            >
              <button
                className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
                onClick={() => toggleFaq(index)}
              >
                <span className="font-semibold text-lg text-white">{faq.question}</span>
                <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${openIndex === index ? 'rotate-180 text-[#00C2FF]' : ''}`} />
              </button>
              
              <div 
                className={`overflow-hidden transition-all duration-300 ${openIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
              >
                <div className="p-6 pt-0 text-gray-300 leading-relaxed border-t border-transparent">
                  {faq.answer}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
