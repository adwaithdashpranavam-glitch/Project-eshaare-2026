import { Heart, Star, Clock } from "lucide-react";

interface Props {
    title: string;
    image: string;
    rating: string;
    duration: string;
    price: string;
    tag?: string;
}

export default function TourCard({
    title,
    image,
    rating,
    duration,
    price,
    tag,
}: Props) {
    return (
        <div className="group overflow-hidden rounded-[24px] bg-white shadow-sm transition hover:-translate-y-2 hover:shadow-2xl">

            {/* IMAGE */}
            <div className="relative h-64 overflow-hidden">

                <img
                    src={image}
                    alt={title}
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
                />

                {/* LIKE */}
                <button className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#071120] shadow-lg">

                    <Heart size={18} />

                </button>

                {/* TAG */}
                {tag && (
                    <div className="absolute left-4 top-4 rounded-full bg-[#ff4d6d] px-3 py-1 text-xs font-semibold text-white">
                        {tag}
                    </div>
                )}

            </div>

            {/* CONTENT */}
            <div className="p-5">

                {/* RATING */}
                <div className="flex items-center gap-1 text-sm font-medium text-[#00C2FF]">

                    <Star size={14} fill="#00C2FF" />

                    {rating}

                </div>

                {/* TITLE */}
                <h3 className="mt-3 line-clamp-2 text-lg font-bold leading-snug text-[#071120]">
                    {title}
                </h3>

                {/* DURATION */}
                <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">

                    <Clock size={15} />

                    {duration}

                </div>

                {/* PRICE */}
                <div className="mt-5 flex items-center justify-between">

                    <div>

                        <p className="text-sm text-gray-400">
                            from
                        </p>

                        <h4 className="text-2xl font-extrabold text-[#071120]">
                            {price}
                        </h4>

                    </div>

                    <button className="rounded-full bg-[#071120] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#00C2FF] hover:text-black">
                        Explore
                    </button>

                </div>

            </div>

        </div>
    );
}