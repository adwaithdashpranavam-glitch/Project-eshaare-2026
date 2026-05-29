"use client";
import { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { MessageSquare, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

interface SupportTabProps {
  currentUser: any;
  profileName: string;
  profilePhone: string;
  t: any;
}

export default function SupportTab({ currentUser, profileName, profilePhone, t }: SupportTabProps) {
  const [supportSubject, setSupportSubject] = useState("");
  const [supportMessage, setSupportMessage] = useState("");
  const [supportSuccess, setSupportSuccess] = useState("");
  const [supportError, setSupportError] = useState("");
  const [supportLoading, setSupportLoading] = useState(false);

  const handleSupportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportSubject || !supportMessage) {
      setSupportError(t("Please enter subject and message."));
      return;
    }

    try {
      setSupportLoading(true);
      setSupportError("");
      setSupportSuccess("");

      await addDoc(collection(db, "leads"), {
        userId: currentUser.uid,
        name: profileName,
        email: currentUser.email,
        phone: profilePhone,
        status: "New",
        source: "Client Portal Support Form",
        notes: `[Support Ticket - Subject: ${supportSubject}] ${supportMessage}`,
        createdAt: serverTimestamp()
      });

      await addDoc(collection(db, "userActivity"), {
        userId: currentUser.uid,
        activityType: "support_inquiry",
        details: `Submitted support request: ${supportSubject}`,
        createdAt: serverTimestamp()
      });

      setSupportSuccess(t("Your message has been sent to our customer care team!"));
      setSupportSubject("");
      setSupportMessage("");

    } catch (err: any) {
      console.error("Support submission failed:", err);
      setSupportError(t("Failed to submit ticket. Please try again."));
    } finally {
      setSupportLoading(false);
    }
  };

  return (
    <div className="text-left rtl:text-right">
      <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
        <MessageSquare className="text-[#e68932]" />
        {t("Support & Contact")}
      </h2>

      {supportSuccess && (
        <div className="mb-6 p-4 rounded-xl border border-green-500/20 bg-green-500/10 text-green-400 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" />
          <span>{supportSuccess}</span>
        </div>
      )}

      {supportError && (
        <div className="mb-6 p-4 rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          <span>{supportError}</span>
        </div>
      )}

      <form onSubmit={handleSupportSubmit} className="space-y-4 max-w-lg">
        <div className="space-y-1">
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400">Inquiry Subject</label>
          <input
            type="text"
            placeholder="e.g. Flight upgrade, visa document error"
            value={supportSubject}
            onChange={(e) => setSupportSubject(e.target.value)}
            required
            className="w-full h-12 rounded-xl bg-black/40 border border-white/10 px-4 text-white outline-none focus:border-[#e68932] text-sm"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400">Message Description</label>
          <textarea
            placeholder="Explain your request in detail..."
            rows={5}
            value={supportMessage}
            onChange={(e) => setSupportMessage(e.target.value)}
            required
            className="w-full rounded-xl bg-black/40 border border-white/10 p-4 text-white outline-none focus:border-[#e68932] text-sm"
          />
        </div>

        <button
          type="submit"
          disabled={supportLoading}
          className="h-12 bg-[#e68932] hover:bg-[#cf7726] text-white px-6 rounded-xl font-bold text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-50"
        >
          {supportLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Submit Support Request"}
        </button>
      </form>
    </div>
  );
}
