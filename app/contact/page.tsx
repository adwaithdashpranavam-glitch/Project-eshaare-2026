import Footer from "@/components/layout/Footer";

export default function ContactPage() {
  return (
    <main className="bg-[#071120] text-white min-h-screen">

      
      <section className="max-w-5xl mx-auto px-6 py-24">

        <h1 className="text-5xl font-bold text-[#D4AF37]">
          Contact Us
        </h1>

        <div className="mt-10 space-y-4 text-gray-300">
          <p>Email: info@eshaare.com</p>
          <p>Phone: +971 XX XXX XXXX</p>
          <p>Location: UAE</p>
        </div>

      </section>

      <Footer />

    </main>
  );
}