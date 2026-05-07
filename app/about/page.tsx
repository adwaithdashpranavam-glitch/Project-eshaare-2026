import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function AboutPage() {
  return (
    <main className="bg-[#071120] text-white min-h-screen">

      <Navbar />

      <section className="max-w-5xl mx-auto px-6 py-24">

        <h1 className="text-5xl font-bold text-[#D4AF37]">
          About ESHAARE TOUR
        </h1>

        <p className="text-gray-300 mt-8 leading-8">
          ESHAARE TOUR is a premium visa and travel consultancy helping
          clients explore destinations worldwide with trusted support,
          luxury experiences, and fast visa processing.
        </p>

      </section>

      <Footer />

    </main>
  );
}