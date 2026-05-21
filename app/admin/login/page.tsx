"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import {
    signInWithEmailAndPassword,
} from "firebase/auth";

import {
    auth,
} from "../../../lib/firebase";

export default function AdminLoginPage() {
    const router = useRouter();

    const [email, setEmail] = useState("");

    const [password, setPassword] = useState("");

    const [loading, setLoading] = useState(false);

    async function handleLogin(
        e: React.FormEvent
    ) {
        e.preventDefault();

        try {
            setLoading(true);

            await signInWithEmailAndPassword(
                auth,
                email,
                password
            );

            router.push("/admin/dashboard");

        } catch (error) {
            console.log(error);

            alert("Invalid credentials");
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="flex min-h-screen items-center justify-center bg-[#071120] px-6">

            <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-8">

                <h1 className="text-3xl font-bold text-white">
                    Admin Login
                </h1>

                <p className="mt-2 text-gray-400">
                    Sign in to Tourism CRM
                </p>

                <form
                    onSubmit={handleLogin}
                    className="mt-8 space-y-5"
                >

                    <input
                        type="email"
                        placeholder="Admin Email"
                        value={email}
                        onChange={(e) =>
                            setEmail(e.target.value)
                        }
                        className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none"
                    />

                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) =>
                            setPassword(e.target.value)
                        }
                        className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none"
                    />

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-xl bg-[#e68932] py-3 font-semibold text-white"
                    >
                        {loading
                            ? "Signing In..."
                            : "Login"}
                    </button>

                </form>

            </div>

        </main>
    );
}