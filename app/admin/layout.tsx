"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

// Security: Define your master admin emails here. 
// Anyone in this list will always have admin access regardless of Firestore roles.
const SUPER_ADMIN_EMAILS = [
    "admin@eshaare.com",
    "info@eshaare.com",
    "adwaithdashpranavam@gmail.com"
];

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (!user) {
                setIsAdmin(false);
                setLoading(false);
            } else {
                // User is authenticated. Now we verify if they are actually an Admin.
                try {
                    // Check if email is in the hardcoded super admin list
                    const isSuperAdmin = user.email ? SUPER_ADMIN_EMAILS.includes(user.email.toLowerCase()) : false;
                    
                    let isFirestoreAdmin = false;
                    
                    // If not a super admin, check their role in the Firestore 'users' collection
                    if (!isSuperAdmin && user.email) {
                        // 1. Check using the standard Firebase Auth UID (Auto-ID)
                        const userDoc = await getDoc(doc(db, "users", user.uid));
                        if (userDoc.exists() && userDoc.data()?.role === "admin") {
                            isFirestoreAdmin = true;
                        } 
                        // 2. Check if they used their Email as the Document ID manually
                        else {
                            const emailDoc = await getDoc(doc(db, "users", user.email));
                            if (emailDoc.exists() && emailDoc.data()?.role === "admin") {
                                isFirestoreAdmin = true;
                            }
                            // 3. Check if there's any document that contains their email field
                            else {
                                const { collection, query, where, getDocs } = await import("firebase/firestore");
                                const q = query(collection(db, "users"), where("email", "==", user.email), where("role", "==", "admin"));
                                const querySnapshot = await getDocs(q);
                                if (!querySnapshot.empty) {
                                    // This means we found a document with their email and admin role!
                                    setIsAdmin(true);
                                    setLoading(false);
                                } else {
                                    // Still no admin found. Kick them out.
                                    console.warn(`Unauthorized access attempt by: ${user.email}`);
                                    setIsAdmin(false);
                                    setLoading(false);
                                    await signOut(auth);
                                    alert("Access Denied: You do not have administrator privileges.");
                                }
                                return; 
                            }
                        }
                    }

                    if (isSuperAdmin || isFirestoreAdmin) {
                        // User is verified admin
                        if (isSuperAdmin) {
                            try {
                                const userRef = doc(db, "users", user.uid);
                                await setDoc(userRef, {
                                    email: user.email?.toLowerCase(),
                                    role: "admin"
                                }, { merge: true });
                            } catch (err) {
                                console.error("Error auto-provisioning super admin Firestore role:", err);
                            }
                        }
                        setIsAdmin(true);
                        setLoading(false);
                    } else {
                        // User is authenticated but NOT an admin. Kick them out.
                        console.warn(`Unauthorized access attempt by: ${user.email}`);
                        setIsAdmin(false);
                        setLoading(false);
                        await signOut(auth);
                        alert("Access Denied: You do not have administrator privileges.");
                    }
                } catch (error) {
                    console.error("Error verifying admin role:", error);
                    setIsAdmin(false);
                    setLoading(false);
                    await signOut(auth);
                }
            }
        });

        return () => unsubscribe();
    }, []);

    // 2. Separate router controller that handles path changes based on cached states
    useEffect(() => {
        if (loading) return;

        if (isAdmin === false) {
            if (pathname !== "/admin/login") {
                router.push("/admin/login");
            }
        } else if (isAdmin === true) {
            if (pathname === "/admin/login") {
                router.push("/admin/dashboard");
            }
        }
    }, [pathname, isAdmin, loading, router]);

    const handleLogout = async () => {
        await signOut(auth);
        router.push("/admin/login");
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#071120] text-white">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#e68932] border-t-transparent"></div>
                    <p className="text-sm font-medium text-gray-400">Verifying security credentials...</p>
                </div>
            </div>
        );
    }

    if (pathname === "/admin/login") {
        return <>{children}</>;
    }

    return (
        <div className="flex min-h-screen bg-[#071120]">
            <aside className="w-72 bg-black p-6 text-white flex flex-col border-r border-white/5 shadow-2xl z-10">
                <div>
                    <h2 className="text-2xl font-bold">
                        <span className="text-[#e68932]">ESHAARE</span> ADMIN
                    </h2>
                    <p className="mt-2 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                        Tourism CRM Panel
                    </p>

                    <nav className="mt-10 space-y-2">
                        <Link
                            href="/admin/dashboard"
                            className={`block rounded-xl px-4 py-3 transition-colors ${pathname === '/admin/dashboard' ? 'bg-[#e68932]/10 text-[#e68932]' : 'hover:bg-white/5 text-gray-300 hover:text-white'}`}
                        >
                            Dashboard
                        </Link>
                        <Link
                            href="/admin/packages"
                            className={`block rounded-xl px-4 py-3 transition-colors ${pathname.includes('/admin/packages') ? 'bg-[#e68932]/10 text-[#e68932]' : 'hover:bg-white/5 text-gray-300 hover:text-white'}`}
                        >
                            Packages
                        </Link>
                        <Link
                            href="/admin/leads"
                            className={`block rounded-xl px-4 py-3 transition-colors ${pathname.includes('/admin/leads') ? 'bg-[#e68932]/10 text-[#e68932]' : 'hover:bg-white/5 text-gray-300 hover:text-white'}`}
                        >
                            Leads
                        </Link>
                        <Link
                            href="/admin/appointments"
                            className={`block rounded-xl px-4 py-3 transition-colors ${pathname.includes('/admin/appointments') ? 'bg-[#e68932]/10 text-[#e68932]' : 'hover:bg-white/5 text-gray-300 hover:text-white'}`}
                        >
                            Appointments
                        </Link>
                        <Link
                            href="/admin/visa-applications"
                            className={`block rounded-xl px-4 py-3 transition-colors ${pathname.includes('/admin/visa-applications') ? 'bg-[#e68932]/10 text-[#e68932]' : 'hover:bg-white/5 text-gray-300 hover:text-white'}`}
                        >
                            Visa Applications
                        </Link>
                        <Link
                            href="/admin/payments"
                            className={`block rounded-xl px-4 py-3 transition-colors ${pathname.includes('/admin/payments') ? 'bg-[#e68932]/10 text-[#e68932]' : 'hover:bg-white/5 text-gray-300 hover:text-white'}`}
                        >
                            Payments & Billing
                        </Link>
                        <Link
                            href="/admin/reports"
                            className={`block rounded-xl px-4 py-3 transition-colors ${pathname.includes('/admin/reports') ? 'bg-[#e68932]/10 text-[#e68932]' : 'hover:bg-white/5 text-gray-300 hover:text-white'}`}
                        >
                            Reports & Analytics
                        </Link>
                    </nav>
                </div>
                
                <div className="mt-auto pt-10">
                    <button 
                        onClick={handleLogout}
                        className="w-full rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-400 hover:bg-red-500 hover:text-white transition-all duration-300"
                    >
                        Sign Out
                    </button>
                </div>
            </aside>

            <main className="flex-1 p-8 bg-[#071120]">
                {children}
            </main>
        </div>
    );
}