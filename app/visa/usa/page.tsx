import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import VisaCTA from "@/components/visa/VisaCTA";

export default function USAVisaPage() {
  return (
    <main className="bg-[#071120] text-white">

      <Navbar />

      <section className="mx-auto max-w-5xl px-6 pb-24 pt-36">

        <p className="uppercase tracking-[4px] text-[#FF9F1C]">
          USA Visa
        </p>

        <h1 className="mt-4 text-5xl font-bold">
          USA Visa From UAE
        </h1>

        <p className="mt-6 leading-8 text-gray-300">
          Get professional USA visa assistance (B1/B2 tourist and business categories) with comprehensive document verification, DS-160 form support, appointment slot scheduling assistance, and interview preparation guidance.
        </p>

        {/* REQUIREMENTS */}
        <div className="mt-16 rounded-[32px] border border-white/10 bg-[#0b1426] p-10">

          <h2 className="text-3xl font-bold">
            Required Documents
          </h2>

          <ul className="mt-8 space-y-4 text-gray-300">

            <li>• Original passport (valid for at least 6 months)</li>
            <li>• UAE Residence Visa copy & Emirates ID copy</li>
            <li>• 3-6 months official personal bank statements</li>
            <li>• No Objection Certificate (NOC) from employer/sponsor</li>
            <li>• 2 recent photos (5x5 cm, white background, matte finish)</li>

          </ul>

        </div>

        {/* PROCESSING */}
        <div className="mt-10 rounded-[32px] border border-white/10 bg-[#0b1426] p-10">

          <h2 className="text-3xl font-bold">
            Processing Time
          </h2>

          <p className="mt-6 text-gray-300">
            DS-160 processing takes 2-3 working days. Interview appointment slot wait time varies depending on the US Embassy / Consulate availability in UAE.
          </p>

        </div>

        {/* CTA */}
        <VisaCTA
          country="USA"
          whatsappUrl="https://wa.me/971501234567?text=Hi%20Eshaare%2C%20I%20want%20to%20apply%20for%20a%20USA%20Visa%20from%20UAE."
        />

      </section>

      <Footer />

    </main>
  );
}