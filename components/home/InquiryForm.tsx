"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { AutomationService } from "@/lib/automation";
import { useTranslation } from "@/lib/TranslationContext";
import { Loader2, CheckCircle2, ShieldAlert } from "lucide-react";

// Turnstile Sandbox Sitekey
const TURNSTILE_SITEKEY = "1x00000000000000000000AA";

export default function InquiryForm() {
  const { t, isRtl } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Zod Validation Schema
  const schema = z.object({
    name: z.string().min(2, { message: t("Name must be at least 2 characters.") }),
    email: z.string().email({ message: t("Invalid email format.") }).or(z.literal("")),
    phone: z.string().min(7, { message: t("Phone number must be at least 7 digits.") }),
    whatsapp: z.string().optional(),
    nationality: z.string().optional(),
    visaType: z.string().optional(),
    destination: z.string().min(2, { message: t("Destination country must be specified.") }),
    travelDate: z.string().min(1, { message: t("Preferred travel date is required.") }),
    travelers: z.string().optional(),
    budget: z.string().optional(),
    message: z.string().min(10, { message: t("Message must be at least 10 characters.") }),
  });

  type FormData = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      whatsapp: "",
      nationality: "",
      visaType: "",
      destination: "",
      travelDate: "",
      travelers: "",
      budget: "",
      message: "",
    },
  });

  // Inject Turnstile script and bind callback
  useEffect(() => {
    // Dynamic callback function for Turnstile
    (window as any).onTurnstileSuccess = (token: string) => {
      setTurnstileToken(token);
    };

    const scriptId = "cloudflare-turnstile-script";
    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onloadTurnstileCallback";
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }

    return () => {
      delete (window as any).onTurnstileSuccess;
      const script = document.getElementById(scriptId);
      if (script) script.remove();
    };
  }, []);

  const onSubmit = async (data: FormData) => {
    if (!turnstileToken) {
      setSubmitError(t("Please complete the spam protection challenge."));
      return;
    }

    try {
      setLoading(true);
      setSubmitError(null);
      setSubmitSuccess(false);

      await addDoc(collection(db, "leads"), {
        ...data,
        turnstileToken,
        currentCountry: "",
        passport: "",
        source: "Website Inquiry",
        travelHistory: "",
        rejectionHistory: "",
        status: "New",
        assignedTo: "",
        revenue: 0,
        createdAt: serverTimestamp(),
      });

      // Send welcome notifications
      if (data.email) {
        try {
          await AutomationService.sendWelcomeEmail(data.email, data.name);
        } catch (e) {
          console.error("Welcome email failed", e);
        }
      }

      const notifyPhone = data.whatsapp || data.phone;
      if (notifyPhone) {
        try {
          await AutomationService.sendWhatsAppNotification(
            notifyPhone,
            `Hi ${data.name}, thank you for your travel inquiry to ${data.destination}! Our team is reviewing it and will reach out to you shortly.`
          );
        } catch (e) {
          console.error("Welcome WhatsApp failed", e);
        }
      }

      setSubmitSuccess(true);
      reset();
      
      // Reset Turnstile token
      if (typeof (window as any).turnstile !== "undefined") {
        (window as any).turnstile.reset();
      }
      setTurnstileToken(null);

      // Clear success notification after 5 seconds
      setTimeout(() => setSubmitSuccess(false), 5000);

    } catch (error: any) {
      console.error(error);
      setSubmitError(t("Something went wrong. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="inquiry" className="bg-[#f5f5f5] px-6 py-24 text-black">
      <div className="mx-auto max-w-4xl rounded-[40px] bg-white p-10 shadow-[0_20px_60px_rgba(0,0,0,0.08)]">
        {/* HEADING */}
        <div className="text-center mb-12">
          <p className="uppercase tracking-[4px] text-[#00C2FF] font-semibold text-sm">
            {t("Inquiry Form")}
          </p>
          <h2 className="mt-4 text-5xl font-bold leading-tight">
            {t("Plan Your Next Journey")}
          </h2>
          <p className="mt-5 text-gray-500">
            {t("Submit your travel inquiry and our team will contact you shortly.")}
          </p>
        </div>

        {/* Success/Error Alerts */}
        {submitSuccess && (
          <div className="mb-6 p-4 rounded-2xl border border-green-500/20 bg-green-50/50 text-green-700 text-sm flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
            <span>{t("Inquiry Submitted Successfully")}</span>
          </div>
        )}

        {submitError && (
          <div className="mb-6 p-4 rounded-2xl border border-red-500/20 bg-red-50/50 text-red-700 text-sm flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 text-red-500 shrink-0" />
            <span>{submitError}</span>
          </div>
        )}

        {/* FORM */}
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-5 md:grid-cols-2 text-left rtl:text-right">
          {/* NAME */}
          <div className="flex flex-col gap-1">
            <input
              type="text"
              placeholder={t("Full Name *")}
              {...register("name")}
              className={`h-14 w-full rounded-2xl border bg-gray-50 px-5 outline-none transition focus:bg-white text-sm ${
                errors.name ? "border-red-400 focus:border-red-500" : "border-gray-200 focus:border-[#00C2FF]"
              }`}
            />
            {errors.name && <span className="text-xs text-red-500 px-2 mt-0.5">{errors.name.message}</span>}
          </div>

          {/* EMAIL */}
          <div className="flex flex-col gap-1">
            <input
              type="email"
              placeholder={t("Email Address")}
              {...register("email")}
              className={`h-14 w-full rounded-2xl border bg-gray-50 px-5 outline-none transition focus:bg-white text-sm ${
                errors.email ? "border-red-400 focus:border-red-500" : "border-gray-200 focus:border-[#00C2FF]"
              }`}
            />
            {errors.email && <span className="text-xs text-red-500 px-2 mt-0.5">{errors.email.message}</span>}
          </div>

          {/* PHONE */}
          <div className="flex flex-col gap-1">
            <input
              type="tel"
              placeholder={t("Phone Number *")}
              {...register("phone")}
              className={`h-14 w-full rounded-2xl border bg-gray-50 px-5 outline-none transition focus:bg-white text-sm ${
                errors.phone ? "border-red-400 focus:border-red-500" : "border-gray-200 focus:border-[#00C2FF]"
              }`}
            />
            {errors.phone && <span className="text-xs text-red-500 px-2 mt-0.5">{errors.phone.message}</span>}
          </div>

          {/* WHATSAPP */}
          <div className="flex flex-col gap-1">
            <input
              type="tel"
              placeholder={t("WhatsApp Number")}
              {...register("whatsapp")}
              className="h-14 w-full rounded-2xl border border-gray-200 bg-gray-50 px-5 outline-none transition focus:border-[#00C2FF] focus:bg-white text-sm"
            />
          </div>

          {/* NATIONALITY */}
          <div className="flex flex-col gap-1">
            <input
              type="text"
              placeholder={t("Nationality")}
              {...register("nationality")}
              className="h-14 w-full rounded-2xl border border-gray-200 bg-gray-50 px-5 outline-none transition focus:border-[#00C2FF] focus:bg-white text-sm"
            />
          </div>

          {/* VISA TYPE */}
          <div className="flex flex-col gap-1">
            <select
              {...register("visaType")}
              className="h-14 w-full rounded-2xl border border-gray-200 bg-gray-50 px-5 outline-none transition focus:border-[#00C2FF] focus:bg-white text-sm text-gray-500"
            >
              <option value="">{t("Select Visa Type")}</option>
              <option value="Tourist">{t("Tourist Visa")}</option>
              <option value="Business">{t("Business Visa")}</option>
              <option value="Student">{t("Student Visa")}</option>
              <option value="Work">{t("Work Visa")}</option>
              <option value="Other">{t("Other")}</option>
            </select>
          </div>

          {/* DESTINATION */}
          <div className="flex flex-col gap-1">
            <input
              type="text"
              placeholder={t("Destination Country *")}
              {...register("destination")}
              className={`h-14 w-full rounded-2xl border bg-gray-50 px-5 outline-none transition focus:bg-white text-sm ${
                errors.destination ? "border-red-400 focus:border-red-500" : "border-gray-200 focus:border-[#00C2FF]"
              }`}
            />
            {errors.destination && <span className="text-xs text-red-500 px-2 mt-0.5">{errors.destination.message}</span>}
          </div>

          {/* TRAVEL DATE */}
          <div className="flex flex-col gap-1">
            <input
              type="date"
              {...register("travelDate")}
              className={`h-14 w-full rounded-2xl border bg-gray-50 px-5 outline-none transition focus:bg-white text-sm text-gray-500 ${
                errors.travelDate ? "border-red-400 focus:border-red-500" : "border-gray-200 focus:border-[#00C2FF]"
              }`}
            />
            {errors.travelDate && <span className="text-xs text-red-500 px-2 mt-0.5">{errors.travelDate.message}</span>}
          </div>

          {/* TRAVELERS */}
          <div className="flex flex-col gap-1">
            <input
              type="number"
              min="1"
              placeholder={t("Number of Travelers")}
              {...register("travelers")}
              className="h-14 w-full rounded-2xl border border-gray-200 bg-gray-50 px-5 outline-none transition focus:border-[#00C2FF] focus:bg-white text-sm"
            />
          </div>

          {/* BUDGET */}
          <div className="flex flex-col gap-1">
            <input
              type="text"
              placeholder={t("Estimated Budget")}
              {...register("budget")}
              className="h-14 w-full rounded-2xl border border-gray-200 bg-gray-50 px-5 outline-none transition focus:border-[#00C2FF] focus:bg-white text-sm"
            />
          </div>

          {/* MESSAGE */}
          <div className="flex flex-col gap-1 md:col-span-2">
            <textarea
              placeholder={t("Tell us about your trip plan... *")}
              {...register("message")}
              className={`h-40 w-full rounded-2xl border bg-gray-50 p-5 outline-none transition focus:bg-white text-sm ${
                errors.message ? "border-red-400 focus:border-red-500" : "border-gray-200 focus:border-[#00C2FF]"
              }`}
            />
            {errors.message && <span className="text-xs text-red-500 px-2 mt-0.5">{errors.message.message}</span>}
          </div>

          {/* Spam Protection (Turnstile Widget) */}
          <div className="md:col-span-2 flex justify-center py-2">
            <div
              className="cf-turnstile"
              data-sitekey={TURNSTILE_SITEKEY}
              data-callback="onTurnstileSuccess"
            />
          </div>

          {/* BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="md:col-span-2 mt-2 h-14 w-full rounded-2xl bg-[#00C2FF] text-lg font-semibold text-black transition hover:scale-[1.02] disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#00C2FF]/10 active:scale-100"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>{t("Submitting...")}</span>
              </>
            ) : (
              <span>{t("Submit Inquiry")}</span>
            )}
          </button>
        </form>
      </div>
    </section>
  );
}