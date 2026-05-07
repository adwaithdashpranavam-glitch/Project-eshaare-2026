const services = [
  "Schengen Visa",
  "UK Visa",
  "USA Visa",
  "Japan Visa",
  "UAE Visa",
  "Saudi Visa",
];

export default function VisaServices() {
  return (
    <section className="py-24 px-6">

      <div className="max-w-7xl mx-auto">

        <div className="mb-14">
          <p className="text-[#D4AF37] uppercase tracking-[3px]">
            Visa Services
          </p>

          <h2 className="text-4xl font-bold mt-4">
            Premium Visa Assistance
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">

          {services.map((service) => (
            <div
              key={service}
              className="bg-white/5 border border-white/10 rounded-3xl p-8 hover:border-[#D4AF37] transition"
            >
              <h3 className="text-2xl font-semibold">
                {service}
              </h3>

              <p className="text-gray-400 mt-4 leading-7">
                Professional consultation and document support
                for fast visa approval.
              </p>
            </div>
          ))}

        </div>

      </div>

    </section>
  );
}