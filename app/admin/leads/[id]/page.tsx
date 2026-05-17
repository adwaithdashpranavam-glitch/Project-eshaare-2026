"use client";

import { use, useEffect, useState } from "react";

import Link from "next/link";

import { ArrowLeft } from "lucide-react";

import { db } from "@/lib/firebase";

import {
    doc,
    getDoc,
    updateDoc,
    arrayUnion,
    serverTimestamp,
} from "firebase/firestore";

type Note = {
    text: string;
};

type Lead = {
    name: string;
    phone: string;
    destination: string;
    message: string;
    status: string;
    notes?: Note[];
};

export default function LeadDetailsPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);

    const [lead, setLead] = useState<Lead | null>(null);

    const [note, setNote] = useState("");

    useEffect(() => {
        const fetchLead = async () => {
            try {
                const docRef = doc(db, "leads", id);

                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setLead(docSnap.data() as Lead);
                }
            } catch (error) {
                console.log(error);
            }
        };

        fetchLead();
    }, [id]);

    const addNote = async () => {
        if (!note.trim()) return;

        try {
            const leadRef = doc(db, "leads", id);

            await updateDoc(leadRef, {
                notes: arrayUnion({
                    text: note,
                }),
            });

            setLead((prev) => {
                if (!prev) return prev;

                return {
                    ...prev,
                    notes: [
                        ...(prev.notes || []),
                        {
                            text: note,
                        },
                    ],
                };
            });

            setNote("");

            console.log("NOTE ADDED SUCCESS");

        } catch (error) {
            console.error("ADD NOTE ERROR:", error);
        }
    };

    if (!lead) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#f4f7fb]">
                <h1 className="text-2xl font-semibold text-gray-500">
                    Loading Lead...
                </h1>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f4f7fb] p-6 md:p-10">

            <div className="mx-auto mt-16 max-w-5xl">

                {/* BACK BUTTON */}
                <Link
                    href="/admin/leads"
                    className="mb-6 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-black shadow-sm transition hover:scale-[1.02]"
                >
                    <ArrowLeft size={18} />
                    Back to Leads
                </Link>

                {/* HEADER */}
                <div className="rounded-[30px] bg-white p-8 shadow-sm">

                    <p className="text-sm uppercase tracking-[4px] text-[#00C2FF]">
                        Lead Details
                    </p>

                    <h1 className="mt-3 text-4xl font-bold text-black">
                        {lead.name}
                    </h1>

                    <div className="mt-8 grid gap-6 md:grid-cols-2">

                        {/* PHONE */}
                        <div className="rounded-2xl border border-gray-100 p-5">
                            <p className="text-sm text-gray-500">
                                Phone Number
                            </p>

                            <h2 className="mt-2 text-xl font-semibold text-black">
                                {lead.phone}
                            </h2>
                        </div>

                        {/* DESTINATION */}
                        <div className="rounded-2xl border border-gray-100 p-5">
                            <p className="text-sm text-gray-500">
                                Destination
                            </p>

                            <h2 className="mt-2 text-xl font-semibold text-black">
                                {lead.destination}
                            </h2>
                        </div>

                        {/* STATUS */}
                        <div className="rounded-2xl border border-gray-100 p-5">
                            <p className="text-sm text-gray-500">
                                Current Status
                            </p>

                            <h2 className="mt-2 text-xl font-semibold text-[#00C2FF]">
                                {lead.status}
                            </h2>
                        </div>

                    </div>

                </div>

                {/* MESSAGE */}
                <div className="mt-8 rounded-[30px] bg-white p-8 shadow-sm">

                    <h2 className="text-2xl font-bold text-black">
                        Customer Message
                    </h2>

                    <p className="mt-5 leading-8 text-gray-600">
                        {lead.message}
                    </p>

                </div>

                {/* NOTES SECTION */}
                <div className="mt-8 rounded-[30px] bg-white p-8 shadow-sm">

                    <h2 className="text-2xl font-bold text-black">
                        Internal Notes
                    </h2>

                    {/* ADD NOTE */}
                    <div className="mt-6 flex flex-col gap-4 md:flex-row">

                        <input
                            type="text"
                            placeholder="Add internal note..."
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            className="h-14 flex-1 rounded-2xl border border-gray-200 px-5 text-black outline-none transition focus:border-[#00C2FF]"
                        />

                        <button
                            onClick={addNote}
                            className="h-14 rounded-2xl bg-[#00C2FF] px-6 font-semibold text-black transition hover:scale-[1.02]"
                        >
                            Add Note
                        </button>

                    </div>

                    {/* NOTES LIST */}
                    <div className="mt-8 space-y-4">

                        {lead.notes?.length ? (
                            lead.notes.map((item, index) => (
                                <div
                                    key={index}
                                    className="rounded-2xl border border-gray-100 bg-gray-50 p-5"
                                >
                                    <p className="text-gray-700">
                                        {item.text}
                                    </p>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500">
                                No notes added yet.
                            </p>
                        )}

                    </div>

                </div>

            </div>

        </div>
    );
}