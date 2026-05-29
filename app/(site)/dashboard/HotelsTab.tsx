"use client";
import Link from "next/link";
import { Hotel, Calendar } from "lucide-react";

export default function HotelsTab({ hotelBookings, t }: { hotelBookings: any[]; t: any }) {
  return (
    <div className="text-left rtl:text-right">
      <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
        <Hotel className="text-[#e68932]" />
        {t("Hotel Bookings")}
      </h2>

      {hotelBookings.length === 0 ? (
        <div className="text-center py-20 border border-white/5 rounded-2xl bg-white/5">
          <Hotel className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <p className="text-gray-400 font-semibold">{t("You have no active hotel bookings.")}</p>
          <Link href="/hotels" className="mt-4 inline-block bg-[#e68932] text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-[#cf7726] transition">
            {t("View Luxury Hotels")}
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {hotelBookings.map((hotel) => (
            <div key={hotel.id} className="p-5 rounded-2xl border border-white/10 bg-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h3 className="text-lg font-bold text-[#00C2FF]">{hotel.details?.split("Hotel: ")[1]?.split(" (")[0] || "Luxury Stay Hotel"}</h3>
                <p className="text-xs text-gray-400 mt-1">{hotel.details || "Hotel Booking Inquiries"}</p>
                <div className="flex gap-4 mt-2">
                  {hotel.date && <span className="text-xs text-gray-300 flex items-center gap-1"><Calendar size={12} /> {hotel.date}</span>}
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase bg-yellow-500/20 text-yellow-400 text-center`}>
                {hotel.status || "pending"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
