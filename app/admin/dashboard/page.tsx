"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

export default function AdminDashboardPage() {
    const [stats, setStats] = useState({
        totalPackages: 0,
        activePackages: 0,
        featuredPackages: 0,
        totalLeads: 0,
        newLeads: 0,
        totalAppointments: 0,
        totalVisas: 0
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

            // Fetch Packages
            try {
                const packagesSnap = await getDocs(collection(db, "packages"));
                totalPkgs = packagesSnap.size;
                packagesSnap.forEach((doc) => {
                    const data = doc.data();
                    if (data.active) activePkgs++;
                    if (data.featured) featuredPkgs++;
                });
            } catch (error) {
                console.error("Error fetching packages for dashboard metrics:", error);
            }

            // Fetch Leads
            try {
                const leadsSnap = await getDocs(collection(db, "leads"));
                totalLeadsCount = leadsSnap.size;
                leadsSnap.forEach((doc) => {
                    const statusVal = doc.data().status;
                    if (statusVal && typeof statusVal === "string" && statusVal.toLowerCase() === "new") {
                        newLeadsCount++;
                    }
                });
            } catch (error) {
                console.error("Error fetching leads for dashboard metrics:", error);
            }

            // Fetch Appointments
            try {
                const apptsSnap = await getDocs(collection(db, "appointments"));
                totalAppts = apptsSnap.size;
            } catch (error) {
                console.error("Error fetching appointments for dashboard metrics:", error);
            }

            // Fetch Visa Applications
            try {
                const visasSnap = await getDocs(collection(db, "visaApplications"));
                totalVisasCount = visasSnap.size;
            } catch (error) {
                console.error("Error fetching visaApplications for dashboard metrics:", error);
            }

            setStats({
                totalPackages: totalPkgs,
                activePackages: activePkgs,
                featuredPackages: featuredPkgs,
                totalLeads: totalLeadsCount,
                newLeads: newLeadsCount,
                totalAppointments: totalAppts,
                totalVisas: totalVisasCount
            });
            setLoading(false);
        };

        fetchAnalytics();
    }, []);

    return (
        <div>
            <h1 className="text-3xl font-bold text-white">
                Admin Dashboard
            </h1>
            <p className="mt-2 text-gray-400">
                Overview of packages, leads, and business activity.
            </p>

            {loading ? (
                <div className="mt-12 text-white text-xl">Loading Analytics...</div>
            ) : (
                <>
                    <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
                        <div className="rounded-3xl bg-white/5 p-6 border border-white/10">
                            <p className="text-gray-400">Total Packages</p>
                            <h2 className="mt-3 text-4xl font-bold text-white">{stats.totalPackages}</h2>
                            <p className="mt-2 text-sm text-green-400">{stats.activePackages} Active</p>
                        </div>

                        <div className="rounded-3xl bg-white/5 p-6 border border-white/10">
                            <p className="text-gray-400">Total Leads</p>
                            <h2 className="mt-3 text-4xl font-bold text-orange-400">{stats.totalLeads}</h2>
                            <p className="mt-2 text-sm text-red-400">{stats.newLeads} New</p>
                        </div>

                        <div className="rounded-3xl bg-white/5 p-6 border border-white/10">
                            <p className="text-gray-400">Appointments</p>
                            <h2 className="mt-3 text-4xl font-bold text-blue-400">{stats.totalAppointments}</h2>
                        </div>

                        <div className="rounded-3xl bg-white/5 p-6 border border-white/10">
                            <p className="text-gray-400">Visa Applications</p>
                            <h2 className="mt-3 text-4xl font-bold text-[#e68932]">{stats.totalVisas}</h2>
                        </div>
                    </div>

                    <div className="mt-10 grid gap-6 md:grid-cols-3">
                        <Link
                            href="/admin/packages"
                            className="rounded-3xl bg-[#e68932] p-6 text-white font-semibold transition hover:opacity-90"
                        >
                            Manage Packages
                        </Link>
                        <Link
                            href="/admin/leads"
                            className="rounded-3xl bg-white/10 p-6 text-white font-semibold transition hover:bg-white/20 border border-white/5"
                        >
                            View Leads
                        </Link>
                        <Link
                            href="/admin/appointments"
                            className="rounded-3xl bg-white/10 p-6 text-white font-semibold transition hover:bg-white/20 border border-white/5"
                        >
                            View Appointments
                        </Link>
                    </div>
                </>
            )}
        </div>
    );
}