import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";

import { Package } from "@/types/package";

type Props = {
  item: Package;
  isLiked?: boolean;
  onLikeToggle?: (e: React.MouseEvent) => void;
};

export default function PackageCard({ item, isLiked = false, onLikeToggle }: Props) {
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
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition duration-700 group-hover:scale-110"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />

          {/* CATEGORY */}
          <div className="absolute top-4 left-4 rounded-full bg-[#00C2FF] px-3 py-1 text-xs font-semibold text-black">
            {item.category}
          </div>

          {/* LIKE BUTTON */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (onLikeToggle) {
                onLikeToggle(e);
              }
            }}
            className="absolute top-4 right-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 backdrop-blur-md text-white border border-white/10 hover:bg-[#ff4d6d] hover:text-white hover:border-[#ff4d6d] transition duration-300"
          >
            <Heart
              size={16}
              className={isLiked ? "fill-[#ff4d6d] text-[#ff4d6d]" : "text-white"}
            />
          </button>

          {/* OFFER BADGE */}
          {item.offerText && (
            <div className="absolute top-4 right-16 rounded-full bg-red-500 px-3 py-1 text-xs font-bold text-white shadow-lg">
              {item.offerText}
            </div>
          )}

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

          {/* SEASON TAG */}
          {item.seasonTag && (
            <p className="mt-2 text-sm text-orange-400">
              {item.seasonTag}
            </p>
          )}

          <div className="mt-6 flex items-center justify-between">

            <div>

              <p className="text-xs text-white/50">
                Starting From
              </p>

              {/* OLD PRICE */}
              {item.seasonalPrice && (
                <p className="text-sm text-red-400 line-through">
                  {item.seasonalPrice}
                </p>
              )}

              {/* CURRENT PRICE */}
              <h3 className="text-xl font-bold">
                {item.price}
              </h3>

              {/* SEATS LEFT */}
              {item.seatsLeft ? (
                <p className="mt-1 text-xs text-orange-400">
                  Only {item.seatsLeft} Seats Left
                </p>
              ) : null}

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

