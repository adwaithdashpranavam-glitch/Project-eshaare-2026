import Footer from "@/components/layout/Footer";

import Hero from "@/components/home/Hero";
import VisaServices from "@/components/home/VisaServices";
import FeaturedDestinations from "@/components/home/FeaturedDestinations";
import WhyChooseUs from "@/components/home/WhyChooseUs";
import InquiryForm from "@/components/home/InquiryForm";
import FeaturedPackages from "@/components/home/FeaturedPackages";

export default function MainHomePage() {
  return (
    <main className="bg-[#071120] text-white overflow-hidden min-h-screen">

      <Hero />

      <VisaServices />

      <FeaturedPackages />

      <FeaturedDestinations />

      <WhyChooseUs />

      <InquiryForm />

      <Footer />

    </main>
  );
}