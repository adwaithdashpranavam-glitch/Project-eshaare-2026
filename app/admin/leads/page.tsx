"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { db } from "@/lib/firebase";

import {
    collection,
    getDocs,
    query,
    orderBy,
    doc,
    updateDoc,
} from "firebase/firestore";

type Lead = {
    id: string;
    name: string;
    phone: string;
    destination: string;
    message: string;
    status: string;
};

export default function LeadsPage() {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeads = async () => {
            try {
                const q = query(
                    collection(db, "leads"),
                    orderBy("createdAt", "desc")
                );

                const querySnapshot = await getDocs(q);

                const leadsData: Lead[] = [];

                querySnapshot.forEach((docItem) => {
                    const data = docItem.data();

                    leadsData.push({
                        id: docItem.id,
                        name: data.name || "",
                        phone: data.phone || "",
                        destination: data.destination || "",
                        message: data.message || "",
                        status: data.status || "new",
                    });
                });

                setLeads(leadsData);

            } catch (error) {
                console.log(error);
            } finally {
                setLoading(false);
            }
        };

        fetchLeads();
    }, []);

    // UPDATE STATUS
    const updateLeadStatus = async (
        id: string,
        status: string
    ) => {
        try {
            const leadRef = doc(db, "leads", id);

            await updateDoc(leadRef, {
                status,
            });

            setLeads((prev) =>
                prev.map((lead) =>
                    lead.id === id
                        ? { ...lead, status }
                        : lead
                )
            );

        } catch (error) {
            console.log(error);
        }
    };

    // STATUS COLORS
    const getStatusStyles = (status: string) => {
        switch (status) {
            case "new":
                return "bg-blue-100 text-blue-700";

            case "contacted":
                return "bg-yellow-100 text-yellow-700";

            case "processing":
                return "bg-orange-100 text-orange-700";

            case "approved":
                return "bg-green-100 text-green-700";

            case "rejected":
                return "bg-red-100 text-red-700";

            default:
                return "bg-gray-100 text-gray-700";
        }
    };

    return (
        <div className="min-h-screen bg-[#f4f7fb] p-6 md:p-10">

            {/* HEADER */}
            <div className="mt-16 mb-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                <div>
                    <p className="text-sm uppercase tracking-[4px] text-[#00C2FF]">
                        ESHAARE CRM
                    </p>

                    <h1 className="mt-2 text-4xl font-bold text-black">
                        Leads Dashboard
                    </h1>
                </div>

                <div className="rounded-2xl border border-gray-100 bg-white px-6 py-4 shadow-sm">

                    <p className="text-sm text-gray-500">
                        Total Leads
                    </p>

                    <h2 className="mt-1 text-3xl font-bold text-black">
                        {leads.length}
                    </h2>

                </div>

            </div>

            {/* TABLE */}
            <div className="overflow-hidden  border border-gray-200 bg-white shadow-[0_15px_40px_rgba(0,0,0,0.05)]">

                <div className="overflow-x-auto">

                    <table className="w-full min-w-[1100px]">

                        {/* TABLE HEAD */}
                        <thead className="bg-[#071120] text-white">

                            <tr>

                                <th className="px-6 py-5 text-left text-sm font-semibold">
                                    Customer
                                </th>

                                <th className="px-6 py-5 text-left text-sm font-semibold">
                                    Phone
                                </th>

                                <th className="px-6 py-5 text-left text-sm font-semibold">
                                    Destination
                                </th>

                                <th className="px-6 py-5 text-left text-sm font-semibold">
                                    Message
                                </th>

                                <th className="px-6 py-5 text-left text-sm font-semibold">
                                    Status
                                </th>

                            </tr>

                        </thead>

                        {/* TABLE BODY */}
                        <tbody>

                            {loading ? (
                                <tr>
                                    <td
                                        colSpan={5}
                                        className="px-6 py-16 text-center text-lg text-gray-500"
                                    >
                                        Loading Leads...
                                    </td>
                                </tr>
                            ) : leads.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={5}
                                        className="px-6 py-16 text-center text-lg text-gray-500"
                                    >
                                        No Leads Found
                                    </td>
                                </tr>
                            ) : (
                                leads.map((lead, index) => (
                                    <tr
                                        key={lead.id}
                                        className={`border-b border-gray-100 transition hover:bg-[#f9fbff] ${index % 2 === 0
                                            ? "bg-white"
                                            : "bg-gray-50/40"
                                            }`}
                                    >

                                        {/* CUSTOMER */}
                                        <td className="px-6 py-6">

                                            <div>

                                                <Link
                                                    href={`/admin/leads/${lead.id}`}
                                                    className="font-semibold text-black hover:text-[#00C2FF]"
                                                >
                                                    {lead.name}
                                                </Link>

                                                <p className="mt-1 text-sm text-gray-500">
                                                    Lead ID: {lead.id.slice(0, 8)}
                                                </p>

                                            </div>

                                        </td>

                                        {/* PHONE */}
                                        <td className="px-6 py-6 text-gray-700">
                                            {lead.phone}
                                        </td>

                                        {/* DESTINATION */}
                                        <td className="px-6 py-6">

                                            <div className="inline-flex rounded-full bg-[#00C2FF]/10 px-4 py-2 text-sm font-semibold text-gray-700">
                                                {lead.destination}
                                            </div>

                                        </td>

                                        {/* MESSAGE */}
                                        <td className="max-w-[320px] px-6 py-6 text-gray-600">

                                            <p className="line-clamp-2">
                                                {lead.message}
                                            </p>

                                        </td>

                                        {/* STATUS */}
                                        <td className="px-6 py-6 text-gray-600">

                                            <select
                                                value={lead.status}
                                                onChange={(e) =>
                                                    updateLeadStatus(
                                                        lead.id,
                                                        e.target.value
                                                    )
                                                }
                                                className={`rounded-xl border-0 px-4 py-2 text-sm font-semibold outline-none ${getStatusStyles(
                                                    lead.status
                                                )}`}
                                            >

                                                <option value="new">
                                                    New
                                                </option>

                                                <option value="contacted">
                                                    Contacted
                                                </option>

                                                <option value="processing">
                                                    Processing
                                                </option>

                                                <option value="approved">
                                                    Approved
                                                </option>

                                                <option value="rejected">
                                                    Rejected
                                                </option>

                                            </select>

                                        </td>

                                    </tr>
                                ))
                            )}

                        </tbody>

                    </table>

                </div>

            </div>

        </div>
    );
}