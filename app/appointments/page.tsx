"use client";

import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function AppointmentsPage() {
    const [customerName, setCustomerName] = useState("");
    const [phone, setPhone] = useState("");
    const [visaType, setVisaType] = useState("");
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!customerName || !phone || !visaType || !date || !time) {
            alert("Please fill in all fields.");
            return;
        }

        try {
            setLoading(true);
            await addDoc(collection(db, "appointments"), {
                customerName,
                phone,
                visaType,
                date,
                time,
                status: "pending",
                createdAt: serverTimestamp(),
            });

            alert("Appointment Booked Successfully!");
            
            setCustomerName("");
            setPhone("");
            setVisaType("");
            setDate("");
            setTime("");
        } catch (error) {
            console.log(error);
            alert("Failed to book appointment. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="bg-[#071120] text-white min-h-screen">
            <Navbar />
            <section className="max-w-4xl mx-auto px-6 py-24">
                <div className="text-center mb-12">
                    <p className="uppercase tracking-[4px] text-[#e68932]">Consultation</p>
                    <h1 className="mt-4 text-5xl font-bold text-white">Book an Appointment</h1>
                    <p className="mt-4 text-gray-400">Schedule a consultation with our visa experts.</p>
                </div>
                
                <div className="bg-white/5 border border-white/10 rounded-[40px] p-10 shadow-2xl">
                    <form onSubmit={handleSubmit} className="grid gap-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Full Name</label>
                                <input
                                    type="text"
                                    value={customerName}
                                    onChange={(e) => setCustomerName(e.target.value)}
                                    placeholder="Enter your name"
                                    className="w-full h-14 rounded-2xl border border-white/10 bg-black/40 px-5 text-white outline-none transition focus:border-[#e68932]"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Phone Number</label>
                                <input
                                    type="text"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="Enter your phone number"
                                    className="w-full h-14 rounded-2xl border border-white/10 bg-black/40 px-5 text-white outline-none transition focus:border-[#e68932]"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Visa Type / Service</label>
                            <select
                                value={visaType}
                                onChange={(e) => setVisaType(e.target.value)}
                                className="w-full h-14 rounded-2xl border border-white/10 bg-black/40 px-5 text-white outline-none transition focus:border-[#e68932] appearance-none"
                            >
                                <option value="" className="text-black">Select Visa Type</option>
                                <option value="Tourist Visa" className="text-black">Tourist Visa</option>
                                <option value="Golden Visa" className="text-black">Golden Visa</option>
                                <option value="Business Setup" className="text-black">Business Setup</option>
                                <option value="General Consultation" className="text-black">General Consultation</option>
                            </select>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Preferred Date</label>
                                <input
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="w-full h-14 rounded-2xl border border-white/10 bg-black/40 px-5 text-white outline-none transition focus:border-[#e68932] [color-scheme:dark]"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Preferred Time</label>
                                <input
                                    type="time"
                                    value={time}
                                    onChange={(e) => setTime(e.target.value)}
                                    className="w-full h-14 rounded-2xl border border-white/10 bg-black/40 px-5 text-white outline-none transition focus:border-[#e68932] [color-scheme:dark]"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="mt-6 h-14 rounded-2xl bg-[#e68932] text-lg font-semibold text-white transition hover:scale-[1.02] disabled:opacity-60"
                        >
                            {loading ? "Booking..." : "Confirm Appointment"}
                        </button>
                    </form>
                </div>
            </section>
            <Footer />
        </main>
    );
}