"use client";
import { CreditCard } from "lucide-react";

export default function PaymentsTab({ payments, t }: { payments: any[]; t: any }) {
  return (
    <div className="text-left rtl:text-right">
      <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
        <CreditCard className="text-[#e68932]" />
        {t("Payment History")}
      </h2>

      {payments.length === 0 ? (
        <div className="text-center py-20 border border-white/5 rounded-2xl bg-white/5">
          <CreditCard className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <p className="text-gray-400 font-semibold">{t("No recent billing records found.")}</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-white/10 bg-black/40">
          <table className="w-full text-left border-collapse text-xs md:text-sm">
            <thead>
              <tr className="border-b border-white/10 text-xs font-semibold uppercase tracking-wider text-gray-400 bg-white/5">
                <th className="px-5 py-3">Billing Item</th>
                <th className="px-5 py-3">Transaction ID</th>
                <th className="px-5 py-3">Paid Amount</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs md:text-sm">
              {payments.map((p) => (
                <tr key={p.id}>
                  <td className="px-5 py-3.5 font-medium text-white">{p.itemName || "Visa / Stay Package"}</td>
                  <td className="px-5 py-3.5 font-mono text-2xs md:text-xs text-gray-400">{p.id}</td>
                  <td className="px-5 py-3.5 text-green-400 font-semibold">AED {p.amount}</td>
                  <td className="px-5 py-3.5">
                    <span className="text-2xs px-2.5 py-0.5 rounded bg-green-500/20 text-green-400 font-bold border border-green-500/10">
                      {p.status || "Paid"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
