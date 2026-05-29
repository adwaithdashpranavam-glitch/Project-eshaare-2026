import Footer from "@/components/layout/Footer";
import VisaCTA from "@/components/visa/VisaCTA";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const rawCountry = slug.replace(/-/g, " ");
  const countryName = rawCountry.split(" ").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
  
  const pageTitle = `${countryName} Visa Services from UAE | Eshaare Tour`;
  const pageDesc = `Get hassle-free ${countryName} visa processing services from Dubai, UAE. We assist you with document checklist verification, application completion, and embassy scheduling.`;
  
  return {
    title: pageTitle,
    description: pageDesc,
    openGraph: {
      title: pageTitle,
      description: pageDesc,
      type: "website",
      images: [
        {
          url: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?q=80&w=1200",
          alt: `${countryName} Visa Assistance`
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description: pageDesc,
      images: ["https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?q=80&w=1200"]
    }
  };
}

export default async function DynamicVisaPage({ params }: PageProps) {
  const { slug } = await params;
  
  // Format slug to country name
  const rawCountry = slug.replace(/-/g, " ");
  const countryName = rawCountry.split(" ").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");

  // Mock document checklist based on country
  const commonDocs = [
    "Original passport valid for at least 6 months",
    "UAE Residence Visa & Emirates ID valid for at least 3 months",
    "3 months official personal bank statements showing sufficient funds",
    "No Objection Certificate (NOC) from employer detailing salary & role",
    "Recent passport-sized photograph with white background",
  ];

  return (
    <main className="bg-[#071120] text-white">
      <section className="mx-auto max-w-5xl px-6 pb-24 pt-36">
        <p className="uppercase tracking-[4px] text-[#FF9F1C]">
          Visa Services
        </p>

        <h1 className="mt-4 text-5xl font-bold">
          {countryName} Visa From UAE
        </h1>

        <p className="mt-6 leading-8 text-gray-300">
          Get professional visa assistance for {countryName}. We guide you through document preparation, checklist verification, application forms completion, and embassy/appointment scheduling.
        </p>

        {/* REQUIREMENTS */}
        <div className="mt-16 rounded-[32px] border border-white/10 bg-[#0b1426] p-10">
          <h2 className="text-3xl font-bold">
            Required Documents
          </h2>

          <ul className="mt-8 space-y-4 text-gray-300">
            {commonDocs.map((doc, idx) => (
              <li key={idx}>• {doc}</li>
            ))}
          </ul>
        </div>

        {/* PROCESSING */}
        <div className="mt-10 rounded-[32px] border border-white/10 bg-[#0b1426] p-10">
          <h2 className="text-3xl font-bold">
            Processing Time
          </h2>

          <p className="mt-6 text-gray-300">
            Standard processing takes approximately 10-15 working days depending on the embassy. We recommend beginning the application 3-4 weeks prior to your planned departure date.
          </p>
        </div>

        {/* CTA */}
        <VisaCTA
          country={countryName}
          whatsappUrl={`https://wa.me/971501234567?text=Hi%20Eshaare%2C%20I%20want%20to%20apply%20for%20a%20${encodeURIComponent(countryName)}%20Visa%20from%20UAE.`}
        />
      </section>

      <Footer />
    </main>
  );
}
