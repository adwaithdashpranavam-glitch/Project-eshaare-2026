import Footer from "@/components/layout/Footer";

import Hero from "@/components/home/Hero";
import VisaServices from "@/components/home/VisaServices";
import FeaturedDestinations from "@/components/home/FeaturedDestinations";
import WhyChooseUs from "@/components/home/WhyChooseUs";
import Testimonials from "@/components/home/Testimonials";
import LatestOffers from "@/components/home/LatestOffers";
import BlogPreview from "@/components/home/BlogPreview";
import WhatsAppCTA from "@/components/home/WhatsAppCTA";
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

            <Testimonials />

            <LatestOffers />

            <BlogPreview />

            <WhatsAppCTA />

            <InquiryForm />

            <Footer />

        </main>
    );
}