export default function InquiryForm() {
  return (
    <section className="py-24 bg-white/[0.02]">

      <div className="max-w-3xl mx-auto px-6">

        <div className="text-center mb-12">

          <p className="text-[#D4AF37] uppercase text-sm tracking-[3px]">
            Inquiry
          </p>

          <h2 className="text-4xl font-bold mt-4">
            Start Your Journey
          </h2>

        </div>

        <div className="space-y-6">

          <input
            type="text"
            placeholder="Your Name"
            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-[#D4AF37]"
          />

          <input
            type="email"
            placeholder="Your Email"
            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-[#D4AF37]"
          />

          <textarea
            placeholder="Your Message"
            rows={5}
            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-[#D4AF37]"
          />

          <button className="bg-[#D4AF37] text-black px-8 py-4 rounded-2xl font-semibold hover:bg-yellow-500 transition">
            Send Inquiry
          </button>

        </div>

      </div>

    </section>
  );
}