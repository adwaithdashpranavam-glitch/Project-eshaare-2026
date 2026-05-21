"use client";

import { useEffect, useState, useMemo } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, onSnapshot } from "firebase/firestore";
import { TrendingUp, Users, DollarSign, Award, Download, Calendar } from "lucide-react";

type Lead = {
    id: string;
    name: string;
    status: string;
    assignedTo: string;
    destination: string;
    revenue: number;
    createdAt: any;
};

export default function AdminReportsPage() {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [timeframe, setTimeframe] = useState("All");

    useEffect(() => {
        const q = query(collection(db, "leads"));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data: Lead[] = [];
            snapshot.forEach((docSnap) => {
                const leadData = docSnap.data();
                data.push({
                    id: docSnap.id,
                    name: leadData.name || "Unknown Client",
                    status: leadData.status || "New",
                    assignedTo: leadData.assignedTo || "Unassigned",
                    destination: leadData.destination || "Unknown",
                    revenue: Number(leadData.revenue) || 0,
                    createdAt: leadData.createdAt ? leadData.createdAt.toDate() : new Date(),
                });
            });
            setLeads(data);
            setLoading(false);
        }, (error) => {
            console.error("Error subscribing to leads:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // Filter leads by selected timeframe
    const filteredLeads = useMemo(() => {
        const now = new Date();
        return leads.filter((lead) => {
            if (timeframe === "All") return true;

            const leadDate = new Date(lead.createdAt);
            const diffTime = Math.abs(now.getTime() - leadDate.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (timeframe === "Week") return diffDays <= 7;
            if (timeframe === "Month") return diffDays <= 30;
            return true;
        });
    }, [leads, timeframe]);

    // Financial calculations
    const stats = useMemo(() => {
        let totalRev = 0;
        let closedCount = 0;
        let totalCount = filteredLeads.length;

        filteredLeads.forEach((lead) => {
            totalRev += lead.revenue;
            if (lead.status === "Closed" || lead.status === "Approved") {
                closedCount++;
            }
        });

        const conversionRate = totalCount > 0 ? parseFloat(((closedCount / totalCount) * 100).toFixed(1)) : 0;

        return {
            totalRevenue: totalRev,
            conversionRate,
            totalLeads: totalCount,
            closedLeads: closedCount,
        };
    }, [filteredLeads]);

    // Destination aggregates
    const destinationStats = useMemo(() => {
        const counts: Record<string, { count: number; revenue: number }> = {};
        
        filteredLeads.forEach((lead) => {
            const dest = lead.destination.trim();
            if (!counts[dest]) {
                counts[dest] = { count: 0, revenue: 0 };
            }
            counts[dest].count++;
            counts[dest].revenue += lead.revenue;
        });

        return Object.entries(counts)
            .map(([name, stat]) => ({
                name,
                count: stat.count,
                revenue: stat.revenue,
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5); // top 5
    }, [filteredLeads]);

    // Staff aggregates
    const staffStats = useMemo(() => {
        const staff: Record<string, { assigned: number; closed: number; revenue: number }> = {};

        filteredLeads.forEach((lead) => {
            const agent = lead.assignedTo || "Unassigned";
            if (!staff[agent]) {
                staff[agent] = { assigned: 0, closed: 0, revenue: 0 };
            }
            staff[agent].assigned++;
            staff[agent].revenue += lead.revenue;
            if (lead.status === "Closed" || lead.status === "Approved") {
                staff[agent].closed++;
            }
        });

        return Object.entries(staff).map(([name, stat]) => {
            const rate = stat.assigned > 0 ? parseFloat(((stat.closed / stat.assigned) * 100).toFixed(1)) : 0;
            return {
                name,
                assigned: stat.assigned,
                closed: stat.closed,
                revenue: stat.revenue,
                conversionRate: rate,
            };
        }).sort((a, b) => b.revenue - a.revenue);
    }, [filteredLeads]);

    // CSV Exporter
    const handleExportCSV = () => {
        if (filteredLeads.length === 0) {
            alert("No data available to export");
            return;
        }

        const headers = ["Lead ID", "Name", "Status", "Agent", "Destination", "Revenue (AED)", "Created Date"];
        const rows = filteredLeads.map((lead) => [
            lead.id,
            `"${lead.name.replace(/"/g, '""')}"`,
            lead.status,
            lead.assignedTo,
            `"${lead.destination.replace(/"/g, '""')}"`,
            lead.revenue,
            new Date(lead.createdAt).toLocaleDateString(),
        ]);

        const csvContent = "data:text/csv;charset=utf-8," 
            + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `eshaare_leads_report_${timeframe.toLowerCase()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">Reports & CRM Analytics</h1>
                    <p className="mt-2 text-gray-400">Perform sales audits, monitor agents conversion rates, and audit travel volume.</p>
                </div>
                <button
                    onClick={handleExportCSV}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#e68932] px-6 py-3 font-semibold text-white shadow-lg shadow-orange-500/20 hover:opacity-90 transition active:scale-95 text-sm"
                >
                    <Download size={16} />
                    Export CSV Report
                </button>
            </div>

            {/* Timeframe selector controls */}
            <div className="flex items-center gap-4 bg-white/5 p-1.5 rounded-2xl border border-white/10 w-fit">
                <div className="pl-3 text-gray-400 text-xs font-semibold flex items-center gap-1.5">
                    <Calendar size={14} /> Timeframe:
                </div>
                {["All", "Month", "Week"].map((tf) => (
                    <button
                        key={tf}
                        onClick={() => setTimeframe(tf)}
                        className={`px-5 py-2 rounded-xl text-xs font-semibold tracking-wide transition ${
                            timeframe === tf ? "bg-white/10 text-white border border-white/10 shadow" : "text-gray-400 hover:text-white"
                        }`}
                    >
                        {tf === "All" ? "All Time" : tf === "Month" ? "Last 30 Days" : "Last 7 Days"}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="text-white text-xl">Compiling Analytics Data...</div>
            ) : (
                <>
                    {/* Stat Widgets Grid */}
                    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
                        {/* Total Revenue */}
                        <div className="rounded-3xl bg-white/5 border border-white/10 p-6 flex flex-col justify-between">
                            <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Gross Sales Revenue</span>
                            <div className="mt-4 flex items-baseline gap-2">
                                <span className="text-3xl font-bold text-[#e68932]">AED {stats.totalRevenue.toLocaleString()}</span>
                            </div>
                            <div className="mt-4 flex items-center gap-2 text-xs text-green-400">
                                <DollarSign size={14} />
                                <span>Realized invoice value</span>
                            </div>
                        </div>

                        {/* Conversion Rate */}
                        <div className="rounded-3xl bg-white/5 border border-white/10 p-6 flex flex-col justify-between">
                            <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Conversion Ratio</span>
                            <div className="mt-4 flex items-baseline gap-2">
                                <span className="text-3xl font-bold text-green-400">{stats.conversionRate}%</span>
                            </div>
                            <div className="mt-4 flex items-center gap-2 text-xs text-gray-400">
                                <TrendingUp size={14} />
                                <span>Closed vs Total inquiries</span>
                            </div>
                        </div>

                        {/* Total Inquiries */}
                        <div className="rounded-3xl bg-white/5 border border-white/10 p-6 flex flex-col justify-between">
                            <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Inquiries Logged</span>
                            <div className="mt-4 flex items-baseline gap-2">
                                <span className="text-3xl font-bold text-white">{stats.totalLeads}</span>
                            </div>
                            <div className="mt-4 flex items-center gap-2 text-xs text-gray-400">
                                <Users size={14} />
                                <span>Capture rate overview</span>
                            </div>
                        </div>

                        {/* Successful Sales */}
                        <div className="rounded-3xl bg-white/5 border border-white/10 p-6 flex flex-col justify-between">
                            <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Successfully Closed</span>
                            <div className="mt-4 flex items-baseline gap-2">
                                <span className="text-3xl font-bold text-blue-400">{stats.closedLeads}</span>
                            </div>
                            <div className="mt-4 flex items-center gap-2 text-xs text-gray-400">
                                <Award size={14} />
                                <span>Completed customer accounts</span>
                            </div>
                        </div>
                    </div>

                    {/* Breakdown section tables */}
                    <div className="grid gap-8 md:grid-cols-2">
                        {/* Destination Analytics Card */}
                        <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
                            <h3 className="text-xl font-bold text-white mb-6">Top Destination Demands</h3>
                            {destinationStats.length === 0 ? (
                                <p className="text-gray-400 text-sm">No destinations stats available.</p>
                            ) : (
                                <div className="space-y-5">
                                    {destinationStats.map((dest, i) => {
                                        const percentage = stats.totalLeads > 0 ? Math.round((dest.count / stats.totalLeads) * 100) : 0;
                                        return (
                                            <div key={dest.name} className="space-y-2">
                                                <div className="flex justify-between text-sm">
                                                    <span className="font-semibold text-white">{i + 1}. {dest.name}</span>
                                                    <span className="text-gray-400">{dest.count} requests ({percentage}%)</span>
                                                </div>
                                                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full rounded-full bg-[#e68932]"
                                                        style={{ width: `${percentage}%` }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Staff Performance Card */}
                        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 flex flex-col">
                            <h3 className="text-xl font-bold text-white mb-6">Sales Agents Leadership</h3>
                            {staffStats.length === 0 ? (
                                <p className="text-gray-400 text-sm">No agent assignments logged.</p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-xs">
                                        <thead>
                                            <tr className="border-b border-white/10 text-gray-400 font-semibold pb-3 uppercase tracking-wider">
                                                <th className="py-2.5">Agent</th>
                                                <th className="py-2.5 text-center">Assigned</th>
                                                <th className="py-2.5 text-center">Closed</th>
                                                <th className="py-2.5 text-center">Conversion</th>
                                                <th className="py-2.5 text-right">Revenue</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5 text-gray-300 font-medium">
                                            {staffStats.map((agent) => (
                                                <tr key={agent.name} className="hover:text-white transition">
                                                    <td className="py-3 font-semibold text-white">{agent.name}</td>
                                                    <td className="py-3 text-center">{agent.assigned}</td>
                                                    <td className="py-3 text-center">{agent.closed}</td>
                                                    <td className="py-3 text-center text-green-400">{agent.conversionRate}%</td>
                                                    <td className="py-3 text-right font-bold text-[#e68932]">AED {agent.revenue.toLocaleString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
