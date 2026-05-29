"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  query, 
  where, 
  getDocs
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import Footer from "@/components/layout/Footer";
import { useTranslation } from "@/lib/TranslationContext";
import { 
  User, 
  Briefcase, 
  Heart, 
  FileText, 
  Hotel, 
  Settings, 
  Bell, 
  CreditCard, 
  MessageSquare, 
  LogOut, 
  Loader2, 
  Lock 
} from "lucide-react";

// Dynamically import heavy interactive tab panels to split JS bundles (Fix 8)
const BookingsTab = dynamic(() => import("./BookingsTab"), { 
  ssr: false, 
  loading: () => <div className="flex h-40 items-center justify-center"><Loader2 className="w-5 h-5 text-[#e68932] animate-spin" /></div>
});
const HotelsTab = dynamic(() => import("./HotelsTab"), { 
  ssr: false,
  loading: () => <div className="flex h-40 items-center justify-center"><Loader2 className="w-5 h-5 text-[#e68932] animate-spin" /></div>
});
const VisasTab = dynamic(() => import("./VisasTab"), { 
  ssr: false,
  loading: () => <div className="flex h-40 items-center justify-center"><Loader2 className="w-5 h-5 text-[#e68932] animate-spin" /></div>
});
const DocumentsTab = dynamic(() => import("./DocumentsTab"), { 
  ssr: false,
  loading: () => <div className="flex h-40 items-center justify-center"><Loader2 className="w-5 h-5 text-[#00C2FF] animate-spin" /></div>
});
const SavedTab = dynamic(() => import("./SavedTab"), { 
  ssr: false,
  loading: () => <div className="flex h-40 items-center justify-center"><Loader2 className="w-5 h-5 text-[#e68932] animate-spin" /></div>
});
const PaymentsTab = dynamic(() => import("./PaymentsTab"), { 
  ssr: false,
  loading: () => <div className="flex h-40 items-center justify-center"><Loader2 className="w-5 h-5 text-[#e68932] animate-spin" /></div>
});
const NotificationsTab = dynamic(() => import("./NotificationsTab"), { 
  ssr: false,
  loading: () => <div className="flex h-40 items-center justify-center"><Loader2 className="w-5 h-5 text-[#e68932] animate-spin" /></div>
});
const ProfileTab = dynamic(() => import("./ProfileTab"), { 
  ssr: false,
  loading: () => <div className="flex h-40 items-center justify-center"><Loader2 className="w-5 h-5 text-[#e68932] animate-spin" /></div>
});
const SupportTab = dynamic(() => import("./SupportTab"), { 
  ssr: false,
  loading: () => <div className="flex h-40 items-center justify-center"><Loader2 className="w-5 h-5 text-[#e68932] animate-spin" /></div>
});

export default function DashboardClient() {
  const router = useRouter();
  const { t, isRtl } = useTranslation();
  
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [profileData, setProfileData] = useState<any>(null);
  
  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<
    "bookings" | "saved" | "visas" | "hotels" | "profile" | "notifications" | "payments" | "support" | "documents"
  >("bookings");

  // Collections Data States
  const [bookings, setBookings] = useState<any[]>([]);
  const [visaApps, setVisaApps] = useState<any[]>([]);
  const [hotelBookings, setHotelBookings] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [docCount, setDocCount] = useState(0);
  
  // Notifications (Mocked)
  const [notifications] = useState<any[]>([
    { id: "1", title: "Welcome to Eshaare!", message: "Explore and book premium holiday packages around the world.", date: "Just now", read: false },
    { id: "2", title: "Visa Checklist Feature", message: "You can now upload your visa documents directly into the portal.", date: "1 day ago", read: true }
  ]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (userSession) => {
      if (!userSession) {
        router.push("/login");
      } else {
        setCurrentUser(userSession);
        await fetchUserProfileAndData(userSession);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const fetchUserProfileAndData = async (userSession: any) => {
    try {
      setLoading(true);
      
      // 1. Fetch User document first to get basic settings
      const userRef = doc(db, "users", userSession.uid);
      const userSnap = await getDoc(userRef);
      
      let fetchedProfile = null;
      if (userSnap.exists()) {
        fetchedProfile = userSnap.data();
        setProfileData(fetchedProfile);
      } else {
        fetchedProfile = {
          uid: userSession.uid,
          name: userSession.displayName || "",
          email: userSession.email,
          phone: "",
          role: "client",
          savedPackages: [],
          savedHotels: [],
          createdAt: new Date()
        };
        await setDoc(userRef, fetchedProfile);
        setProfileData(fetchedProfile);
      }

      // 2. Fetch all collections in PARALLEL to reduce latency (Fix 4)
      const [bookingsSnap, visaSnap, hotelsSnap, paymentsSnap, docsSnap] = await Promise.all([
        getDocs(query(collection(db, "bookings"), where("userId", "==", userSession.uid))),
        getDocs(query(collection(db, "visaApplications"), where("email", "==", userSession.email.toLowerCase().trim()))),
        getDocs(query(collection(db, "appointments"), where("phone", "==", fetchedProfile?.phone || userSession.email))),
        getDocs(query(collection(db, "payments"), where("userId", "==", userSession.uid))),
        getDocs(query(collection(db, "users", userSession.uid, "documents")))
      ]);

      setBookings(bookingsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setVisaApps(visaSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setPayments(paymentsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setDocCount(docsSnap.size);

      const apptsList = hotelsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setHotelBookings(apptsList.filter((appt: any) => appt.visaType === "Hotel Booking" || appt.serviceType === "Hotel Booking"));

    } catch (err) {
      console.error("Error loading dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    localStorage.removeItem("lastActive");
    router.push("/login");
  };

  const profileName = profileData?.name || currentUser?.displayName || "Guest";

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#071120] text-white">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-[#e68932] animate-spin" />
          <p className="text-sm font-medium text-gray-400">{t("Loading client dashboard...")}</p>
        </div>
      </div>
    );
  }

  return (
    <main className="bg-[#071120] text-white min-h-screen pt-28 pb-16">
      <div className="max-w-[95rem] mx-auto px-4 xl:px-6">
        
        {/* HEADER BAR */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/5 border border-white/10 rounded-[30px] p-6 mb-8 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-gradient-to-r from-[#e68932] to-amber-500 flex items-center justify-center font-bold text-2xl text-black">
              {profileName.substring(0, 2).toUpperCase()}
            </div>
            <div className="text-left rtl:text-right">
              <h1 className="text-2xl font-bold">{profileName}</h1>
              <p className="text-xs text-white/50">{currentUser?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition duration-300 font-semibold text-xs cursor-pointer"
          >
            <LogOut size={14} />
            {t("Sign Out")}
          </button>
        </div>

        {/* MAIN BODY LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* SIDEBAR TABS */}
          <aside className="lg:col-span-1 flex flex-col gap-1.5 bg-white/5 border border-white/10 rounded-[30px] p-4 h-fit backdrop-blur-md text-left rtl:text-right">
            <button
              onClick={() => setActiveTab("bookings")}
              className={`flex items-center gap-3 w-full px-4 py-3.5 rounded-xl text-sm font-bold transition cursor-pointer ${
                activeTab === "bookings" ? "bg-[#e68932] text-white" : "text-gray-300 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Briefcase size={18} />
              <span>{t("My Bookings")}</span>
              <span className="ml-auto bg-black/40 text-xs px-2 py-0.5 rounded-full text-white">
                {bookings.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("hotels")}
              className={`flex items-center gap-3 w-full px-4 py-3.5 rounded-xl text-sm font-bold transition cursor-pointer ${
                activeTab === "hotels" ? "bg-[#e68932] text-white" : "text-gray-300 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Hotel size={18} />
              <span>{t("Hotel Bookings")}</span>
              <span className="ml-auto bg-black/40 text-xs px-2 py-0.5 rounded-full text-white">
                {hotelBookings.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("visas")}
              className={`flex items-center gap-3 w-full px-4 py-3.5 rounded-xl text-sm font-bold transition cursor-pointer ${
                activeTab === "visas" ? "bg-[#e68932] text-white" : "text-gray-300 hover:bg-white/5 hover:text-white"
              }`}
            >
              <FileText size={18} />
              <span>{t("Visa Applications")}</span>
              <span className="ml-auto bg-black/40 text-xs px-2 py-0.5 rounded-full text-white">
                {visaApps.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("documents")}
              className={`flex items-center gap-3 w-full px-4 py-3.5 rounded-xl text-sm font-bold transition cursor-pointer ${
                activeTab === "documents" ? "bg-[#e68932] text-white" : "text-gray-300 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Lock size={18} className="text-[#00C2FF]" />
              <span>{t("Travel Documents")}</span>
              <span className="ml-auto bg-black/40 text-xs px-2 py-0.5 rounded-full text-white">
                {docCount}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("saved")}
              className={`flex items-center gap-3 w-full px-4 py-3.5 rounded-xl text-sm font-bold transition cursor-pointer ${
                activeTab === "saved" ? "bg-[#e68932] text-white" : "text-gray-300 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Heart size={18} />
              <span>{t("Saved / Wishlist")}</span>
              <span className="ml-auto bg-black/40 text-xs px-2 py-0.5 rounded-full text-white">
                {profileData?.savedPackages?.length || 0}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("payments")}
              className={`flex items-center gap-3 w-full px-4 py-3.5 rounded-xl text-sm font-bold transition cursor-pointer ${
                activeTab === "payments" ? "bg-[#e68932] text-white" : "text-gray-300 hover:bg-white/5 hover:text-white"
              }`}
            >
              <CreditCard size={18} />
              <span>{t("Payment History")}</span>
              <span className="ml-auto bg-black/40 text-xs px-2 py-0.5 rounded-full text-white">
                {payments.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("notifications")}
              className={`flex items-center gap-3 w-full px-4 py-3.5 rounded-xl text-sm font-bold transition cursor-pointer ${
                activeTab === "notifications" ? "bg-[#e68932] text-white" : "text-gray-300 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Bell size={18} />
              <span>{t("Notifications")}</span>
              <span className="ml-auto bg-black/40 text-xs px-2 py-0.5 rounded-full text-white">
                {notifications.filter(n => !n.read).length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("profile")}
              className={`flex items-center gap-3 w-full px-4 py-3.5 rounded-xl text-sm font-bold transition cursor-pointer ${
                activeTab === "profile" ? "bg-[#e68932] text-white" : "text-gray-300 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Settings size={18} />
              <span>{t("Profile Settings")}</span>
            </button>

            <button
              onClick={() => setActiveTab("support")}
              className={`flex items-center gap-3 w-full px-4 py-3.5 rounded-xl text-sm font-bold transition cursor-pointer ${
                activeTab === "support" ? "bg-[#e68932] text-white" : "text-gray-300 hover:bg-white/5 hover:text-white"
              }`}
            >
              <MessageSquare size={18} />
              <span>{t("Support & Contact")}</span>
            </button>
          </aside>

          {/* MAIN TAB CONTENT DISPLAY - Tabs lazy-load only when active (Fix 3) */}
          <section className="lg:col-span-3 bg-white/5 border border-white/10 rounded-[30px] p-8 min-h-[500px] backdrop-blur-md">
            {activeTab === "bookings" && <BookingsTab bookings={bookings} t={t} />}
            
            {activeTab === "hotels" && <HotelsTab hotelBookings={hotelBookings} t={t} />}
            
            {activeTab === "visas" && <VisasTab visaApps={visaApps} t={t} />}
            
            {activeTab === "documents" && (
              <DocumentsTab 
                currentUser={currentUser} 
                t={t} 
              />
            )}
            
            {activeTab === "saved" && (
              <SavedTab 
                savedPackageIds={profileData?.savedPackages || []} 
                t={t} 
              />
            )}
            
            {activeTab === "payments" && <PaymentsTab payments={payments} t={t} />}
            
            {activeTab === "notifications" && <NotificationsTab notifications={notifications} t={t} />}
            
            {activeTab === "profile" && (
              <ProfileTab 
                currentUser={currentUser} 
                profileData={profileData} 
                onProfileUpdated={(updated) => setProfileData((prev: any) => ({ ...prev, ...updated }))} 
                t={t} 
              />
            )}
            
            {activeTab === "support" && (
              <SupportTab 
                currentUser={currentUser} 
                profileName={profileName} 
                profilePhone={profileData?.phone || ""} 
                t={t} 
              />
            )}
          </section>
        </div>

      </div>
      <Footer />
    </main>
  );
}
