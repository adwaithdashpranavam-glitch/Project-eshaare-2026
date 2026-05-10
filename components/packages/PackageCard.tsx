import Image from "next/image";
import Link from "next/link";

type Props = {
  item: {
    slug: string;
    title: string;
    location: string;
    duration: string;
    price: string;
    category: string;
    image: string;
  };
};

export default function PackageCard({ item }: Props) {
  return (
    <Link
      href={`/packages/${item.slug}`}
      className="group"
    >
      <div className="overflow-hidden rounded-[30px] border border-white/10 bg-white/5 backdrop-blur-xl transition hover:-translate-y-2 hover:border-[#00C2FF]/50">

        {/* IMAGE */}
        <div className="relative h-72 overflow-hidden">
          <Image
            src={item.image}
            alt={item.title}
            fill
            className="object-cover transition duration-700 group-hover:scale-110"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />

          <div className="absolute top-5 left-5 rounded-full bg-[#00C2FF] px-4 py-1 text-sm font-semibold text-black">
            {item.category}
          </div>
        </div>

        {/* CONTENT */}
        <div className="p-6">

          <div className="flex items-center justify-between">
            <p className="text-white/60">
              {item.location}
            </p>

            <p className="text-[#00C2FF] font-semibold">
              {item.duration}
            </p>
          </div>

          <h2 className="mt-4 text-3xl font-bold">
            {item.title}
          </h2>

          <div className="mt-8 flex items-center justify-between">

            <div>
              <p className="text-white/50 text-sm">
                Starting From
              </p>

              <h3 className="text-3xl font-bold">
                {item.price}
              </h3>
            </div>

            <button className="rounded-2xl bg-[#00C2FF] px-5 py-3 font-semibold text-black transition hover:opacity-90">
              Explore
            </button>

          </div>

        </div>

      </div>
    </Link>
  );
}