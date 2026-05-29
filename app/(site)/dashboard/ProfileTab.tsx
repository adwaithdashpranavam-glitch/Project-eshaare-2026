"use client";
import { useState } from "react";
import { updateProfile, updatePassword } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { Settings, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

interface ProfileTabProps {
  currentUser: any;
  profileData: any;
  onProfileUpdated: (newData: any) => void;
  t: any;
}

export default function ProfileTab({ currentUser, profileData, onProfileUpdated, t }: ProfileTabProps) {
  const [name, setName] = useState(profileData?.name || currentUser?.displayName || "");
  const [phone, setPhone] = useState(profileData?.phone || "");
  const [newPass, setNewPass] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");
  const [profileError, setProfileError] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      setProfileError(t("Name cannot be empty."));
      return;
    }

    try {
      setProfileLoading(true);
      setProfileError("");
      setProfileSuccess("");

      if (auth.currentUser) {
        await updateProfile(auth.currentUser, {
          displayName: name
        });

        const userRef = doc(db, "users", auth.currentUser.uid);
        await updateDoc(userRef, {
          name,
          phone
        });

        if (newPass) {
          if (newPass.length < 6) {
            setProfileError(t("Password must be at least 6 characters long."));
            setProfileLoading(false);
            return;
          }
          await updatePassword(auth.currentUser, newPass);
          setNewPass("");
        }

        setProfileSuccess(t("Profile updated successfully!"));
        onProfileUpdated({ name, phone });
      }
    } catch (err: any) {
      console.error("Profile update failed:", err);
      setProfileError(err.message || t("Failed to update profile details."));
    } finally {
      setProfileLoading(false);
    }
  };

  return (
    <div className="text-left rtl:text-right">
      <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
        <Settings className="text-[#e68932]" />
        {t("Profile Settings")}
      </h2>

      {profileSuccess && (
        <div className="mb-6 p-4 rounded-xl border border-green-500/20 bg-green-500/10 text-green-400 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" />
          <span>{profileSuccess}</span>
        </div>
      )}

      {profileError && (
        <div className="mb-6 p-4 rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          <span>{profileError}</span>
        </div>
      )}

      <form onSubmit={handleProfileUpdate} className="space-y-4 max-w-lg">
        <div className="space-y-1">
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400">{t("Full Name")}</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full h-12 rounded-xl bg-black/40 border border-white/10 px-4 text-white outline-none focus:border-[#e68932] text-sm"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400">Email Address (Read-only)</label>
          <input
            type="email"
            value={currentUser?.email || ""}
            disabled
            className="w-full h-12 rounded-xl bg-black/60 border border-white/5 px-4 text-gray-400 outline-none text-sm cursor-not-allowed"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400">{t("Phone Number *")}</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+971 50 123 4567"
            className="w-full h-12 rounded-xl bg-black/40 border border-white/10 px-4 text-white outline-none focus:border-[#e68932] text-sm"
          />
        </div>

        <div className="space-y-1 pt-4 border-t border-white/5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400">Change Password (Optional)</label>
          <input
            type="password"
            placeholder="Enter new password to modify"
            value={newPass}
            onChange={(e) => setNewPass(e.target.value)}
            className="w-full h-12 rounded-xl bg-black/40 border border-white/10 px-4 text-white outline-none focus:border-[#e68932] text-sm"
          />
        </div>

        <button
          type="submit"
          disabled={profileLoading}
          className="h-12 bg-[#e68932] hover:bg-[#cf7726] text-white px-6 rounded-xl font-bold text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-50"
        >
          {profileLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save Profile Details"}
        </button>
      </form>
    </div>
  );
}
