"use client";

import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function VisaCheckerPage() {
    const [nationality, setNationality] = useState("");
    const [destination, setDestination] = useState("");
    const [purpose, setPurpose] = useState("");
    
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);

    const handleCheck = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!nationality || !destination || !purpose) {
            alert("Please fill in all fields.");
            return;
        }

        setLoading(true);
        setResult(null);

        // Simulate AI Processing Delay
        setTimeout(() => {
            // Mock AI Response based on inputs
            const isUae = destination.toLowerCase().includes("uae") || destination.toLowerCase().includes("dubai");
            const isUsOrEu = nationality.toLowerCase().includes("us") || nationality.toLowerCase().includes("uk") || nationality.toLowerCase().includes("europe");
            
            let eligibility = "Visa Required";
            let likelihood = "High (85%)";
            let requirements = [
                "Valid Passport (6 months validity)",
                "Recent Passport-sized Photographs",
                "Completed Visa Application Form",
                "Proof of Accommodation",
                "Return Flight Ticket"
            ];

            if (isUae && isUsOrEu) {
                eligibility = "Visa on Arrival";
                likelihood = "Guaranteed (99%)";
                requirements = ["Valid Passport (6 months validity)", "Return Flight Ticket"];
            } else if (purpose.toLowerCase().includes("work")) {
                likelihood = "Moderate (60%)";
                requirements.push("Employment Contract / Offer Letter");
                requirements.push("Company Trade License Copy");
            }

            setResult({
                eligibility,
                likelihood,
                requirements,
                message: `Based on your nationality (${nationality}), traveling to ${destination} for ${purpose}, here is your AI-generated visa assessment.`
            });

            setLoading(false);
        }, 2500);
    };

    return (
        <main className="bg-[#071120] text-white min-h-screen">
            <Navbar />

            <section className="max-w-7xl mx-auto px-6 py-24 grid lg:grid-cols-2 gap-16">
                
                {/* FORM SIDE */}
                <div>
                    <p className="uppercase tracking-[4px] text-[#e68932] font-semibold text-sm">Powered by AI</p>
                    <h1 className="text-5xl font-bold text-white mt-4 leading-tight">
                        Instant Visa <br /> Eligibility Checker
                    </h1>
                    <p className="mt-6 text-gray-400 text-lg leading-relaxed">
                        Enter your travel details below and our AI engine will instantly determine your visa requirements, required documents, and approval likelihood.
                    </p>

                    <form onSubmit={handleCheck} className="mt-12 space-y-6 bg-white/5 border border-white/10 p-8 rounded-[32px]">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Your Nationality</label>
                            <input
                                type="text"
                                value={nationality}
                                onChange={(e) => setNationality(e.target.value)}
                                placeholder="e.g. Indian, British, American"
                                className="w-full h-14 rounded-2xl border border-white/10 bg-black/40 px-5 text-white outline-none transition focus:border-[#e68932]"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Destination Country</label>
                            <input
                                type="text"
                                value={destination}
                                onChange={(e) => setDestination(e.target.value)}
                                placeholder="e.g. UAE, Japan, Schengen"
                                className="w-full h-14 rounded-2xl border border-white/10 bg-black/40 px-5 text-white outline-none transition focus:border-[#e68932]"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Purpose of Travel</label>
                            <select
                                value={purpose}
                                onChange={(e) => setPurpose(e.target.value)}
                                className="w-full h-14 rounded-2xl border border-white/10 bg-black/40 px-5 text-white outline-none transition focus:border-[#e68932] appearance-none"
                            >
                                <option value="" className="text-black">Select Purpose</option>
                                <option value="Tourism" className="text-black">Tourism</option>
                                <option value="Business" className="text-black">Business / Work</option>
                                <option value="Transit" className="text-black">Transit</option>
                                <option value="Study" className="text-black">Study</option>
                            </select>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-14 mt-4 rounded-2xl bg-[#e68932] text-lg font-semibold text-white transition hover:scale-[1.02] disabled:opacity-60 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
                                    Analyzing Profile...
                                </>
                            ) : "Check Eligibility"}
                        </button>
                    </form>
                </div>

                {/* RESULTS SIDE */}
                <div className="flex flex-col justify-center">
                    {!result && !loading && (
                        <div className="h-full border-2 border-dashed border-white/10 rounded-[32px] flex items-center justify-center p-10 text-center text-gray-500">
                            Your AI assessment results will appear here.
                        </div>
                    )}

                    {loading && (
                        <div className="h-full border border-white/10 bg-white/5 rounded-[32px] flex flex-col items-center justify-center p-10 text-center space-y-6 animate-pulse">
                            <div className="h-16 w-16 bg-white/10 rounded-full animate-bounce"></div>
                            <p className="text-gray-300 text-lg">Cross-referencing global immigration policies...</p>
                        </div>
                    )}

                    {result && !loading && (
                        <div className="h-full border border-white/10 bg-gradient-to-br from-white/10 to-transparent rounded-[32px] p-10 shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#e68932] to-yellow-500"></div>
                            
                            <h2 className="text-3xl font-bold text-white mb-2">Assessment Complete</h2>
                            <p className="text-gray-400 text-sm">{result.message}</p>
                            
                            <div className="mt-8 space-y-6">
                                <div className="bg-black/30 p-5 rounded-2xl border border-white/5">
                                    <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Visa Type</p>
                                    <p className="text-2xl font-bold text-[#e68932]">{result.eligibility}</p>
                                </div>
                                
                                <div className="bg-black/30 p-5 rounded-2xl border border-white/5">
                                    <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Approval Likelihood</p>
                                    <p className="text-xl font-bold text-green-400">{result.likelihood}</p>
                                </div>
                                
                                <div className="bg-black/30 p-5 rounded-2xl border border-white/5">
                                    <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-3">Required Documents</p>
                                    <ul className="space-y-2">
                                        {result.requirements.map((req: string, idx: number) => (
                                            <li key={idx} className="flex items-start gap-2 text-sm text-gray-300">
                                                <span className="text-[#e68932] mt-0.5">✓</span> {req}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                            
                            <button onClick={() => window.location.href = "/contact"} className="w-full h-12 mt-8 rounded-xl bg-white/10 text-white font-semibold transition hover:bg-white/20 border border-white/10">
                                Consult an Expert
                            </button>
                        </div>
                    )}
                </div>

            </section>

            <Footer />
        </main>
    );
}