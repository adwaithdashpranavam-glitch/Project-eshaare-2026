"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { onAuthStateChanged, signOut, updateProfile, updatePassword } from "firebase/auth";
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  serverTimestamp,
  arrayUnion,
  arrayRemove
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import Footer from "@/components/layout/Footer";
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
  CheckCircle2, 
  AlertCircle,
  Calendar,
  DollarSign,
  ChevronRight
} from "lucide-react";
import Image from "next/image";

export default function ClientDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [profileData, setProfileData] = useState<any>(null);
  
  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<
    "bookings" | "saved" | "visas" | "hotels" | "profile" | "notifications" | "payments" | "support"
  >("bookings");

  // Collections Data States
  const [bookings, setBookings] = useState<any[]>([]);
  const [savedPackages, setSavedPackages] = useState<any[]>([]);
  const [visaApps, setVisaApps] = useState<any[]>([]);
  const [hotelBookings, setHotelBookings] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  
  // Profile Form States
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [newPass, setNewPass] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");
  const [profileError, setProfileError] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);

  // Support Form States
  const [supportSubject, setSupportSubject] = useState("");
  const [supportMessage, setSupportMessage] = useState("");
  const [supportSuccess, setSupportSuccess] = useState("");
  const [supportError, setSupportError] = useState("");
  const [supportLoading, setSupportLoading] = useState(false);

  // Notifications (Mocked or queried)
  const [notifications, setNotifications] = useState<any[]>([
    { id: "1", title: "Welcome to Eshaare!", message: "Explore and book premium holiday packages around the world.", date: "Just now", read: false },
    { id: "2", title: "Visa Checklist Feature", message: "You can now upload your visa documents directly into the portal.", date: "1 day ago", read: true }
  ]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        // Not logged in -> Redirect to login page
        router.push("/login");
      } else {
        setUser(currentUser);
        await fetchUserProfileAndData(currentUser);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const fetchUserProfileAndData = async (currentUser: any) => {
    try {
      setLoading(true);
      
      // 1. Fetch User document from Firestore
      const userRef = doc(db, "users", currentUser.uid);
      const userSnap = await getDoc(userRef);
      
      let fetchedProfile = null;
      if (userSnap.exists()) {
        fetchedProfile = userSnap.data();
        setProfileData(fetchedProfile);
        setName(fetchedProfile.name || currentUser.displayName || "");
        setPhone(fetchedProfile.phone || "");
      } else {
        // Fallback or create profile doc
        const newProfile = {
          uid: currentUser.uid,
          name: currentUser.displayName || "",
          email: currentUser.email,
          phone: "",
          role: "client",
          savedPackages: [],
          savedHotels: [],
          createdAt: new Date()
        };
        await setDoc(userRef, newProfile);
        setProfileData(newProfile);
        setName(newProfile.name);
      }

      // 2. Fetch Client Bookings
      const bookingsQuery = query(
        collection(db, "bookings"),
        where("userId", "==", currentUser.uid)
      );
      const bookingsSnap = await getDocs(bookingsQuery);
      const bookingsList = bookingsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setBookings(bookingsList);

      // 3. Fetch Visa Applications
      const visaQuery = query(
        collection(db, "visaApplications"),
        where("email", "==", currentUser.email.toLowerCase().trim())
      );
      const visaSnap = await getDocs(visaQuery);
      const visaList = visaSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setVisaApps(visaList);

      // 4. Fetch Hotel Bookings from appointments collection
      // Look for hotel bookings registered under client's phone or name or explicitly userId
      const hotelsQuery = query(
        collection(db, "appointments"),
        where("phone", "==", fetchedProfile?.phone || currentUser.email)
      );
      const hotelsSnap = await getDocs(hotelsQuery);
      const hotelsList = hotelsSnap.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter((appt: any) => appt.visaType === "Hotel Booking" || appt.serviceType === "Hotel Booking");
      setHotelBookings(hotelsList);

      // 5. Fetch Client Payments
      const paymentsQuery = query(
        collection(db, "payments"),
        where("userId", "==", currentUser.uid)
      );
      const paymentsSnap = await getDocs(paymentsQuery);
      const paymentsList = paymentsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPayments(paymentsList);

      // 6. Fetch Saved Packages details
      const savedPackageIds = fetchedProfile?.savedPackages || [];
      if (savedPackageIds.length > 0) {
        const pkgList: any[] = [];
        for (const slug of savedPackageIds) {
          const pkgSnap = await getDoc(doc(db, "packages", slug));
          if (pkgSnap.exists()) {
            pkgList.push({ id: pkgSnap.id, ...pkgSnap.data() });
          }
        }
        setSavedPackages(pkgList);
      }

    } catch (err) {
      console.error("Error loading dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      setProfileError("Name cannot be empty.");
      return;
    }

    try {
      setProfileLoading(true);
      setProfileError("");
      setProfileSuccess("");

      // Update Auth displayName
      await updateProfile(auth.currentUser!, {
        displayName: name
      });

      // Update Firestore user document
      const userRef = doc(db, "users", auth.currentUser!.uid);
      await updateDoc(userRef, {
        name,
        phone
      });

      // Update password if entered
      if (newPass) {
        if (newPass.length < 6) {
          setProfileError("Password must be at least 6 characters long.");
          setProfileLoading(false);
          return;
        }
        await updatePassword(auth.currentUser!, newPass);
        setNewPass("");
      }

      setProfileSuccess("Profile updated successfully!");
      // Refresh local user data
      setProfileData((prev: any) => ({ ...prev, name, phone }));

    } catch (err: any) {
      console.error(err);
      setProfileError(err.message || "Failed to update profile details.");
    } finally {
      setProfileLoading(false);
    }
  };

  const handleSupportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportSubject || !supportMessage) {
      setSupportError("Please enter subject and message.");
      return;
    }

    try {
      setSupportLoading(true);
      setSupportError("");
      setSupportSuccess("");

      // Write to leads or support collection
      await addDoc(collection(db, "leads"), {
        userId: user.uid,
        name: name,
        email: user.email,
        phone: phone,
        status: "New",
        source: "Client Portal Support Form",
        notes: `[Support Ticket - Subject: ${supportSubject}] ${supportMessage}`,
        createdAt: serverTimestamp()
      });

      // Also register as activity log
      await addDoc(collection(db, "userActivity"), {
        userId: user.uid,
        activityType: "support_inquiry",
        details: `Submitted support request: ${supportSubject}`,
        createdAt: serverTimestamp()
      });

      setSupportSuccess("Your message has been sent to our customer care team!");
      setSupportSubject("");
      setSupportMessage("");

    } catch (err: any) {
      console.error(err);
      setSupportError("Failed to submit ticket. Please try again.");
    } finally {
      setSupportLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    localStorage.removeItem("lastActive");
    router.push("/login");
  };

  const getVisaStatusColor = (status: string) => {
    switch (status) {
      case "approved": return "bg-green-500/20 text-green-400 border border-green-500/10";
      case "processing": return "bg-blue-500/20 text-blue-400 border border-blue-500/10";
      case "rejected": return "bg-red-500/20 text-red-400 border border-red-500/10";
      default: return "bg-yellow-500/20 text-yellow-400 border border-yellow-500/10";
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#071120] text-white">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-[#e68932] animate-spin" />
          <p className="text-sm font-medium text-gray-400">Loading client dashboard...</p>
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
              {name.substring(0, 2).toUpperCase() || "CL"}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{name}</h1>
              <p className="text-xs text-white/50">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition duration-300 font-semibold text-xs"
          >
            <LogOut size={14} />
            Sign Out
          </button>
        </div>

        {/* MAIN BODY LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* SIDEBAR TABS */}
          <aside className="lg:col-span-1 flex flex-col gap-1.5 bg-white/5 border border-white/10 rounded-[30px] p-4 h-fit backdrop-blur-md">
            <button
              onClick={() => setActiveTab("bookings")}
              className={`flex items-center gap-3 w-full px-4 py-3.5 rounded-xl text-sm font-bold transition ${
                activeTab === "bookings" ? "bg-[#e68932] text-white" : "text-gray-300 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Briefcase size={18} />
              <span>My Bookings</span>
              <span className="ml-auto bg-black/40 text-xs px-2 py-0.5 rounded-full text-white">
                {bookings.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("hotels")}
              className={`flex items-center gap-3 w-full px-4 py-3.5 rounded-xl text-sm font-bold transition ${
                activeTab === "hotels" ? "bg-[#e68932] text-white" : "text-gray-300 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Hotel size={18} />
              <span>Hotel Bookings</span>
              <span className="ml-auto bg-black/40 text-xs px-2 py-0.5 rounded-full text-white">
                {hotelBookings.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("visas")}
              className={`flex items-center gap-3 w-full px-4 py-3.5 rounded-xl text-sm font-bold transition ${
                activeTab === "visas" ? "bg-[#e68932] text-white" : "text-gray-300 hover:bg-white/5 hover:text-white"
              }`}
            >
              <FileText size={18} />
              <span>Visa Applications</span>
              <span className="ml-auto bg-black/40 text-xs px-2 py-0.5 rounded-full text-white">
                {visaApps.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("saved")}
              className={`flex items-center gap-3 w-full px-4 py-3.5 rounded-xl text-sm font-bold transition ${
                activeTab === "saved" ? "bg-[#e68932] text-white" : "text-gray-300 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Heart size={18} />
              <span>Saved / Wishlist</span>
              <span className="ml-auto bg-black/40 text-xs px-2 py-0.5 rounded-full text-white">
                {savedPackages.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("payments")}
              className={`flex items-center gap-3 w-full px-4 py-3.5 rounded-xl text-sm font-bold transition ${
                activeTab === "payments" ? "bg-[#e68932] text-white" : "text-gray-300 hover:bg-white/5 hover:text-white"
              }`}
            >
              <CreditCard size={18} />
              <span>Payment History</span>
              <span className="ml-auto bg-black/40 text-xs px-2 py-0.5 rounded-full text-white">
                {payments.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("notifications")}
              className={`flex items-center gap-3 w-full px-4 py-3.5 rounded-xl text-sm font-bold transition ${
                activeTab === "notifications" ? "bg-[#e68932] text-white" : "text-gray-300 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Bell size={18} />
              <span>Notifications</span>
              <span className="ml-auto bg-black/40 text-xs px-2 py-0.5 rounded-full text-white">
                {notifications.filter(n => !n.read).length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("profile")}
              className={`flex items-center gap-3 w-full px-4 py-3.5 rounded-xl text-sm font-bold transition ${
                activeTab === "profile" ? "bg-[#e68932] text-white" : "text-gray-300 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Settings size={18} />
              <span>Profile Settings</span>
            </button>

            <button
              onClick={() => setActiveTab("support")}
              className={`flex items-center gap-3 w-full px-4 py-3.5 rounded-xl text-sm font-bold transition ${
                activeTab === "support" ? "bg-[#e68932] text-white" : "text-gray-300 hover:bg-white/5 hover:text-white"
              }`}
            >
              <MessageSquare size={18} />
              <span>Support & Contact</span>
            </button>
          </aside>

          {/* MAIN TAB CONTENT DISPLAY */}
          <section className="lg:col-span-3 bg-white/5 border border-white/10 rounded-[30px] p-8 min-h-[500px] backdrop-blur-md">
            
            {/* BOOKINGS TAB */}
            {activeTab === "bookings" && (
              <div>
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <Briefcase className="text-[#e68932]" />
                  Holiday Package Bookings
                </h2>
                
                {bookings.length === 0 ? (
                  <div className="text-center py-20 border border-white/5 rounded-2xl bg-white/5">
                    <Briefcase className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-400 font-semibold">You have no active tour bookings.</p>
                    <Link href="/packages" className="mt-4 inline-block bg-[#e68932] text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-[#cf7726] transition">
                      Explore Packages
                    </Link>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {bookings.map((booking) => (
                      <div key={booking.id} className="p-5 rounded-2xl border border-white/10 bg-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                          <h3 className="text-lg font-bold text-white">{booking.itemName || "Tourism Package Stay"}</h3>
                          <p className="text-xs text-gray-400 mt-1">Booked on: {booking.createdAt?.toDate ? booking.createdAt.toDate().toLocaleDateString() : new Date().toLocaleDateString()}</p>
                          <div className="flex gap-4 mt-2">
                            <span className="text-xs text-gray-300">Guests: {booking.guests || 2} Adults</span>
                            <span className="text-xs text-[#e68932] font-semibold">AED {booking.price || "Contact for Price"}</span>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                          booking.status === "confirmed" ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"
                        }`}>
                          {booking.status || "pending"}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* HOTEL BOOKINGS TAB */}
            {activeTab === "hotels" && (
              <div>
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <Hotel className="text-[#e68932]" />
                  Hotel Stay Inquiries & Bookings
                </h2>

                {hotelBookings.length === 0 ? (
                  <div className="text-center py-20 border border-white/5 rounded-2xl bg-white/5">
                    <Hotel className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-400 font-semibold">You have no active hotel bookings.</p>
                    <Link href="/hotels" className="mt-4 inline-block bg-[#e68932] text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-[#cf7726] transition">
                      View Luxury Hotels
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
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase bg-yellow-500/20 text-yellow-400`}>
                          {hotel.status || "pending"}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* VISA APPLICATIONS TAB */}
            {activeTab === "visas" && (
              <div>
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <FileText className="text-[#e68932]" />
                  Visa Application Processes
                </h2>

                {visaApps.length === 0 ? (
                  <div className="text-center py-20 border border-white/5 rounded-2xl bg-white/5">
                    <FileText className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-400 font-semibold">No active visa applications found for your profile.</p>
                    <Link href="/visa" className="mt-4 inline-block bg-[#e68932] text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-[#cf7726] transition">
                      Apply For Visa
                    </Link>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {visaApps.map((app) => (
                      <div key={app.id} className="p-5 rounded-2xl border border-white/10 bg-white/5 space-y-4">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                          <div>
                            <h3 className="text-lg font-bold text-white">Applicant: {app.applicantName}</h3>
                            <p className="text-xs text-gray-400">Destination: <span className="font-semibold text-white">{app.destination}</span> | Passport: {app.passportNumber}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${getVisaStatusColor(app.status)}`}>
                            {app.status}
                          </span>
                        </div>

                        {/* Checklist progress bar */}
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-xs text-gray-400 font-medium">
                            <span>Document Checklist Verification</span>
                            <span>{app.checklistProgress || 40}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-[#00C2FF]" style={{ width: `${app.checklistProgress || 40}%` }} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* SAVED & WISHLIST TAB */}
            {activeTab === "saved" && (
              <div>
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <Heart className="text-[#e68932]" />
                  Your Wishlist & Saved Packages
                </h2>

                {savedPackages.length === 0 ? (
                  <div className="text-center py-20 border border-white/5 rounded-2xl bg-white/5">
                    <Heart className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-400 font-semibold">Your wishlist is empty.</p>
                  </div>
                ) : (
                  <div className="grid gap-6 md:grid-cols-2">
                    {savedPackages.map((pkg) => (
                      <div key={pkg.id} className="group rounded-2xl border border-white/10 bg-white/5 overflow-hidden transition-all duration-300 hover:border-[#e68932]/45">
                        <div className="relative h-44 w-full">
                          <Image
                            src={pkg.image}
                            alt={pkg.title}
                            fill
                            sizes="(max-width: 768px) 100vw, 50vw"
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                          <span className="absolute top-4 left-4 rounded-full bg-[#00C2FF] px-2.5 py-1 text-[10px] font-semibold text-black">
                            {pkg.duration}
                          </span>
                        </div>
                        <div className="p-4">
                          <h3 className="text-base font-bold text-white group-hover:text-[#e68932] transition truncate">
                            {pkg.title}
                          </h3>
                          <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
                            <span className="text-sm font-semibold text-white">{pkg.price}</span>
                            <Link href={`/packages/${pkg.slug}`} className="text-xs text-[#00C2FF] font-bold flex items-center gap-0.5 hover:underline">
                              View Package <ChevronRight size={12} />
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* PAYMENT HISTORY TAB */}
            {activeTab === "payments" && (
              <div>
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <CreditCard className="text-[#e68932]" />
                  Billing & Payment Transactions
                </h2>

                {payments.length === 0 ? (
                  <div className="text-center py-20 border border-white/5 rounded-2xl bg-white/5">
                    <CreditCard className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-400 font-semibold">No recent billing records found.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-white/10 bg-black/40">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-white/10 text-xs font-semibold uppercase tracking-wider text-gray-400 bg-white/5">
                          <th className="px-5 py-3">Billing Item</th>
                          <th className="px-5 py-3">Transaction ID</th>
                          <th className="px-5 py-3">Paid Amount</th>
                          <th className="px-5 py-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-sm">
                        {payments.map((p) => (
                          <tr key={p.id}>
                            <td className="px-5 py-3.5 font-medium text-white">{p.itemName || "Visa / Stay Package"}</td>
                            <td className="px-5 py-3.5 font-mono text-xs text-gray-400">{p.id}</td>
                            <td className="px-5 py-3.5 text-green-400 font-semibold">AED {p.amount}</td>
                            <td className="px-5 py-3.5">
                              <span className="text-xs px-2.5 py-0.5 rounded bg-green-500/20 text-green-400 font-bold border border-green-500/10">
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
            )}

            {/* NOTIFICATIONS TAB */}
            {activeTab === "notifications" && (
              <div>
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <Bell className="text-[#e68932]" />
                  Your Notifications
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
            )}

            {/* PROFILE SETTINGS TAB */}
            {activeTab === "profile" && (
              <div>
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <Settings className="text-[#e68932]" />
                  Modify Profile Settings
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
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400">Full Name</label>
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
                      value={user?.email || ""}
                      disabled
                      className="w-full h-12 rounded-xl bg-black/60 border border-white/5 px-4 text-gray-400 outline-none text-sm cursor-not-allowed"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400">Phone Number</label>
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
            )}

            {/* SUPPORT & CONTACT TAB */}
            {activeTab === "support" && (
              <div>
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <MessageSquare className="text-[#e68932]" />
                  Customer Support Center
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
            )}

          </section>
        </div>

      </div>
      <Footer />
    </main>
  );
}
