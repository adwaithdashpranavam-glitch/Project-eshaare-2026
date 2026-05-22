import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import VisaCTA from "@/components/visa/VisaCTA";

export default function JapanVisaPage() {
  return (
    <main className="bg-[#071120] text-white">

      <Navbar />

      <section className="mx-auto max-w-5xl px-6 pb-24 pt-36">

        <p className="uppercase tracking-[4px] text-[#FF9F1C]">
          Japan Visa
        </p>

        <h1 className="mt-4 text-5xl font-bold">
          Japan Visa From UAE
        </h1>

        <p className="mt-6 leading-8 text-gray-300">
          Get professional Japan visa assistance with
          document verification, application support,
          appointment guidance, and fast processing.
        </p>

        {/* REQUIREMENTS */}
        <div className="mt-16 rounded-[32px] border border-white/10 bg-[#0b1426] p-10">

          <h2 className="text-3xl font-bold">
            Required Documents
          </h2>

          <ul className="mt-8 space-y-4 text-gray-300">

            <li>• Passport copy</li>
            <li>• Emirates ID copy</li>
            <li>• Bank statement</li>
            <li>• Passport size photo</li>
            <li>• NOC letter</li>

          </ul>

        </div>

        {/* PROCESSING */}
        <div className="mt-10 rounded-[32px] border border-white/10 bg-[#0b1426] p-10">

          <h2 className="text-3xl font-bold">
            Processing Time
          </h2>

          <p className="mt-6 text-gray-300">
            7–10 working days depending on embassy approval.
          </p>

        </div>

        {/* CTA */}
        <VisaCTA
          country="Japan"
          whatsappUrl="https://wa.me/971501234567?text=Hi%20Eshaare%2C%20I%20want%20to%20apply%20for%20a%20Japan%20Visa%20from%20UAE."
        />

      </section>

      <Footer />

    </main>
  );
}