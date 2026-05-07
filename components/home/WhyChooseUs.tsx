const items = [
  {
    title: "Fast Visa Processing",
  },
  {
    title: "Luxury Travel Support",
  },
  {
    title: "Trusted Worldwide",
  },
  {
    title: "Expert Consultation",
  },
];

export default function WhyChooseUs() {
  return (
    <section className="py-24">

      <div className="max-w-7xl mx-auto px-6">

        <div className="mb-14">
          <p className="text-[#D4AF37]">
            Why Choose Us
          </p>

          <h2 className="text-4xl font-bold mt-4">
            Premium Travel Experience
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">

          {items.map((item) => (
            <div
              key={item.title}
              className="bg-white/5 border border-white/10 rounded-3xl p-8"
            >
              <h3 className="text-xl font-semibold">
                {item.title}
              </h3>
            </div>
          ))}

        </div>

      </div>

    </section>
  );
}