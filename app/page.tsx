import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function Home() {
  return (
    <main className="bg-[#071120] text-white min-h-screen">

      <Navbar />

      <section className="max-w-7xl mx-auto px-6 py-32">

        <div className="max-w-3xl">

          <p className="text-[#D4AF37] mb-4">
            Premium Travel & Visa Solutions
          </p>

          <h1 className="text-6xl font-bold leading-tight">
            Explore The World With ESHAARE TOUR
          </h1>

          <p className="text-gray-400 mt-6 text-lg">
            Visa services, luxury holidays, flights, travel insurance,
            and global travel support.
          </p>

          <div className="flex gap-4 mt-10">

            <button className="bg-[#D4AF37] text-black px-6 py-3 rounded-2xl font-semibold hover:bg-yellow-500 transition">
              Apply Visa
            </button>

            <button className="border border-white/20 px-6 py-3 rounded-2xl hover:border-[#D4AF37] transition">
              Explore Packages
            </button>

          </div>

        </div>

      </section>

      <Footer />

    </main>
  );
}