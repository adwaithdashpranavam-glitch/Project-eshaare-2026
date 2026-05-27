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
    <section className="py-20 px-4 md:px-8 bg-[#071120] border-t border-white/5">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-extrabold text-white">Why Choose Our Service?</h2>
          <p className="mt-4 text-gray-400 max-w-2xl mx-auto text-lg">We streamline the entire process from document collection to visa delivery.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((item, idx) => (
            <div key={idx} className="bg-white/5 p-8 rounded-[24px] shadow-sm hover:shadow-xl transition-shadow duration-300 border border-white/10">
              <div className="w-16 h-16 rounded-full bg-[#00C2FF]/10 flex items-center justify-center mb-6">
                {item.icon}
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
              <p className="text-gray-300 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
