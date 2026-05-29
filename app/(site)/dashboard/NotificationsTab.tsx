"use client";
import { Bell } from "lucide-react";

export default function NotificationsTab({ notifications, t }: { notifications: any[]; t: any }) {
  return (
    <div className="text-left rtl:text-right">
      <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
        <Bell className="text-[#e68932]" />
        {t("Notifications")}
      </h2>

      <div className="space-y-3">
        {notifications.map((n) => (
          <div key={n.id} className={`p-5 rounded-2xl border ${
            n.read ? "border-white/5 bg-white/5" : "border-[#e68932]/20 bg-[#e68932]/5"
          } relative`}>
            {!n.read && <div className="absolute top-5 right-5 w-2.5 h-2.5 bg-[#e68932] rounded-full" />}
            <h3 className="font-bold text-base text-white">{n.title}</h3>
            <p className="text-sm text-gray-300 mt-1">{n.message}</p>
            <span className="text-[10px] text-gray-500 mt-2 block font-semibold">{n.date}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
