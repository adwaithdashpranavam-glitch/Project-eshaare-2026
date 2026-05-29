"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, collection, addDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useTranslation } from "@/lib/TranslationContext";
import Footer from "@/components/layout/Footer";
import { 
  CreditCard, 
  Lock, 
  ShieldCheck, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  Calendar,
  User,
  Hash,
  Wallet,
  MapPin
} from "lucide-react";

// Checkout Schema Validation
const cardSchema = z.object({
  cardNumber: z.string().regex(/^\d{16}$/, { message: "Card number must be exactly 16 digits." }),
  expiry: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, { message: "Expiry must be in MM/YY format." }),
  cvv: z.string().regex(/^\d{3,4}$/, { message: "CVV must be 3 or 4 digits." }),
  cardholderName: z.string().min(3, { message: "Cardholder name must be at least 3 characters." }),
  billingAddress: z.string().min(5, { message: "Billing address must be specified." }),
});

type CardFormData = z.infer<typeof cardSchema>;

function CheckoutContent() {
  const { t, isRtl } = useTranslation();
  const searchParams = useSearchParams();
  const router = useRouter();

  // Params
  const type = searchParams.get("type") || "package";
  const id = searchParams.get("id") || "";
  
  // States
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [itemDetails, setItemDetails] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState(true);
  const [paymentTab, setPaymentTab] = useState<"card" | "wallet">("card");
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CardFormData>({
    resolver: zodResolver(cardSchema),
    defaultValues: {
      cardNumber: "",
      expiry: "",
      cvv: "",
      cardholderName: "",
      billingAddress: "",
    }
  });

  // Verify auth session
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setAuthLoading(false);
      if (!user) {
        // Must be logged in to checkout
        router.push(`/login?redirect=/checkout?type=${type}&id=${id}`);
      }
    });
    return () => unsubscribe();
  }, [router, type, id]);

  // Load item details
  useEffect(() => {
    if (authLoading || !currentUser) return;

    const fetchDetails = async () => {
      try {
        setLoadingDetails(true);
        if (type === "package") {
          // Read from packages collection
          const pkgSnap = await getDoc(doc(db, "packages", id));
          if (pkgSnap.exists()) {
            setItemDetails({ id: pkgSnap.id, ...pkgSnap.data() });
          } else {
            // Fallback mock details if document not in firestore yet
            setItemDetails({
              title: id.replace(/-/g, " ").toUpperCase(),
              price: "AED 3,499",
              duration: "5 Days / 4 Nights"
            });
          }
        } else {
          // Visa details
          setItemDetails({
            title: `${id.charAt(0).toUpperCase() + id.slice(1)} Visa Services`,
            price: "AED 750",
            duration: "Embassy Processing"
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingDetails(false);
      }
    };

    fetchDetails();
  }, [currentUser, authLoading, type, id]);

  const handleCardPayment = async (data: CardFormData) => {
    if (!currentUser || !itemDetails) return;

    try {
      setProcessing(true);
      setErrorMsg("");

      // Simulate network request delay
      await new Promise((resolve) => setTimeout(resolve, 2500));

      const numericPrice = parseInt(itemDetails.price.replace(/[^0-9]/g, "")) || 0;

      // 1. Save Transaction to Payments Collection
      const paymentRef = await addDoc(collection(db, "payments"), {
        userId: currentUser.uid,
        userEmail: currentUser.email,
        itemName: itemDetails.title,
        itemId: id,
        itemType: type,
        amount: numericPrice,
        currency: "AED",
        status: "Paid",
        cardLast4: data.cardNumber.slice(-4),
        createdAt: serverTimestamp()
      });

      // 2. Register Booking inside bookings/visaApplications if it exists
      if (type === "package") {
        await addDoc(collection(db, "bookings"), {
          userId: currentUser.uid,
          userEmail: currentUser.email,
          packageId: id,
          itemName: itemDetails.title,
          price: itemDetails.price,
          status: "confirmed",
          paymentId: paymentRef.id,
          createdAt: serverTimestamp()
        });
      } else {
        await addDoc(collection(db, "visaApplications"), {
          userId: currentUser.uid,
          applicantName: data.cardholderName,
          email: currentUser.email.toLowerCase().trim(),
          destination: id,
          passportNumber: "TBD",
          status: "processing",
          checklistProgress: 25,
          paymentId: paymentRef.id,
          createdAt: serverTimestamp()
        });
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);

    } catch (err: any) {
      console.error(err);
      setErrorMsg(t("Payment processing failed. Please verify card entries."));
    } finally {
      setProcessing(false);
    }
  };

  const handleWalletPayment = async (walletType: string) => {
    if (!currentUser || !itemDetails) return;

    try {
      setProcessing(true);
      setErrorMsg("");

      // Simulate payment delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const numericPrice = parseInt(itemDetails.price.replace(/[^0-9]/g, "")) || 0;

      const paymentRef = await addDoc(collection(db, "payments"), {
        userId: currentUser.uid,
        userEmail: currentUser.email,
        itemName: itemDetails.title,
        itemId: id,
        itemType: type,
        amount: numericPrice,
        currency: "AED",
        status: "Paid",
        paymentMethod: walletType,
        createdAt: serverTimestamp()
      });

      if (type === "package") {
        await addDoc(collection(db, "bookings"), {
          userId: currentUser.uid,
          userEmail: currentUser.email,
          packageId: id,
          itemName: itemDetails.title,
          price: itemDetails.price,
          status: "confirmed",
          paymentId: paymentRef.id,
          createdAt: serverTimestamp()
        });
      } else {
        await addDoc(collection(db, "visaApplications"), {
          userId: currentUser.uid,
          applicantName: currentUser.displayName || "Applicant",
          email: currentUser.email.toLowerCase().trim(),
          destination: id,
          passportNumber: "TBD",
          status: "processing",
          checklistProgress: 25,
          paymentId: paymentRef.id,
          createdAt: serverTimestamp()
        });
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);

    } catch (err: any) {
      console.error(err);
      setErrorMsg(t("Wallet checkout failed. Please try again."));
    } finally {
      setProcessing(false);
    }
  };

  if (authLoading || loadingDetails) {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center bg-[#071120] text-white">
        <Loader2 className="w-8 h-8 text-[#e68932] animate-spin mb-4" />
        <p className="text-sm text-gray-400">{t("Loading Order Summary...")}</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-[80vh] max-w-6xl mx-auto px-6 py-16 grid lg:grid-cols-5 gap-10 text-white z-10">
      {/* Background ambient decor */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-blue-600/5 blur-[150px] pointer-events-none" />

      {/* LEFT: PAYMENT METHOD CONFIGURATION */}
      <div className="lg:col-span-3 space-y-6">
        <div className="rounded-[35px] border border-white/10 bg-[#0c192e]/85 p-8 backdrop-blur-xl shadow-2xl">
          <h2 className="text-2xl font-bold flex items-center gap-2.5">
            <CreditCard className="text-[#e68932]" />
            {t("Secure Checkout")}
          </h2>
          <p className="text-gray-400 text-xs mt-1.5">{t("Complete your transaction securely via 256-bit encryption.")}</p>

          {/* Success Alerts */}
          {success && (
            <div className="my-6 p-4 rounded-xl border border-green-500/20 bg-green-500/10 text-green-400 text-sm flex items-center gap-3.5 animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
              <div>
                <p className="font-bold">{t("Payment Successful!")}</p>
                <p className="text-xs text-green-500/80 mt-0.5">{t("Redirecting you to portal dashboard...")}</p>
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="my-6 p-4 rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 text-sm flex items-center gap-3.5 animate-in fade-in">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Checkout Tabs */}
          <div className="grid grid-cols-2 p-1 bg-black/40 border border-white/5 rounded-xl my-6">
            <button
              onClick={() => setPaymentTab("card")}
              className={`py-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer ${
                paymentTab === "card" ? "bg-[#e68932] text-white shadow" : "text-gray-400 hover:text-white"
              }`}
            >
              <CreditCard size={14} />
              <span>{t("Credit Card")}</span>
            </button>
            <button
              onClick={() => setPaymentTab("wallet")}
              className={`py-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer ${
                paymentTab === "wallet" ? "bg-[#e68932] text-white shadow" : "text-gray-400 hover:text-white"
              }`}
            >
              <Wallet size={14} />
              <span>{t("Payment Method")}</span>
            </button>
          </div>

          {/* CARD PAYMENT FORM */}
          {paymentTab === "card" ? (
            <form onSubmit={handleSubmit(handleCardPayment)} className="space-y-4 text-left rtl:text-right">
              {/* CARDHOLDER NAME */}
              <div className="space-y-1">
                <label className="block text-3xs font-bold uppercase tracking-wider text-gray-400">{t("Cardholder Name")}</label>
                <div className="flex items-center h-12 rounded-xl border border-white/10 bg-black/35 px-4 focus-within:border-[#e68932] transition">
                  <User className="text-gray-400 mr-2.5 w-4 h-4 shrink-0" />
                  <input
                    type="text"
                    placeholder="JOHN DOE"
                    {...register("cardholderName")}
                    disabled={processing}
                    className="bg-transparent text-white outline-none w-full text-xs font-medium placeholder:text-gray-700 uppercase"
                  />
                </div>
                {errors.cardholderName && <span className="text-2xs text-red-400 block px-1">{errors.cardholderName.message}</span>}
              </div>

              {/* CARD NUMBER */}
              <div className="space-y-1">
                <label className="block text-3xs font-bold uppercase tracking-wider text-gray-400">{t("Card Number")}</label>
                <div className="flex items-center h-12 rounded-xl border border-white/10 bg-black/35 px-4 focus-within:border-[#e68932] transition">
                  <Hash className="text-gray-400 mr-2.5 w-4 h-4 shrink-0" />
                  <input
                    type="text"
                    maxLength={16}
                    placeholder="4000 1234 5678 9010"
                    {...register("cardNumber")}
                    disabled={processing}
                    className="bg-transparent text-white outline-none w-full text-xs font-semibold placeholder:text-gray-700 tracking-wider"
                  />
                </div>
                {errors.cardNumber && <span className="text-2xs text-red-400 block px-1">{errors.cardNumber.message}</span>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* EXPIRY */}
                <div className="space-y-1">
                  <label className="block text-3xs font-bold uppercase tracking-wider text-gray-400">{t("Expiration Date")}</label>
                  <div className="flex items-center h-12 rounded-xl border border-white/10 bg-black/35 px-4 focus-within:border-[#e68932] transition">
                    <Calendar className="text-gray-400 mr-2.5 w-4 h-4 shrink-0" />
                    <input
                      type="text"
                      maxLength={5}
                      placeholder="MM/YY"
                      {...register("expiry")}
                      disabled={processing}
                      className="bg-transparent text-white outline-none w-full text-xs font-semibold placeholder:text-gray-700"
                    />
                  </div>
                  {errors.expiry && <span className="text-2xs text-red-400 block px-1">{errors.expiry.message}</span>}
                </div>

                {/* CVV */}
                <div className="space-y-1">
                  <label className="block text-3xs font-bold uppercase tracking-wider text-gray-400">{t("CVV")}</label>
                  <div className="flex items-center h-12 rounded-xl border border-white/10 bg-black/35 px-4 focus-within:border-[#e68932] transition">
                    <Lock className="text-gray-400 mr-2.5 w-4 h-4 shrink-0" />
                    <input
                      type="password"
                      maxLength={4}
                      placeholder="•••"
                      {...register("cvv")}
                      disabled={processing}
                      className="bg-transparent text-white outline-none w-full text-xs font-semibold placeholder:text-gray-700"
                    />
                  </div>
                  {errors.cvv && <span className="text-2xs text-red-400 block px-1">{errors.cvv.message}</span>}
                </div>
              </div>

              {/* BILLING ADDRESS */}
              <div className="space-y-1">
                <label className="block text-3xs font-bold uppercase tracking-wider text-gray-400">Billing Address</label>
                <div className="flex items-center h-12 rounded-xl border border-white/10 bg-black/35 px-4 focus-within:border-[#e68932] transition">
                  <MapPin className="text-gray-400 mr-2.5 w-4 h-4 shrink-0" />
                  <input
                    type="text"
                    placeholder="Dubai Marina, UAE"
                    {...register("billingAddress")}
                    disabled={processing}
                    className="bg-transparent text-white outline-none w-full text-xs font-medium placeholder:text-gray-700"
                  />
                </div>
                {errors.billingAddress && <span className="text-2xs text-red-400 block px-1">{errors.billingAddress.message}</span>}
              </div>

              <button
                type="submit"
                disabled={processing || success}
                className="w-full h-13 mt-6 bg-[#e68932] hover:bg-[#cf7726] text-white font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#e68932]/10 transition disabled:opacity-50"
              >
                {processing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>{t("Processing Payment...")}</span>
                  </>
                ) : (
                  <>
                    <Lock size={15} />
                    <span>{t("Complete Payment")}</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            /* WALLET PAYMENT BUTTONS */
            <div className="space-y-4">
              <button
                onClick={() => handleWalletPayment("Apple Pay")}
                disabled={processing || success}
                className="w-full h-13 bg-white hover:bg-gray-100 text-black font-extrabold rounded-xl flex items-center justify-center gap-2 cursor-pointer transition disabled:opacity-50"
              >
                <span className="text-sm"> Pay with Apple Pay</span>
              </button>
              <button
                onClick={() => handleWalletPayment("Google Pay")}
                disabled={processing || success}
                className="w-full h-13 bg-[#1e1e1e] hover:bg-black text-white border border-white/10 font-bold rounded-xl flex items-center justify-center gap-2.5 cursor-pointer transition disabled:opacity-50"
              >
                <div className="h-4 w-4 bg-white rounded-full flex items-center justify-center shrink-0">
                  <span className="text-black font-bold text-[10px]">G</span>
                </div>
                <span className="text-sm">Pay with Google Pay</span>
              </button>
            </div>
          )}

          <div className="flex items-center justify-center gap-2 mt-8 pt-6 border-t border-white/5 text-3xs text-gray-500 font-semibold uppercase tracking-wider">
            <ShieldCheck className="text-green-500 w-4 h-4" />
            <span>SSL Secured Checkout Vault</span>
          </div>
        </div>
      </div>

      {/* RIGHT: ORDER SUMMARY COLUMN */}
      <div className="lg:col-span-2 space-y-6">
        <div className="rounded-[35px] border border-white/10 bg-[#0c192e]/85 p-6 backdrop-blur-xl shadow-2xl">
          <h3 className="text-lg font-bold border-b border-white/5 pb-4 mb-4 text-[#e68932]">
            {t("Order Summary")}
          </h3>

          <div className="space-y-4">
            <div className="p-4 rounded-2xl border border-white/5 bg-black/25">
              <p className="text-3xs text-gray-400 font-semibold uppercase tracking-wider">
                {type === "package" ? t("Holiday Packages") : t("Visa Services")}
              </p>
              <h4 className="font-bold text-sm text-white mt-1 leading-relaxed">
                {itemDetails.title}
              </h4>
              <p className="text-2xs text-gray-400 mt-2 flex items-center gap-1.5 font-medium">
                <Calendar size={12} className="text-[#e68932]" />
                {itemDetails.duration}
              </p>
            </div>

            <div className="space-y-2 text-xs border-t border-white/5 pt-4">
              <div className="flex justify-between font-semibold">
                <span className="text-gray-400">{t("Subtotal")}</span>
                <span>{itemDetails.price}</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span className="text-gray-400">VAT (5%)</span>
                <span>AED 0.00</span>
              </div>
              <div className="flex justify-between text-sm font-bold border-t border-white/5 pt-3 mt-2">
                <span className="text-white">{t("Total")}</span>
                <span className="text-[#e68932]">{itemDetails.price}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Security assurance info card */}
        <div className="rounded-2xl border border-white/5 bg-[#0b1426]/50 p-5 text-left rtl:text-right">
          <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-green-500" />
            Cancellation Policy
          </h4>
          <p className="text-3xs text-gray-500 mt-2 leading-relaxed font-medium">
            Holiday packages cancellations allowed up to 7 days before departure. Visa processing fees are non-refundable once documents are submitted to embassies.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <main className="bg-[#071120] text-white min-h-screen pt-28 pb-16">
      <Suspense fallback={
        <div className="flex h-[70vh] items-center justify-center">
          <Loader2 className="w-8 h-8 text-[#e68932] animate-spin" />
        </div>
      }>
        <CheckoutContent />
      </Suspense>
      <Footer />
    </main>
  );
}
