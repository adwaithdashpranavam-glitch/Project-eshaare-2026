import Image from "next/image";
import Link from "next/link";

import { Package } from "@/types/package";

type Props = {
  item: Package;
};

export default function PackageCard({ item }: Props) {
  return (
    <Link
      href={`/packages/${item.slug}`}
      className="group block w-full"
    >
      <div className="overflow-hidden rounded-[30px] border border-white/10 bg-white/5 backdrop-blur-xl transition hover:-translate-y-2 hover:border-[#00C2FF]/50">

        {/* IMAGE */}
        <div className="relative h-48 overflow-hidden">
          <Image
            src={item.image}
            alt={item.title}
            fill
            className="object-cover transition duration-700 group-hover:scale-110"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />

          <div className="absolute top-4 left-4 rounded-full bg-[#00C2FF] px-3 py-1 text-xs font-semibold text-black">
            {item.category}
          </div>
        </div>

        {/* CONTENT */}
        <div className="p-5">

          <div className="flex items-center justify-between">
            <p className="text-sm text-white/60">
              {item.destination}
            </p>

            <p className="text-sm font-semibold text-[#00C2FF]">
              {item.duration}
            </p>
          </div>

          <h2 className="mt-3 text-xl font-bold">
            {item.title}
          </h2>

          <div className="mt-6 flex items-center justify-between">

            <div>
              <p className="text-xs text-white/50">
                Starting From
              </p>

              <h3 className="text-xl font-bold">
                {item.price}
              </h3>
            </div>

            <button className="rounded-xl bg-[#00C2FF] px-4 py-2 text-sm font-semibold text-black transition hover:opacity-90">
              Explore
            </button>

          </div>

        </div>

      </div>
    </Link>
  );
}