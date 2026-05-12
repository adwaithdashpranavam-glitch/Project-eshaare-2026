import React from "react";
import { CheckCircle2, Clock, CreditCard, FileText } from "lucide-react";

const features = [
  {
    icon: <FileText className="w-8 h-8 text-[#00C2FF]" />,
    title: "Clear Requirements",
    desc: "We provide an exact checklist of documents needed tailored to your destination and profile, ensuring your application is complete.",
  },
  {
    icon: <Clock className="w-8 h-8 text-[#00C2FF]" />,
    title: "Fast Processing Time",
    desc: "Experience expedited processing where available. We keep you updated at every stage until your visa is delivered.",
  },
  {
    icon: <CreditCard className="w-8 h-8 text-[#00C2FF]" />,
    title: "Transparent Pricing",
    desc: "No hidden fees. Our pricing structure covers all embassy fees and processing charges upfront.",
  },
  {
    icon: <CheckCircle2 className="w-8 h-8 text-[#00C2FF]" />,
    title: "High Success Rate",
    desc: "Our expert team reviews every application thoroughly to maximize your chances of approval.",
  },
];

export default function VisaFeatures() {
  return (
    <section className="py-20 px-4 md:px-8 bg-[#f9fafb]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-extrabold text-[#071120]">Why Choose Our Service?</h2>
          <p className="mt-4 text-gray-500 max-w-2xl mx-auto text-lg">We streamline the entire process from document collection to visa delivery.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((item, idx) => (
            <div key={idx} className="bg-white p-8 rounded-[24px] shadow-sm hover:shadow-xl transition-shadow duration-300 border border-gray-100">
              <div className="w-16 h-16 rounded-full bg-[#00C2FF]/10 flex items-center justify-center mb-6">
                {item.icon}
              </div>
              <h3 className="text-xl font-bold text-[#071120] mb-3">{item.title}</h3>
              <p className="text-gray-600 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
