"use client";
import Link from "next/link";
import { FileText } from "lucide-react";

export default function VisasTab({ visaApps, t }: { visaApps: any[]; t: any }) {
  const getVisaStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved": return "bg-green-500/20 text-green-400 border border-green-500/10";
      case "processing": return "bg-blue-500/20 text-blue-400 border border-blue-500/10";
      case "rejected": return "bg-red-500/20 text-red-400 border border-red-500/10";
      default: return "bg-yellow-500/20 text-yellow-400 border border-yellow-500/10";
    }
  };

  const getActiveVisaStepIndex = (status: string) => {
    const s = status.toLowerCase();
    if (s === "approved" || s === "ready" || s === "completed") return 3;
    if (s === "processing" || s === "under review" || s === "in embassy") return 2;
    if (s === "verified" || s === "document checklist verified") return 1;
    return 0; // New/Submitted
  };

  return (
    <div className="text-left rtl:text-right">
      <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
        <FileText className="text-[#e68932]" />
        {t("Visa Applications")}
      </h2>

      {visaApps.length === 0 ? (
        <div className="text-center py-20 border border-white/5 rounded-2xl bg-white/5">
          <FileText className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <p className="text-gray-400 font-semibold">{t("No active visa applications found for your profile.")}</p>
          <Link href="/visa" className="mt-4 inline-block bg-[#e68932] text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-[#cf7726] transition">
            {t("Apply for Visa")}
          </Link>
        </div>
      ) : (
        <div className="grid gap-6">
          {visaApps.map((app) => {
            const activeStepIndex = getActiveVisaStepIndex(app.status);
            const isRejected = app.status?.toLowerCase() === "rejected";
            const steps = [
              t("Submitted"), 
              t("Verified"), 
              t("Processing"), 
              isRejected ? t("Rejected") : t("Decision Ready")
            ];

            return (
              <div key={app.id} className="p-6 rounded-3xl border border-white/10 bg-white/5 space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-white">{t("Applicant")}: {app.applicantName}</h3>
                    <p className="text-xs text-gray-400 mt-1">{t("Destination Country")}: <span className="font-semibold text-white">{t(app.destination)}</span> | Passport: {app.passportNumber}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase text-center ${getVisaStatusColor(app.status)}`}>
                    {t(app.status)}
                  </span>
                </div>

                {/* Dynamic Visa Stepper Progress */}
                <div className="pt-4 pb-2">
                  <div className="flex items-center justify-between relative w-full mb-2">
                    {/* Horizontal track line */}
                    <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/10 -translate-y-1/2 -z-0" />
                    <div 
                      className={`absolute top-1/2 left-0 h-0.5 bg-gradient-to-r ${isRejected ? 'from-[#00C2FF] to-red-500' : 'from-[#00C2FF] to-green-500'} -translate-y-1/2 -z-0 transition-all duration-500`} 
                      style={{ width: `${(activeStepIndex / 3) * 100}%` }}
                    />

                    {steps.map((label, idx) => {
                      const isDone = idx < activeStepIndex;
                      const isActive = idx === activeStepIndex;
                      return (
                        <div key={idx} className="flex flex-col items-center z-10 relative">
                          <div 
                            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-300 ${
                              isDone 
                                ? "bg-[#00C2FF] border-[#00C2FF] text-black" 
                                : isActive 
                                  ? isRejected 
                                    ? "bg-red-500 border-red-500 text-white" 
                                    : "bg-white border-[#00C2FF] text-black ring-4 ring-[#00C2FF]/20"
                                  : "bg-[#0c192e] border-white/20 text-gray-400"
                            }`}
                          >
                            {idx + 1}
                          </div>
                          <span className={`text-[10px] font-bold mt-2 hidden sm:block ${
                            isActive 
                              ? isRejected ? "text-red-400" : "text-[#00C2FF]" 
                              : isDone ? "text-white/80" : "text-gray-500"
                          }`}>
                            {label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
