import TourHero from "@/components/tours/TourHero";
import TourFilters from "@/components/tours/TourFilters";
import TourGrid from "@/components/tours/TourGrid";

export default function ToursPage() {
    return (
        <main className="bg-[#f5f5f5] min-h-screen">

            <TourHero />

            <TourFilters />

            <TourGrid />

        </main>
    );
}