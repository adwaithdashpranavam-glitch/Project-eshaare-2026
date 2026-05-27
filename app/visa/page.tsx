import VisaHero from "@/components/visa/VisaHero";
import VisaCategories from "@/components/visa/VisaCategories";
import VisaFeatures from "@/components/visa/VisaFeatures";
import VisaFAQs from "@/components/visa/VisaFAQs";
import VisaWhatsAppInquiry from "@/components/visa/VisaWhatsAppInquiry";

export default function VisaServicesPage() {
  return (
    <main className="bg-[#071120] w-full min-h-screen">
      <VisaHero />
      <VisaCategories />
      <VisaFeatures />
      <VisaFAQs />
      <VisaWhatsAppInquiry />
    </main>
  );
}