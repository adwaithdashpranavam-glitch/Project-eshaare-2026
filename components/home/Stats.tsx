const stats = [
  {
    number: "15K+",
    title: "Happy Travelers",
  },
  {
    number: "50+",
    title: "Countries",
  },
  {
    number: "10+",
    title: "Years Experience",
  },
  {
    number: "24/7",
    title: "Support",
  },
];

export default function Stats() {
  return (
    <section className="py-20">

      <div className="max-w-7xl mx-auto px-6">

        <div className="grid md:grid-cols-4 gap-6">

          {stats.map((item) => (
            <div
              key={item.title}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-10 text-center"
            >

              <h2 className="text-5xl font-bold text-[#D4AF37]">
                {item.number}
              </h2>

              <p className="text-gray-300 mt-4">
                {item.title}
              </p>

            </div>
          ))}

        </div>

      </div>

    </section>
  );
}