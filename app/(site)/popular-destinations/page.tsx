import Footer from "@/components/layout/Footer";
import PopularDestinationsClient from "./PopularDestinationsClient";

export const metadata = {
  title: "Popular Destinations & Festivals | Eshaare Tours",
  description: "Stay in the loop with active seasonal festivals, global cultural events, and trending tourism adventure activities worldwide.",
};

interface EventItem {
  id: string;
  title: string;
  type: "Trending" | "Festivals" | "Activities" | "Highlights";
  location: string;
  date: string;
  image: string;
  description: string;
  price: string;
}

const initialItems: EventItem[] = [
  {
    id: "e1",
    title: "Cherry Blossom Festival (Hanami)",
    type: "Festivals",
    location: "Tokyo & Kyoto, Japan",
    date: "Late March - Early April",
    image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=600",
    description: "Witness the magnificent blooming of Sakura blossoms. Participate in traditional tea ceremonies and evening park picnics under glowing lanterns.",
    price: "AED 3,499 (Tour Package)"
  },
  {
    id: "e2",
    title: "Dubai Shopping Festival (DSF)",
    type: "Trending",
    location: "Dubai, UAE",
    date: "December - January",
    image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=600",
    description: "Enjoy massive retail discounts across designer brands, daily gold and supercar raffles, pop-up street food markets, and live fireworks.",
    price: "Free Entry"
  },
  {
    id: "e3",
    title: "Swiss Alpine Skiing & Snowboarding",
    type: "Activities",
    location: "Zermatt & Interlaken, Switzerland",
    date: "December - March",
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=600",
    description: "Fly down world-famous pristine snowy slopes with views of the Matterhorn, followed by cozy evening fondue in premium winter lodges.",
    price: "AED 2,800 (Ski Pass + Lodge)"
  },
  {
    id: "e4",
    title: "Traditional Kerala Boat Race (Vallam Kali)",
    type: "Festivals",
    location: "Alappuzha, India",
    date: "August (Nehru Trophy)",
    image: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?q=80&w=600",
    description: "Watch hundred-foot-long snake boats rowed synchronously to traditional rhythm songs on the palm-lined backwater canals.",
    price: "From AED 50 (VVIP Seating)"
  },
  {
    id: "e5",
    title: "Ferrari World Yas Island Thrills",
    type: "Activities",
    location: "Abu Dhabi, UAE",
    date: "All Year Round",
    image: "https://images.unsplash.com/photo-1583121274602-3e2820c69888?q=80&w=600",
    description: "Ride the Formula Rossa, the world's fastest roller coaster reaching 240km/h in 4.9 seconds, at Abu Dhabi's premier indoor theme park.",
    price: "AED 340 (Standard Ticket)"
  },
  {
    id: "e6",
    title: "Historical Kyoto Temple Trails",
    type: "Highlights",
    location: "Kyoto, Japan",
    date: "Spring & Autumn",
    image: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?q=80&w=600",
    description: "Traverse the golden pavilion and thousand orange torii gates of Fushimi Inari, rich with Japanese heritage, shrines, and forest trails.",
    price: "AED 850 (Guided Private Tour)"
  }
];

const galleryPhotos = [
  "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=600",
  "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=600",
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=600",
  "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?q=80&w=600",
  "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=600",
  "https://images.unsplash.com/photo-1473580044384-7ba9967e16a0?q=80&w=600"
];

export default function PopularDestinationsPage() {
  return (
    <main className="bg-[#071120] text-white min-h-screen pt-20">
      
      {/* 1. HERO HEADER */}
      <section className="pt-20 pb-12 px-6 bg-gradient-to-b from-[#0b1830] to-[#071120] text-center">
        <div className="max-w-4xl mx-auto space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[5px] text-[#00C2FF]">
            Global Showcases
          </p>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight">
            Popular Destinations & Festivals
          </h1>
          <p className="text-white/70 max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
            Stay in the loop with active seasonal festivals, global cultural events, and trending tourism adventure activities worldwide.
          </p>
        </div>
      </section>

      {/* 2. DYNAMIC SEARCH, GRID & GALLERY */}
      <PopularDestinationsClient initialItems={initialItems} galleryPhotos={galleryPhotos} />

      <Footer />
    </main>
  );
}
