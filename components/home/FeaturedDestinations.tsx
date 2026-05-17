import Image from "next/image";

const destinations = [
  {
    name: "Switzerland",
    image: "/images/destinations/Switzerland.jpg",
  },
  {
    name: "Japan",
    image: "/images/destinations/japan.jpg",
  },
  {
    name: "Maldives",
    image: "/images/destinations/maldives.jpg",
  },
  {
    name: "Thailand",
    image: "/images/destinations/Thailand beach.jpg",
  },
  {
    name: "Georgia",
    image: "/images/destinations/georgia.jpg",
  },
  {
    name: "Dubai",
    image: "/images/Dubai travel.jpg",
  },
];

export default function FeaturedDestinations() {
  return (
    <section className="bg-[#f5f5f5] px-4 py-20 md:px-8">

      <div className="max-w-7xl mx-auto">

        <div className="mb-14">
          <p className="text-sm font-semibold uppercase tracking-[3px] text-[#e68932]">
            Destinations
          </p>

          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-[#071120] md:text-4xl">
            Popular Destinations
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">

          {destinations.map((item) => (
            <div
              key={item.name}
              className="relative h-72 overflow-hidden rounded-3xl group border border-white/10"
            >

              <Image
                src={item.image}
                alt={item.name}
                fill
                className="object-cover group-hover:scale-110 transition duration-700"
              />

              <div className="absolute inset-0 bg-black/40" />

              <div className="absolute bottom-0 p-8">
                <h3 className="text-3xl font-bold text-white">
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