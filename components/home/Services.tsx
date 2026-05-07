const services = [
  "Tour Packages",
  "Visit Visa",
  "Flight Booking",
  "Travel Insurance",
  "Hotel Reservations",
  "Umrah Packages",
];

export default function Services() {
  return (
    <section className="py-24">

      <div className="max-w-7xl mx-auto px-6">

        <div className="mb-14">
          <p className="text-[#D4AF37] uppercase text-sm tracking-[3px]">
            Our Services
          </p>

          <h2 className="text-4xl font-bold mt-4">
            Premium Travel Solutions
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">

          {services.map((service) => (
            <div
              key={service}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 hover:border-[#D4AF37] hover:-translate-y-2 transition duration-300"
            >
              <h3 className="text-2xl font-semibold">
                {service}
              </h3>

              <p className="text-gray-400 mt-4 leading-7">
                Trusted global travel support with premium quality service.
              </p>
            </div>
          ))}

        </div>

      </div>

    </section>
  );
}