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
      <div className="relative h-[520px] overflow-hidden rounded-[34px] transition-all duration-500 group-hover:-translate-y-2">

        {/* IMAGE */}
        <Image
          src={item.image}
          alt={item.title}
          fill
          className="object-cover transition duration-[2500ms] ease-out group-hover:scale-110"
        />

        {/* OVERLAY */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* CATEGORY */}
        <div className="absolute left-5 top-5 rounded-full bg-white/15 px-4 py-2 text-sm backdrop-blur-xl border border-white/20">
          {item.category}
        </div>

        {/* CONTENT */}
        <div className="absolute bottom-0 left-0 w-full p-6">

          <div className="rounded-[28px] border border-white/10 bg-white/8 p-6 backdrop-blur-xl shadow-[0_8px_40px_rgba(0,0,0,0.25)]">

            <div className="flex items-center justify-between">

              <p className="text-sm uppercase tracking-[2px] text-[#00C2FF]">
                {item.location}
              </p>

              <p className="text-sm text-white/70">
                {item.duration}
              </p>

            </div>

            <h2 className="mt-4 text-4xl font-bold leading-tight text-white">
              {item.title}
            </h2>

            <div className="mt-6 flex items-center justify-between">

              <div>
                <p className="text-sm text-white/60">
                  Starting From
                </p>

                <h3 className="text-3xl font-bold text-white">
                  {item.price}
                </h3>
              </div>

              <button className="rounded-full bg-[#00C2FF] px-6 py-3 font-semibold text-black transition hover:scale-105">
                Explore
              </button>

            </div>

          </div>

        </div>

      </div>
    </Link>
  );
}