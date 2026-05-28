import Footer from "@/components/layout/Footer";
import VisaCTA from "@/components/visa/VisaCTA";

export default function UKVisaPage() {
  return (
    <main className="bg-[#071120] text-white">

      
      <section className="mx-auto max-w-5xl px-6 pb-24 pt-36">

        <p className="uppercase tracking-[4px] text-[#FF9F1C]">
          UK Visa
        </p>

        <h1 className="mt-4 text-5xl font-bold">
          UK Visa From UAE
        </h1>

        <p className="mt-6 leading-8 text-gray-300">
          Get professional UK visa assistance (Standard Visitor and other visitor categories) with comprehensive document compilation, online application form completion, appointment booking support, and eligibility reviews.
        </p>

        {/* REQUIREMENTS */}
        <div className="mt-16 rounded-[32px] border border-white/10 bg-[#0b1426] p-10">

          <h2 className="text-3xl font-bold">
            Required Documents
          </h2>

          <ul className="mt-8 space-y-4 text-gray-300">

            <li>• Original passport (valid for at least 6 months)</li>
            <li>• UAE Residence Visa copy & Emirates ID copy</li>
            <li>• 3-6 months official personal bank statements showing sufficient funds</li>
            <li>• No Objection Certificate (NOC) from employer detailing salary & role</li>
            <li>• Proposed travel itinerary & hotel reservations</li>

          </ul>

        </div>

        {/* PROCESSING */}
        <div className="mt-10 rounded-[32px] border border-white/10 bg-[#0b1426] p-10">

          <h2 className="text-3xl font-bold">
            Processing Time
          </h2>

          <p className="mt-6 text-gray-300">
            Standard processing takes approximately 15-20 working days. Priority service (5 working days) is available upon payment of additional embassy fees.
          </p>

        </div>

        {/* CTA */}
        <VisaCTA
          country="UK"
          whatsappUrl="https://wa.me/971501234567?text=Hi%20Eshaare%2C%20I%20want%20to%20apply%20for%20a%20UK%20Visa%20from%20UAE."
        />

      </section>

      <Footer />

    </main>
  );
}