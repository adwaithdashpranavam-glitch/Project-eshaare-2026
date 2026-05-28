"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { db } from "@/lib/firebase";
import { collection, query, where, getCountFromServer } from "firebase/firestore";

export default function AdminDashboardPage() {
    const [stats, setStats] = useState({
        totalPackages: 0,
        activePackages: 0,
        featuredPackages: 0,
        totalLeads: 0,
        newLeads: 0,
        totalAppointments: 0,
        totalVisas: 0,
        totalClients: 0,
        totalBookings: 0,
        activeOffers: 0,
        totalHotels: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            let totalPkgs = 0;
            let activePkgs = 0;
            let featuredPkgs = 0;
            let totalLeadsCount = 0;
            let newLeadsCount = 0;
            let totalAppts = 0;
            let totalVisasCount = 0;
            let totalClientsCount = 0;
            let totalBookingsCount = 0;
            let activeOffersCount = 0;
            let totalHotelsCount = 0;

            try {
                // Parallelize all count requests for maximum speed
                const [
                    totalPkgsSnap,
                    activePkgsSnap,
                    featuredPkgsSnap,
                    totalLeadsSnap,
                    newLeadsSnap,
                    totalApptsSnap,
                    totalVisasSnap,
                    totalClientsSnap,
                    totalBookingsSnap,
                    activeOffersSnap,
                    totalHotelsSnap
                ] = await Promise.all([
                    getCountFromServer(collection(db, "packages")),
                    getCountFromServer(query(collection(db, "packages"), where("active", "==", true))),
                    getCountFromServer(query(collection(db, "packages"), where("featured", "==", true))),
                    getCountFromServer(collection(db, "leads")),
                    getCountFromServer(query(collection(db, "leads"), where("status", "in", ["New", "new"]))),
                    getCountFromServer(collection(db, "appointments")),
                    getCountFromServer(collection(db, "visaApplications")),
                    getCountFromServer(query(collection(db, "users"), where("role", "==", "client"))),
                    getCountFromServer(collection(db, "bookings")),
                    getCountFromServer(query(collection(db, "offers"), where("active", "==", true))),
                    getCountFromServer(collection(db, "hotels"))
                ]);

                totalPkgs = totalPkgsSnap.data().count;
                activePkgs = activePkgsSnap.data().count;
                featuredPkgs = featuredPkgsSnap.data().count;
                totalLeadsCount = totalLeadsSnap.data().count;
                newLeadsCount = newLeadsSnap.data().count;
                totalAppts = totalApptsSnap.data().count;
                totalVisasCount = totalVisasSnap.data().count;
                totalClientsCount = totalClientsSnap.data().count;
                totalBookingsCount = totalBookingsSnap.data().count;
                activeOffersCount = activeOffersSnap.data().count;
                totalHotelsCount = totalHotelsSnap.data().count;

            } catch (error) {
                console.error("Error fetching dashboard counts:", error);
            }

            setStats({
                totalPackages: totalPkgs,
                activePackages: activePkgs,
                featuredPackages: featuredPkgs,
                totalLeads: totalLeadsCount,
                newLeads: newLeadsCount,
                totalAppointments: totalAppts,
                totalVisas: totalVisasCount,
                totalClients: totalClientsCount,
                totalBookings: totalBookingsCount,
                activeOffers: activeOffersCount,
                totalHotels: totalHotelsCount
            });
            setLoading(false);
        };

        fetchAnalytics();
    }, []);

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-white">
                    Admin Dashboard
                </h1>
                <p className="mt-2 text-gray-400">
                    Overview of packages, leads, bookings, and business activity.
                </p>
            </div>

            {loading ? (
                <div className="mt-12 text-white text-xl flex items-center gap-3">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#e68932] border-t-transparent"></div>
                    <span>Loading Analytics...</span>
                </div>
            ) : (
                <>
                    {/* STATS GRID */}
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        <div className="rounded-3xl bg-white/5 p-6 border border-white/10">
                          <p className="text-gray-400 text-sm font-semibold uppercase tracking-wider">Packages</p>
                          <h2 className="mt-3 text-4xl font-bold text-white">{stats.totalPackages}</h2>
                          <p className="mt-2 text-xs text-green-400 font-medium">{stats.activePackages} Active • {stats.featuredPackages} Featured</p>
                        </div>

                        <div className="rounded-3xl bg-white/5 p-6 border border-white/10">
                          <p className="text-gray-400 text-sm font-semibold uppercase tracking-wider">Leads</p>
                          <h2 className="mt-3 text-4xl font-bold text-orange-400">{stats.totalLeads}</h2>
                          <p className="mt-2 text-xs text-red-400 font-medium">{stats.newLeads} New Inbox</p>
                        </div>

                        <div className="rounded-3xl bg-white/5 p-6 border border-white/10">
                          <p className="text-gray-400 text-sm font-semibold uppercase tracking-wider">Visas & Appts</p>
                          <h2 className="mt-3 text-4xl font-bold text-[#e68932]">{stats.totalVisas}</h2>
                          <p className="mt-2 text-xs text-blue-400 font-medium">{stats.totalAppointments} Consultation Bookings</p>
                        </div>

                        <div className="rounded-3xl bg-white/5 p-6 border border-white/10">
                          <p className="text-gray-400 text-sm font-semibold uppercase tracking-wider">Registered Clients</p>
                          <h2 className="mt-3 text-4xl font-bold text-purple-400">{stats.totalClients}</h2>
                          <p className="mt-2 text-xs text-purple-300 font-medium">Active client accounts</p>
                        </div>

                        <div className="rounded-3xl bg-white/5 p-6 border border-white/10">
                          <p className="text-gray-400 text-sm font-semibold uppercase tracking-wider">Client Bookings</p>
                          <h2 className="mt-3 text-4xl font-bold text-green-400">{stats.totalBookings}</h2>
                          <p className="mt-2 text-xs text-gray-400 font-medium">Packages purchased</p>
                        </div>

                        <div className="rounded-3xl bg-white/5 p-6 border border-white/10">
                          <p className="text-gray-400 text-sm font-semibold uppercase tracking-wider">Hotels</p>
                          <h2 className="mt-3 text-4xl font-bold text-blue-400">{stats.totalHotels}</h2>
                          <p className="mt-2 text-xs text-blue-300 font-medium">Stays registered</p>
                        </div>

                        <div className="rounded-3xl bg-white/5 p-6 border border-white/10">
                          <p className="text-gray-400 text-sm font-semibold uppercase tracking-wider">Active Promo Offers</p>
                          <h2 className="mt-3 text-4xl font-bold text-yellow-400">{stats.activeOffers}</h2>
                          <p className="mt-2 text-xs text-yellow-300 font-medium">Showcased on homepage</p>
                        </div>
                    </div>

                    {/* QUICK ACTIONS SECTION */}
                    <div className="mt-10">
                        <h3 className="text-lg font-bold text-white mb-4">Quick Operations Management</h3>
                        <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-4">
                            <Link
                                href="/admin/packages"
                                className="rounded-2xl bg-[#e68932] p-5 text-white font-semibold transition hover:opacity-90 flex items-center justify-between shadow-lg"
                            >
                                <span>Packages Manager</span>
                                <span className="text-xs bg-black/20 px-2 py-0.5 rounded">{stats.totalPackages}</span>
                            </Link>
                            <Link
                                href="/admin/hotels"
                                className="rounded-2xl bg-blue-600 p-5 text-white font-semibold transition hover:opacity-90 flex items-center justify-between shadow-lg"
                            >
                                <span>Hotels Manager</span>
                                <span className="text-xs bg-black/20 px-2 py-0.5 rounded">{stats.totalHotels}</span>
                            </Link>
                            <Link
                                href="/admin/offers"
                                className="rounded-2xl bg-yellow-600 p-5 text-black font-bold transition hover:opacity-90 flex items-center justify-between shadow-lg"
                            >
                                <span>Offers Manager</span>
                                <span className="text-xs bg-black/20 px-2 py-0.5 rounded">{stats.activeOffers}</span>
                            </Link>
                            <Link
                                href="/admin/leads"
                                className="rounded-2xl bg-white/10 border border-white/5 p-5 text-white font-semibold transition hover:bg-white/15 flex items-center justify-between"
                            >
                                <span>Leads Inbox</span>
                                <span className="text-xs bg-white/10 px-2 py-0.5 rounded">{stats.totalLeads}</span>
                            </Link>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}