import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

import VisaCard from "@/components/visa/VisaCard";

import { visaServices } from "@/constants/visaData";

export default function VisaPage() {
  return (
    <main className="bg-[#071120] text-white">

      <Navbar />

      <section className="px-6 pb-24 pt-36">

        <div className="mx-auto max-w-7xl">

          <div className="max-w-3xl">

            <p className="uppercase tracking-[4px] text-[#FF9F1C]">
              Visa Services
            </p>

            <h1 className="mt-4 text-5xl font-bold leading-tight">
              Fast & Trusted Visa Assistance
            </h1>

            <p className="mt-6 text-lg text-gray-400">
              Premium visa support for worldwide destinations
              with fast processing and expert guidance.
            </p>

          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">

            {visaServices.map((visa) => (
              <VisaCard
                key={visa.slug}
                slug={visa.slug}
                country={visa.country}
                image={visa.image}
                processing={visa.processing}
              />
            ))}

          </div>

        </div>

      </section>

      <Footer />

    </main>
  );
}