import Footer from "@/components/layout/Footer";
import FlightForm from "./FlightForm";

export const metadata = {
  title: "Book Flights Online | Eshaare Tours",
  description: "Provide your destination and flight preferences to secure exclusive airline rates and cheap air tickets.",
};

export default function FlightsPage() {
  return (
    <main className="bg-[#071120] text-white min-h-screen flex flex-col justify-between">
      
      <section className="relative flex-1 flex items-center justify-center pt-36 pb-24 px-6 overflow-hidden bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-950/20 via-[#071120] to-[#071120]">

        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-[#d4af37]/5 blur-[80px] pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/4 w-[250px] h-[250px] rounded-full bg-[#00C2FF]/5 blur-[70px] pointer-events-none" />

        <div className="relative max-w-5xl w-full p-8 md:p-12 rounded-[40px] border border-white/10 bg-[#0b1426]/75 backdrop-blur-xl shadow-2xl text-center overflow-hidden">
          {/* Accent Gold Top Line */}
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#d49237] via-[#f4d06f] to-[#d4af37]" />

          <FlightForm />

        </div>
      </section>

      <Footer />
    </main>
  );
}