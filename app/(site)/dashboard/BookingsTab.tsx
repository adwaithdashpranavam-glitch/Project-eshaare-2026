"use client";
import { useState } from "react";
import Link from "next/link";
import { Briefcase, Download, Loader2 } from "lucide-react";

export default function BookingsTab({ bookings, t }: { bookings: any[]; t: any }) {
  const [loadingItineraryId, setLoadingItineraryId] = useState<string | null>(null);

  const handlePrintItinerary = async (booking: any) => {
    try {
      setLoadingItineraryId(booking.id);
      // Dynamically load the static package data on demand
      const { packages: allPackages } = await import("@/data/packages");
      const pkg: any = allPackages.find((p: any) => p.id === booking.packageId || p.slug === booking.packageId);
      
      const printWindow = window.open("", "_blank");
      if (!printWindow) return;
      
      const title = pkg ? pkg.title : booking.itemName;
      const duration = pkg ? pkg.duration : "N/A";
      const overview = pkg ? pkg.overview : "Package details & itinerary confirmations.";
      const inclusionsHtml = pkg ? pkg.inclusions.map((inc: string) => `<li>${inc}</li>`).join("") : "<li>Standard stay benefits included</li>";
      const exclusionsHtml = pkg ? pkg.exclusions.map((exc: string) => `<li>${exc}</li>`).join("") : "<li>Personal expenses & flights excluded</li>";
      
      let itineraryHtml = "";
      if (pkg && pkg.itinerary && pkg.itinerary.length > 0) {
        itineraryHtml = `
          <h2>Day-Wise Itinerary</h2>
          <div class="itinerary">
            ${pkg.itinerary.map((day: string, idx: number) => `
              <div class="day-card">
                <span class="day-num">Day ${idx + 1}</span>
                <p>${day}</p>
              </div>
            `).join("")}
          </div>
        `;
      } else {
        itineraryHtml = `
          <h2>Package Travel Itinerary</h2>
          <div class="day-card">
            <span class="day-num">Day 1</span>
            <p>Arrival, meet & greet, airport transfer, hotel check-in and evening leisure time.</p>
          </div>
          <div class="day-card">
            <span class="day-num">Day 2</span>
            <p>Breakfast at hotel, half-day city tour exploring major sightseeing sights, return to hotel.</p>
          </div>
          <div class="day-card">
            <span class="day-num">Day 3</span>
            <p>Full day adventure trip, local culinary lunch tasting, cultural tour and sightseeing.</p>
          </div>
          <div class="day-card">
            <span class="day-num">Day 4</span>
            <p>Free leisure day for shopping, optional watersports or local sightseeing excursions.</p>
          </div>
          <div class="day-card">
            <span class="day-num">Day 5</span>
            <p>Breakfast at hotel, free time for check-out and departure airport transfers.</p>
          </div>
        `;
      }
      
      printWindow.document.write(`
        <html>
          <head>
            <title>Travel Itinerary - ${title}</title>
            <style>
              body { font-family: Arial, sans-serif; color: #333; line-height: 1.6; padding: 40px; max-width: 800px; margin: 0 auto; }
              h1 { color: #e68932; border-bottom: 2px solid #e68932; padding-bottom: 10px; margin-bottom: 5px; }
              h2 { color: #0b1426; margin-top: 30px; border-bottom: 1px solid #eee; padding-bottom: 5px; }
              .duration { font-style: italic; color: #666; margin-bottom: 20px; font-weight: bold; }
              .day-card { margin-bottom: 20px; padding: 15px; background: #f9f9f9; border-left: 4px solid #e68932; border-radius: 4px; }
              .day-num { font-weight: bold; color: #e68932; display: block; font-size: 1.1em; margin-bottom: 5px; }
              ul { padding-left: 20px; }
              li { margin-bottom: 5px; }
              .header-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
              .header-table td { padding: 5px; }
              .footer { margin-top: 50px; font-size: 0.8em; text-align: center; color: #999; border-top: 1px solid #eee; padding-top: 10px; }
              @media print {
                .no-print { display: none; }
                body { padding: 20px; }
              }
            </style>
          </head>
          <body>
            <div class="no-print" style="margin-bottom: 20px; text-align: right;">
              <button onclick="window.print()" style="padding: 10px 20px; background: #e68932; color: #fff; border: 0; border-radius: 4px; font-weight: bold; cursor: pointer;">Print / Download PDF</button>
            </div>
            <h1>ESHAARE TOURS & TRAVELS</h1>
            <div class="duration">Official Travel Confirmation & Itinerary</div>
            
            <table class="header-table">
              <tr>
                <td><strong>Destination:</strong> ${title}</td>
                <td><strong>Duration:</strong> ${duration}</td>
              </tr>
              <tr>
                <td><strong>Booking Status:</strong> CONFIRMED</td>
                <td><strong>Booking ID:</strong> ${booking.id}</td>
              </tr>
            </table>
            
            <h2>Overview</h2>
            <p>${overview}</p>
            
            ${itineraryHtml}
            
            <h2>Inclusions</h2>
            <ul>${inclusionsHtml}</ul>
            
            <h2>Exclusions</h2>
            <ul>${exclusionsHtml}</ul>
            
            <div class="footer">
              Thank you for choosing Eshaare Tour. For 24/7 travel assistance, reach out at info@eshaare.com.
            </div>
            
            <script>
              window.onload = function() {
                setTimeout(function() {
                  window.print();
                }, 500);
              }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    } catch (err) {
      console.error("Failed to print itinerary:", err);
    } finally {
      setLoadingItineraryId(null);
    }
  };

  return (
    <div className="text-left rtl:text-right">
      <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
        <Briefcase className="text-[#e68932]" />
        {t("Holiday Package Bookings")}
      </h2>
      
      {bookings.length === 0 ? (
        <div className="text-center py-20 border border-white/5 rounded-2xl bg-white/5">
          <Briefcase className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <p className="text-gray-400 font-semibold">{t("You have no active tour bookings.")}</p>
          <Link href="/packages" className="mt-4 inline-block bg-[#e68932] text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-[#cf7726] transition">
            {t("Explore Packages")}
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {bookings.map((booking) => (
            <div key={booking.id} className="p-5 rounded-2xl border border-white/10 bg-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h3 className="text-lg font-bold text-white">{booking.itemName || "Tourism Package Stay"}</h3>
                <p className="text-xs text-gray-400 mt-1">{t("Booked on")}: {booking.createdAt?.toDate ? booking.createdAt.toDate().toLocaleDateString() : new Date().toLocaleDateString()}</p>
                <div className="flex gap-4 mt-2">
                  <span className="text-xs text-gray-300">{t("Number of Travelers")}: {booking.guests || 2} Adults</span>
                  <span className="text-xs text-[#e68932] font-semibold">{booking.price || "Contact for Price"}</span>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
                <button
                  onClick={() => handlePrintItinerary(booking)}
                  disabled={loadingItineraryId === booking.id}
                  className="px-4 py-2 border border-[#e68932] hover:bg-[#e68932] text-[#e68932] hover:text-black rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {loadingItineraryId === booking.id ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                  <span>Itinerary</span>
                </button>
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase text-center ${
                  booking.status === "confirmed" ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"
                }`}>
                  {booking.status || "pending"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
