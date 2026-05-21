"use client";

import { useState } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { AutomationService } from "@/lib/automation";

export default function InquiryForm() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    whatsapp: "",
    email: "",
    nationality: "",
    visaType: "",
    destination: "",
    travelDate: "",
    travelers: "",
    budget: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.phone || !formData.destination || !formData.message) {
      alert("Please fill all required fields (Name, Phone, Destination, Message)");
      return;
    }

    try {
      setLoading(true);

      await addDoc(collection(db, "leads"), {
        ...formData,
        currentCountry: "",
        passport: "",
        source: "Website",
        travelHistory: "",
        rejectionHistory: "",
        status: "New",
        assignedTo: "",
        revenue: 0,
        createdAt: serverTimestamp(),
      });

      // Send welcome notifications
      if (formData.email) {
        try {
          await AutomationService.sendWelcomeEmail(formData.email, formData.name);
        } catch (e) {
          console.error("Welcome email failed", e);
        }
      }
      const notifyPhone = formData.whatsapp || formData.phone;
      if (notifyPhone) {
        try {
          await AutomationService.sendWhatsAppNotification(
            notifyPhone,
            `Hi ${formData.name}, thank you for your travel inquiry to ${formData.destination}! Our team is reviewing it and will reach out to you shortly.`
          );
        } catch (e) {
          console.error("Welcome WhatsApp failed", e);
        }
      }

      alert("Inquiry Submitted Successfully");

      setFormData({
        name: "",
        phone: "",
        whatsapp: "",
        email: "",
        nationality: "",
        visaType: "",
        destination: "",
        travelDate: "",
        travelers: "",
        budget: "",
        message: "",
      });

    } catch (error) {
      console.log(error);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="inquiry" className="bg-[#f5f5f5] px-6 py-24 text-black">

      <div className="mx-auto max-w-4xl rounded-[40px] bg-white p-10 shadow-[0_20px_60px_rgba(0,0,0,0.08)]">

        {/* HEADING */}
        <div className="text-center mb-12">
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
        <div className="grid gap-5 md:grid-cols-2">

          {/* NAME */}
          <input
            type="text"
            name="name"
            placeholder="Full Name *"
            value={formData.name}
            onChange={handleChange}
            className="h-14 w-full rounded-2xl border border-gray-200 bg-gray-50 px-5 outline-none transition focus:border-[#00C2FF] focus:bg-white"
          />

          {/* EMAIL */}
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            className="h-14 w-full rounded-2xl border border-gray-200 bg-gray-50 px-5 outline-none transition focus:border-[#00C2FF] focus:bg-white"
          />

          {/* PHONE */}
          <input
            type="text"
            name="phone"
            placeholder="Phone Number *"
            value={formData.phone}
            onChange={handleChange}
            className="h-14 w-full rounded-2xl border border-gray-200 bg-gray-50 px-5 outline-none transition focus:border-[#00C2FF] focus:bg-white"
          />

          {/* WHATSAPP */}
          <input
            type="text"
            name="whatsapp"
            placeholder="WhatsApp Number"
            value={formData.whatsapp}
            onChange={handleChange}
            className="h-14 w-full rounded-2xl border border-gray-200 bg-gray-50 px-5 outline-none transition focus:border-[#00C2FF] focus:bg-white"
          />

          {/* NATIONALITY */}
          <input
            type="text"
            name="nationality"
            placeholder="Nationality"
            value={formData.nationality}
            onChange={handleChange}
            className="h-14 w-full rounded-2xl border border-gray-200 bg-gray-50 px-5 outline-none transition focus:border-[#00C2FF] focus:bg-white"
          />

          {/* VISA TYPE */}
          <select
            name="visaType"
            value={formData.visaType}
            onChange={handleChange}
            className="h-14 w-full rounded-2xl border border-gray-200 bg-gray-50 px-5 outline-none transition focus:border-[#00C2FF] focus:bg-white"
          >
            <option value="">Select Visa Type</option>
            <option value="Tourist">Tourist Visa</option>
            <option value="Business">Business Visa</option>
            <option value="Student">Student Visa</option>
            <option value="Work">Work Visa</option>
            <option value="Other">Other</option>
          </select>

          {/* DESTINATION */}
          <input
            type="text"
            name="destination"
            placeholder="Destination Country *"
            value={formData.destination}
            onChange={handleChange}
            className="h-14 w-full rounded-2xl border border-gray-200 bg-gray-50 px-5 outline-none transition focus:border-[#00C2FF] focus:bg-white"
          />

          {/* TRAVEL DATE */}
          <input
            type="date"
            name="travelDate"
            placeholder="Travel Date"
            value={formData.travelDate}
            onChange={handleChange}
            className="h-14 w-full rounded-2xl border border-gray-200 bg-gray-50 px-5 outline-none transition focus:border-[#00C2FF] focus:bg-white text-gray-500"
          />

          {/* TRAVELERS */}
          <input
            type="number"
            name="travelers"
            placeholder="Number of Travelers"
            value={formData.travelers}
            onChange={handleChange}
            className="h-14 w-full rounded-2xl border border-gray-200 bg-gray-50 px-5 outline-none transition focus:border-[#00C2FF] focus:bg-white"
          />

          {/* BUDGET */}
          <input
            type="text"
            name="budget"
            placeholder="Estimated Budget"
            value={formData.budget}
            onChange={handleChange}
            className="h-14 w-full rounded-2xl border border-gray-200 bg-gray-50 px-5 outline-none transition focus:border-[#00C2FF] focus:bg-white"
          />

          {/* MESSAGE */}
          <textarea
            name="message"
            placeholder="Tell us about your trip plan... *"
            value={formData.message}
            onChange={handleChange}
            className="md:col-span-2 h-40 w-full rounded-2xl border border-gray-200 bg-gray-50 p-5 outline-none transition focus:border-[#00C2FF] focus:bg-white"
          />

          {/* BUTTON */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="md:col-span-2 mt-2 h-14 w-full rounded-2xl bg-[#00C2FF] text-lg font-semibold text-black transition hover:scale-[1.02] disabled:opacity-60"
          >
            {loading ? "Submitting..." : "Submit Inquiry"}
          </button>

        </div>
      </div>
    </section>
  );
}