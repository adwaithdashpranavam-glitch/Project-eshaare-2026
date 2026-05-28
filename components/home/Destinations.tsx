import Image from "next/image";

const destinations = [
  {
    name: "Dubai",
    image: "/images/dubai-travel.webp",
  },
  {
    name: "Thailand",
    image: "/images/thailand-beach.webp",
  },
  {
    name: "Malaysia",
    image: "/images/luxury-tourism.webp",
  },
];

export default function Destinations() {
  return (
    <section className="py-24 bg-white/[0.02]">

      <div className="max-w-7xl mx-auto px-6">

        <div className="mb-14">

          <p className="text-[#D4AF37] uppercase text-sm tracking-[3px]">
            Popular Destinations
          </p>

          <h2 className="text-4xl font-bold mt-4">
            Explore Trending Countries
          </h2>

        </div>

        <div className="grid md:grid-cols-3 gap-8">

          {destinations.map((item) => (
            <div
              key={item.name}
              className="relative h-96 rounded-3xl overflow-hidden border border-white/10 group"
            >

              <Image
                src={item.image}
                alt={item.name}
                fill
                className="object-cover group-hover:scale-110 transition duration-700"
              />

              <div className="absolute inset-0 bg-black/40" />

              <div className="absolute bottom-8 left-8">
                <h3 className="text-3xl font-bold">
                  {item.name}
                </h3>
              </div>

            </div>
          ))}

        </div>

      </div>

    </section>
  );
}