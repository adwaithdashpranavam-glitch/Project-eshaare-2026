import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import VisaCTA from "@/components/visa/VisaCTA";

export default function SchengenVisaPage() {
  return (
    <main className="bg-[#071120] text-white">

      <Navbar />

      <section className="mx-auto max-w-5xl px-6 pb-24 pt-36">

        <p className="uppercase tracking-[4px] text-[#FF9F1C]">
          Schengen Visa
        </p>

        <h1 className="mt-4 text-5xl font-bold">
          Schengen Visa From UAE
        </h1>

        <p className="mt-6 leading-8 text-gray-300">
          Get professional Schengen visa assistance for all 27 member states. We guide you through document preparation, Schengen-compliant travel medical insurance procurement, flight reservation & hotel booking creation, application form completion, and appointment booking at VFS Global / BLS.
        </p>

        {/* REQUIREMENTS */}
        <div className="mt-16 rounded-[32px] border border-white/10 bg-[#0b1426] p-10">

          <h2 className="text-3xl font-bold">
            Required Documents
          </h2>

          <ul className="mt-8 space-y-4 text-gray-300">

            <li>• Original passport (valid for at least 3 months after returning from the Schengen area)</li>
            <li>• UAE Residence Visa & Emirates ID (valid for at least 3 months after return)</li>
            <li>• 3-6 months official personal bank statements showing sufficient balance</li>
            <li>• No Objection Certificate (NOC) from employer detailing salary & tenure</li>
            <li>• Compliant Travel Medical Insurance (minimum coverage of €30,000)</li>
            <li>• Return flight tickets and confirmed hotel booking</li>

          </ul>

        </div>

        {/* PROCESSING */}
        <div className="mt-10 rounded-[32px] border border-white/10 bg-[#0b1426] p-10">

          <h2 className="text-3xl font-bold">
            Processing Time
          </h2>

          <p className="mt-6 text-gray-300">
            Standard processing takes approximately 15 calendar days from the date of biometrics submission. We recommend starting the process 4-6 weeks before your intended travel date.
          </p>

        </div>

        {/* CTA */}
        <VisaCTA
          country="Schengen"
          whatsappUrl="https://wa.me/971501234567?text=Hi%20Eshaare%2C%20I%20want%20to%20apply%20for%20a%20Schengen%20Visa%20from%20UAE."
        />

      </section>

      <Footer />

    </main>
  );
}