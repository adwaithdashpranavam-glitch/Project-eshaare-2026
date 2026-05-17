import TourCard from "./TourCard";

const tours = [
    {
        title: "Luxury Maldives Island Escape",
        image:
            "https://images.unsplash.com/photo-1573843981267-be1999ff37cd?q=80&w=1200&auto=format&fit=crop",
        rating: "4.9 (320)",
        duration: "5 Days",
        price: "₹89,000",
        tag: "Best Seller",
    },
    {
        title: "Discover Magical Switzerland",
        image:
            "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1200&auto=format&fit=crop",
        rating: "4.8 (240)",
        duration: "7 Days",
        price: "₹1,45,000",
    },
    {
        title: "Japan Cherry Blossom Tour",
        image:
            "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=1200&auto=format&fit=crop",
        rating: "4.9 (410)",
        duration: "6 Days",
        price: "₹1,10,000",
        tag: "Special Offer",
    },
    {
        title: "Romantic Bali Honeymoon",
        image:
            "https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=1200&auto=format&fit=crop",
        rating: "4.7 (190)",
        duration: "4 Days",
        price: "₹72,000",
    },
    {
        title: "Thailand Adventure Experience",
        image:
            "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200&auto=format&fit=crop",
        rating: "4.8 (278)",
        duration: "5 Days",
        price: "₹58,000",
    },
    {
        title: "Dubai Luxury City Escape",
        image:
            "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=1200&auto=format&fit=crop",
        rating: "4.6 (150)",
        duration: "3 Days",
        price: "₹65,000",
    },
];

export default function TourGrid() {
    return (
        <section className="bg-[#f5f5f5] px-4 py-10 md:px-8">

            <div className="mx-auto max-w-7xl">

                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

                    {tours.map((tour, index) => (
                        <TourCard key={index} {...tour} />
                    ))}

                </div>

            </div>

        </section>
    );
}