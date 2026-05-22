const items = [
  {
    title: "Fast Visa Processing",
    image: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=600&q=80",
  },
  {
    title: "Luxury Travel Support",
    image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=600&q=80",
  },
  {
    title: "Trusted Worldwide",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80",
  },
  {
    title: "Expert Consultation",
    image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=600&q=80",
  },
];

export default function WhyChooseUs() {
  return (
    <section className="bg-[#f5f5f5] px-4 py-20 md:px-8">

      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="mb-14">

          <p className="text-sm font-semibold uppercase tracking-[3px] text-[#e68932]">
            Why Choose Us
          </p>

          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-[#071120] md:text-5xl">
            Premium Travel Experience
          </h2>

          <p className="mt-5 max-w-2xl text-[#071120]/60 leading-8">
            Experience world-class visa and travel services
            crafted with luxury, trust, and personalized care.
          </p>

        </div>

        {/* CARDS */}
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

          {items.map((item) => (
            <div
              key={item.title}
              className="
                group
                relative
                h-[420px]
                overflow-hidden
                rounded-[32px]
                border border-white/20
              "
            >

              {/* IMAGE */}
              <img
                src={item.image}
                alt={item.title}
                className="
                  h-full
                  w-full
                  object-cover
                  transition
                  duration-700
                  group-hover:scale-110
                "
              />

              {/* DARK OVERLAY */}
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition duration-500" />

              {/* GOLD GLOW */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-t from-[#e68932]/40 via-transparent to-transparent transition duration-500" />

              {/* CONTENT */}
              <div className="absolute bottom-0 p-8">

                <div className="
                  mb-5
                  flex
                  h-14
                  w-14
                  items-center
                  justify-center
                  rounded-2xl
                  bg-white/10
                  backdrop-blur-md
                  border border-white/20
                  text-white
                  text-xl
                ">
                  ✦
                </div>

                <h3 className="text-2xl font-bold text-white leading-tight">
                  {item.title}
                </h3>

                <div className="
                  mt-5
                  h-[2px]
                  w-12
                  bg-[#e68932]
                  transition-all
                  duration-500
                  group-hover:w-full
                " />

              </div>

            </div>
          ))}

        </div>

      </div>

    </section>
  );
}