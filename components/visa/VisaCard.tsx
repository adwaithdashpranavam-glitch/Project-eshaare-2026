import Link from "next/link";
import Image from "next/image";

interface VisaCardProps {
  slug: string;
  country: string;
  image: string;
  processing: string;
}

export default function VisaCard({
  slug,
  country,
  image,
  processing,
}: VisaCardProps) {
  return (
    <Link href={`/visa/${slug}`}>

      <div className="group overflow-hidden rounded-[28px] border border-white/10 bg-[#0b1426] transition hover:-translate-y-2 hover:border-[#FF9F1C]">

        <div className="relative h-64 overflow-hidden">

          <Image
            src={image}
            alt={country}
            fill
            className="object-cover transition duration-700 group-hover:scale-110"
          />

          <div className="absolute inset-0 bg-black/35" />

        </div>

        <div className="p-6">

          <h3 className="text-2xl font-bold text-white">
            {country}
          </h3>

          <p className="mt-3 text-gray-400">
            Processing Time: {processing}
          </p>

          <button className="mt-6 rounded-full bg-[#FF9F1C] px-6 py-3 font-semibold text-black transition hover:bg-[#F48C06]">
            Apply Now
          </button>

        </div>

      </div>

    </Link>
  );
}