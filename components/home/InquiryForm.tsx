"use client";

import { useState } from "react";

import { db } from "@/lib/firebase";

import {
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

export default function InquiryForm() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [destination, setDestination] = useState("");
  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name || !phone || !destination || !message) {
      alert("Please fill all fields");
      return;
    }

    try {
      setLoading(true);

      await addDoc(collection(db, "leads"), {
        name,
        phone,
        destination,
        message,
        status: "new",
        createdAt: serverTimestamp(),
      });

      alert("Inquiry Submitted Successfully");

      setName("");
      setPhone("");
      setDestination("");
      setMessage("");

    } catch (error) {
      console.log(error);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-[#f5f5f5] px-6 py-24 text-black">

      <div className="mx-auto max-w-3xl rounded-[40px] bg-white p-10 shadow-[0_20px_60px_rgba(0,0,0,0.08)]">

        {/* HEADING */}
        <div className="text-center">

          <p className="uppercase tracking-[4px] text-[#00C2FF]">
            Inquiry Form
          </p>

          <h2 className="mt-4 text-5xl font-bold leading-tight">
            Plan Your Next Journey
          </h2>

          <p className="mt-5 text-gray-500">
            Submit your travel inquiry and our team will contact you shortly.
          </p>

        </div>

        {/* FORM */}
        <div className="mt-12 grid gap-5">

          {/* NAME */}
          <input
            type="text"
            placeholder="Your Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-14 rounded-2xl border border-gray-200 bg-gray-50 px-5 outline-none transition focus:border-[#00C2FF] focus:bg-white"
          />

          {/* PHONE */}
          <input
            type="text"
            placeholder="Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="h-14 rounded-2xl border border-gray-200 bg-gray-50 px-5 outline-none transition focus:border-[#00C2FF] focus:bg-white"
          />

          {/* DESTINATION */}
          <input
            type="text"
            placeholder="Destination"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className="h-14 rounded-2xl border border-gray-200 bg-gray-50 px-5 outline-none transition focus:border-[#00C2FF] focus:bg-white"
          />

          {/* MESSAGE */}
          <textarea
            placeholder="Tell us about your trip plan..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="h-40 rounded-2xl border border-gray-200 bg-gray-50 p-5 outline-none transition focus:border-[#00C2FF] focus:bg-white"
          />

          {/* BUTTON */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="mt-2 h-14 rounded-2xl bg-[#00C2FF] text-lg font-semibold text-black transition hover:scale-[1.02] disabled:opacity-60"
          >
            {loading ? "Submitting..." : "Submit Inquiry"}
          </button>

        </div>

      </div>

    </section>
  );
}