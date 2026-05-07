import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#071120] text-white">
      <div className="max-w-7xl mx-auto px-6 py-10">

        <div className="flex flex-col md:flex-row justify-between gap-10">

          <div>
            <h2 className="text-2xl font-bold text-[#D4AF37]">
              ESHAARE TOUR
            </h2>

            <p className="text-gray-400 mt-4 max-w-sm">
              Premium Visa & Travel Services for worldwide destinations.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">
              Quick Links
            </h3>

            <div className="flex flex-col gap-2 text-gray-400">

              <Link href="/">Home</Link>

              <Link href="/about">About</Link>

              <Link href="/contact">Contact</Link>

            </div>
          </div>

        </div>

        <div className="border-t border-white/10 mt-10 pt-6 text-sm text-gray-500">
          © 2026 ESHAARE TOUR. All rights reserved.
        </div>

      </div>
    </footer>
  );
}