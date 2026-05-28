"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail, 
  updateProfile,
  setPersistence,
  browserLocalPersistence
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import Footer from "@/components/layout/Footer";
import { Mail, Lock, Phone, User, KeyRound, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Tabs: "signin" | "signup" | "forgot"
  const [tab, setTab] = useState<"signin" | "signup" | "forgot">("signin");
  
  // Form State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  
  // Status State
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    if (searchParams.get("expired") === "true") {
      setErrorMsg("Your session expired due to inactivity. Please log in again.");
    }
  }, [searchParams]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg("Please enter email and password.");
      return;
    }

    try {
      setLoading(true);
      setErrorMsg("");
      setSuccessMsg("");

      // Set persistence explicitly to LOCAL
      await setPersistence(auth, browserLocalPersistence);
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Update lastActive timestamp
      localStorage.setItem("lastActive", Date.now().toString());

      setSuccessMsg("Logged in successfully!");
      setTimeout(() => {
        router.push("/dashboard");
      }, 1000);

    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !name || !phone) {
      setErrorMsg("Please fill out all registration fields.");
      return;
    }

    try {
      setLoading(true);
      setErrorMsg("");
      setSuccessMsg("");

      // Set persistence explicitly to LOCAL
      await setPersistence(auth, browserLocalPersistence);

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update Auth Profile
      await updateProfile(user, {
        displayName: name
      });

      // Write User Document in Firestore
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        name: name,
        email: email.toLowerCase().trim(),
        phone: phone.trim(),
        role: "client",
        createdAt: serverTimestamp(),
        lastActive: serverTimestamp()
      });

      // Set active session timestamp
      localStorage.setItem("lastActive", Date.now().toString());

      setSuccessMsg("Account created successfully!");
      setTimeout(() => {
        router.push("/dashboard");
      }, 1200);

    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Failed to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrorMsg("Please enter your registered email address.");
      return;
    }

    try {
      setLoading(true);
      setErrorMsg("");
      setSuccessMsg("");

      await sendPasswordResetEmail(auth, email);
      setSuccessMsg("A secure password reset link has been emailed to you!");
      setEmail("");
      
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Error sending password reset. Please verify your email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-[85vh] flex items-center justify-center px-4 py-20 z-10">
      {/* GLOWING AMBIENT BACKGROUND DECOR */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-blue-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 rounded-full bg-orange-500/10 blur-[120px] pointer-events-none" />

      <div className="relative w-full max-w-lg rounded-[35px] border border-white/10 bg-[#0c192e]/85 shadow-2xl p-8 backdrop-blur-xl overflow-hidden">
        
        {/* Title */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            {tab === "signin" && "Welcome Back"}
            {tab === "signup" && "Create Client Account"}
            {tab === "forgot" && "Reset Password"}
          </h2>
          <p className="text-sm text-gray-400 mt-2 font-medium">
            {tab === "signin" && "Sign in to manage your bookings and visas"}
            {tab === "signup" && "Join us to explore premium travel packages"}
            {tab === "forgot" && "Enter your email to receive a secure recovery link"}
          </p>
        </div>

        {/* Form Status Messages */}
        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 text-sm flex items-start gap-2.5 animate-in fade-in slide-in-from-top-1">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-6 p-4 rounded-xl border border-green-500/20 bg-green-500/10 text-green-400 text-sm flex items-start gap-2.5 animate-in fade-in slide-in-from-top-1">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Tab Toggle buttons (only show if not in forgot password mode) */}
        {tab !== "forgot" && (
          <div className="grid grid-cols-2 p-1 rounded-xl bg-black/40 border border-white/5 mb-6">
            <button
              onClick={() => {
                setTab("signin");
                setErrorMsg("");
                setSuccessMsg("");
              }}
              className={`py-2 rounded-lg text-sm font-semibold transition ${
                tab === "signin" 
                  ? "bg-[#e68932] text-white shadow-md" 
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setTab("signup");
                setErrorMsg("");
                setSuccessMsg("");
              }}
              className={`py-2 rounded-lg text-sm font-semibold transition ${
                tab === "signup" 
                  ? "bg-[#e68932] text-white shadow-md" 
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Sign Up
            </button>
          </div>
        )}

        {/* SIGN IN FORM */}
        {tab === "signin" && (
          <form onSubmit={handleSignIn} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400">Email Address</label>
              <div className="flex items-center h-12 rounded-xl border border-white/10 bg-black/35 px-4 focus-within:border-[#e68932] transition">
                <Mail className="text-gray-400 mr-3 w-5 h-5" />
                <input
                  type="email"
                  placeholder="name@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-transparent text-white outline-none w-full text-sm placeholder:text-gray-600"
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400">Password</label>
                <button
                  type="button"
                  onClick={() => {
                    setTab("forgot");
                    setErrorMsg("");
                    setSuccessMsg("");
                  }}
                  className="text-xs text-[#e68932] hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="flex items-center h-12 rounded-xl border border-white/10 bg-black/35 px-4 focus-within:border-[#e68932] transition">
                <Lock className="text-gray-400 mr-3 w-5 h-5" />
                <input
                  type="password"
                  placeholder="••••••••"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-transparent text-white outline-none w-full text-sm placeholder:text-gray-600"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl bg-[#e68932] text-white font-bold hover:bg-[#cf7726] transition flex items-center justify-center gap-2 mt-6 cursor-pointer shadow-lg disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign In"}
            </button>
          </form>
        )}

        {/* SIGN UP FORM */}
        {tab === "signup" && (
          <form onSubmit={handleSignUp} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400">Full Name</label>
              <div className="flex items-center h-12 rounded-xl border border-white/10 bg-black/35 px-4 focus-within:border-[#e68932] transition">
                <User className="text-gray-400 mr-3 w-5 h-5" />
                <input
                  type="text"
                  placeholder="John Doe"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-transparent text-white outline-none w-full text-sm placeholder:text-gray-600"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400">Email Address</label>
              <div className="flex items-center h-12 rounded-xl border border-white/10 bg-black/35 px-4 focus-within:border-[#e68932] transition">
                <Mail className="text-gray-400 mr-3 w-5 h-5" />
                <input
                  type="email"
                  placeholder="john@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-transparent text-white outline-none w-full text-sm placeholder:text-gray-600"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400">Phone Number</label>
              <div className="flex items-center h-12 rounded-xl border border-white/10 bg-black/35 px-4 focus-within:border-[#e68932] transition">
                <Phone className="text-gray-400 mr-3 w-5 h-5" />
                <input
                  type="tel"
                  placeholder="+971 50 123 4567"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="bg-transparent text-white outline-none w-full text-sm placeholder:text-gray-600"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400">Password</label>
              <div className="flex items-center h-12 rounded-xl border border-white/10 bg-black/35 px-4 focus-within:border-[#e68932] transition">
                <Lock className="text-gray-400 mr-3 w-5 h-5" />
                <input
                  type="password"
                  placeholder="Min 6 characters"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-transparent text-white outline-none w-full text-sm placeholder:text-gray-600"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl bg-[#e68932] text-white font-bold hover:bg-[#cf7726] transition flex items-center justify-center gap-2 mt-6 cursor-pointer shadow-lg disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Create Account"}
            </button>
          </form>
        )}

        {/* FORGOT PASSWORD FORM */}
        {tab === "forgot" && (
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400">Email Address</label>
              <div className="flex items-center h-12 rounded-xl border border-white/10 bg-black/35 px-4 focus-within:border-[#e68932] transition">
                <Mail className="text-gray-400 mr-3 w-5 h-5" />
                <input
                  type="email"
                  placeholder="name@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-transparent text-white outline-none w-full text-sm placeholder:text-gray-600"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() => {
                  setTab("signin");
                  setErrorMsg("");
                  setSuccessMsg("");
                }}
                className="w-1/3 h-12 rounded-xl border border-white/15 text-white font-semibold hover:bg-white/5 transition flex items-center justify-center cursor-pointer"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-2/3 h-12 rounded-xl bg-[#e68932] text-white font-bold hover:bg-[#cf7726] transition flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Send Reset Link"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="bg-[#071120] text-white min-h-screen pt-28">
      <Suspense fallback={
        <div className="flex h-[70vh] items-center justify-center">
          <Loader2 className="w-8 h-8 text-[#e68932] animate-spin" />
        </div>
      }>
        <LoginContent />
      </Suspense>
      <Footer />
    </main>
  );
}