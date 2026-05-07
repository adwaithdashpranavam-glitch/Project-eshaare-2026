const testimonials = [
  {
    name: "Adwith",
    text: "Excellent visa service and smooth travel experience.",
  },
  {
    name: "Rakhi",
    text: "Professional team with premium support.",
  },
  {
    name: "Ram",
    text: "Fast processing and luxury holiday packages.",
  },
];

export default function Testimonials() {
  return (
    <section className="py-24">

      <div className="max-w-7xl mx-auto px-6">

        <div className="mb-14">
          <p className="text-[#D4AF37] uppercase text-sm tracking-[3px]">
            Testimonials
          </p>

          <h2 className="text-4xl font-bold mt-4">
            What Clients Say
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">

          {testimonials.map((item) => (
            <div
              key={item.name}
              className="bg-white/5 border border-white/10 rounded-3xl p-8"
            >
              <p className="text-gray-300 leading-7">
                &ldquo;{item.text}&rdquo;
              </p>

              <h3 className="mt-6 font-semibold text-[#D4AF37]">
                {item.name}
              </h3>
            </div>
          ))}

        </div>

      </div>

    </section>
  );
}