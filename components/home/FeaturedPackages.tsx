import { packages } from "@/data/packages";
import PackageCard from "@/components/packages/PackageCard";

export default function FeaturedPackages() {
  return (
    <section className="bg-[#f5f5f5] px-4 py-24 md:px-8">
      <div className="mx-auto max-w-7xl">

        {/* VIBE CONTAINER */}
        <div className="relative overflow-hidden rounded-[40px] bg-[#071120] px-6 py-16 shadow-2xl md:px-12 lg:px-14">

          {/* SOFT GLOW */}
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#FF7A00]/20 blur-[90px]" />
          <div className="absolute -bottom-28 -left-28 h-72 w-72 rounded-full bg-white/10 blur-[90px]" />

          {/* HEADER */}
          <div className="relative z-10 mb-12 text-center">
            <p className="text-sm font-semibold uppercase tracking-[4px] text-[#FF7A00]">
              Luxury Packages
            </p>

            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-white md:text-4xl">
              Explore Trending Tours
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-white/60 md:text-base">
              Discover premium travel experiences crafted for unforgettable
              adventures around the world.
            </p>
          </div>

          {/* GRID */}
          <div className="relative z-10 flex flex-wrap justify-center gap-6">
            {packages.slice(0, 3).map((item) => (
              <div
                key={item.slug}
                className="w-[260px] flex-shrink-0 rounded-[32px] border border-white/10 bg-white/[0.04] p-2 backdrop-blur-md transition hover:-translate-y-2 hover:bg-white/[0.07]"
              >
                <PackageCard item={item} />
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}