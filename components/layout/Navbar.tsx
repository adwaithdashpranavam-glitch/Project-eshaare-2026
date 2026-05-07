import Link from "next/link";

export default function Navbar() {
  return (
    <header className="w-full border-b border-white/10 bg-[#071120]/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">

        <div>
          <h1 className="text-2xl font-bold text-[#D4AF37]">
            ESHAARE
          </h1>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-sm text-white">

          <Link
            href="/"
            className="hover:text-[#D4AF37] transition"
          >
            Home
          </Link>

          <Link
            href="/about"
            className="hover:text-[#D4AF37] transition"
          >
            About
          </Link>

          <Link
            href="/contact"
            className="hover:text-[#D4AF37] transition"
          >
            Contact
          </Link>

        </nav>

        <button className="bg-[#D4AF37] text-black px-5 py-2 rounded-xl font-medium hover:bg-yellow-500 transition">
          WhatsApp
        </button>

      </div>
    </header>
  );
}