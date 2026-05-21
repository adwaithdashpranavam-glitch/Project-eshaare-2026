
import Image from "next/image";

export default function TourHero() {
    return (
        <section className="relative flex min-h-[650px] items-center justify-center overflow-hidden">

            {/* BG */}
            <div className="absolute inset-0">

                <Image
                    src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2000&auto=format&fit=crop"
                    alt="Tours"
                    fill
                    priority
                    className="object-cover"
                />

                {/* OVERLAY */}
                <div className="absolute inset-0 bg-black/65" />

                {/* GRADIENT */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/30 to-[#071120]" />

            </div>

            {/* CONTENT */}
            <div className="relative z-10 mx-auto max-w-6xl px-6 text-center">

                {/* TOP TAG */}
                <div className="inline-flex items-center gap-2 rounded-full border border-[#00C2FF]/30 bg-[#00C2FF]/10 px-5 py-2 backdrop-blur-xl">

                    <span className="h-2 w-2 rounded-full bg-[#00C2FF]" />

                    <p className="text-sm font-semibold uppercase tracking-[4px] text-[#00C2FF]">
                        Premium International Tours
                    </p>

                </div>

                {/* TITLE */}
                <h1 className="mt-8 text-5xl font-extrabold leading-tight tracking-tight text-white md:text-7xl">

                    Explore The{" "}

                    <span className="bg-gradient-to-r from-[#00C2FF] to-[#8BE8FF] bg-clip-text text-transparent">
                        World
                    </span>

                </h1>

                {/* SUBTITLE */}
                <p className="mx-auto mt-8 max-w-3xl text-lg leading-relaxed text-gray-300 md:text-xl">
                    Discover unforgettable international tour packages,
                    luxury escapes, honeymoon experiences, seasonal adventures,
                    and premium holiday journeys crafted for modern travelers.
                </p>

                {/* CTA BUTTONS */}
                <div className="mt-12 flex flex-col items-center justify-center gap-5 sm:flex-row">

                    <button className="rounded-2xl bg-[#00C2FF] px-8 py-4 text-lg font-bold text-black transition hover:scale-105">
                        Explore Packages
                    </button>

                    <button className="rounded-2xl border border-white/20 bg-white/5 px-8 py-4 text-lg font-semibold text-white backdrop-blur-xl transition hover:border-[#00C2FF]/50">
                        View Offers
                    </button>

                </div>

                {/* STATS */}
                <div className="mt-16 grid grid-cols-2 gap-5 md:grid-cols-4">

                    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">

                        <h3 className="text-3xl font-bold text-[#00C2FF]">
                            50+
                        </h3>

                        <p className="mt-2 text-sm text-white/70">
                            Luxury Packages
                        </p>

                    </div>

                    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">

                        <h3 className="text-3xl font-bold text-[#00C2FF]">
                            20+
                        </h3>

                        <p className="mt-2 text-sm text-white/70">
                            Countries
                        </p>

                    </div>

                    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">

                        <h3 className="text-3xl font-bold text-[#00C2FF]">
                            5K+
                        </h3>

                        <p className="mt-2 text-sm text-white/70">
                            Happy Travelers
                        </p>

                    </div>

                    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">

                        <h3 className="text-3xl font-bold text-[#00C2FF]">
                            24/7
                        </h3>

                        <p className="mt-2 text-sm text-white/70">
                            Travel Support
                        </p>

                    </div>

                </div>

            </div>

        </section>
    );
}
