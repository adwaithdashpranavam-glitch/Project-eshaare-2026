import Image from "next/image";

export default function TourHero() {
    return (
        <section className="relative flex h-[65vh] min-h-[520px] items-center justify-center overflow-hidden">

            {/* BG */}
            <div className="absolute inset-0">

                <Image
                    src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2000&auto=format&fit=crop"
                    alt="Tours"
                    fill
                    priority
                    className="object-cover"
                />

                <div className="absolute inset-0 bg-black/60" />

            </div>

            {/* CONTENT */}
            <div className="relative z-10 mx-auto max-w-4xl px-4 text-center">

                <p className="mb-4 text-sm font-semibold uppercase tracking-[5px] text-[#00C2FF]">
                    Luxury Experiences
                </p>

                <h1 className="text-5xl font-extrabold tracking-tight text-white md:text-7xl">
                    Explore The <span className="text-[#00C2FF]">World</span>
                </h1>

                <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-gray-200">
                    Discover unforgettable international tour packages,
                    premium experiences, adventure escapes, and luxury holidays.
                </p>

            </div>

        </section>
    );
}