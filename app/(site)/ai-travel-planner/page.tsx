"use client";

import { useState } from "react";
import Footer from "@/components/layout/Footer";

export default function AiTravelPlannerPage() {
    const [destination, setDestination] = useState("");
    const [duration, setDuration] = useState("");
    const [budget, setBudget] = useState("Medium");
    const [interests, setInterests] = useState("");
    
    const [loading, setLoading] = useState(false);
    const [itinerary, setItinerary] = useState<any[]>([]);

    const handlePlan = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!destination || !duration || !interests) {
            alert("Please fill in all fields.");
            return;
        }

        setLoading(true);
        setItinerary([]);

        // Simulate AI Processing Delay
        setTimeout(() => {
            const numDays = parseInt(duration) || 3;
            const generatedItinerary = [];
            
            for (let i = 1; i <= Math.min(numDays, 7); i++) {
                generatedItinerary.push({
                    day: i,
                    title: `Day ${i}: Exploring ${destination}`,
                    morning: `Visit top historical landmarks and enjoy a local breakfast matching a ${budget} budget. Focus on ${interests}.`,
                    afternoon: `Experience local culture, guided tour, and authentic lunch.`,
                    evening: `Relaxing evening walk, sunset viewing, and dinner at a recommended local spot.`,
                });
            }

            setItinerary(generatedItinerary);
            setLoading(false);
        }, 3000);
    };

    return (
        <main className="bg-[#071120] text-white min-h-screen">
            
            {/* HERO */}
            <section className="pt-32 pb-16 px-6 text-center max-w-4xl mx-auto">
                <p className="uppercase tracking-[4px] text-[#00C2FF] font-semibold text-sm">Powered by AI</p>
                <h1 className="text-5xl md:text-6xl font-bold text-white mt-6 leading-tight">
                    Smart Travel Planner
                </h1>
                <p className="mt-6 text-gray-400 text-lg md:text-xl leading-relaxed">
                    Generate a personalized, day-by-day itinerary instantly. Just tell us where you want to go and what you love doing.
                </p>
            </section>

            {/* MAIN CONTENT */}
            <section className="max-w-7xl mx-auto px-6 pb-24 grid lg:grid-cols-12 gap-10">
                
                {/* FORM PANEL */}
                <div className="lg:col-span-4 bg-white/5 border border-white/10 p-8 rounded-[32px] h-fit sticky top-24">
                    <h2 className="text-2xl font-bold mb-8">Trip Details</h2>
                    <form onSubmit={handlePlan} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Destination</label>
                            <input
                                type="text"
                                value={destination}
                                onChange={(e) => setDestination(e.target.value)}
                                placeholder="e.g. Dubai, Paris, Tokyo"
                                className="w-full h-14 rounded-2xl border border-white/10 bg-black/40 px-5 text-white outline-none transition focus:border-[#00C2FF]"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Duration (Days)</label>
                            <input
                                type="number"
                                min="1"
                                max="14"
                                value={duration}
                                onChange={(e) => setDuration(e.target.value)}
                                placeholder="e.g. 5"
                                className="w-full h-14 rounded-2xl border border-white/10 bg-black/40 px-5 text-white outline-none transition focus:border-[#00C2FF]"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Budget Level</label>
                            <select
                                value={budget}
                                onChange={(e) => setBudget(e.target.value)}
                                className="w-full h-14 rounded-2xl border border-white/10 bg-black/40 px-5 text-white outline-none transition focus:border-[#00C2FF] appearance-none"
                            >
                                <option value="Budget" className="text-black">Budget Friendly</option>
                                <option value="Medium" className="text-black">Moderate</option>
                                <option value="Luxury" className="text-black">Luxury & Premium</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Interests</label>
                            <textarea
                                value={interests}
                                onChange={(e) => setInterests(e.target.value)}
                                placeholder="e.g. History, Food, Shopping, Adventure"
                                className="w-full h-28 rounded-2xl border border-white/10 bg-black/40 p-5 text-white outline-none transition focus:border-[#00C2FF] resize-none"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-14 mt-4 rounded-2xl bg-[#00C2FF] text-black text-lg font-semibold transition hover:scale-[1.02] disabled:opacity-60 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <span className="animate-spin h-5 w-5 border-2 border-black border-t-transparent rounded-full"></span>
                                    Generating...
                                </>
                            ) : "Generate Itinerary"}
                        </button>
                    </form>
                </div>

                {/* RESULTS PANEL */}
                <div className="lg:col-span-8">
                    {!loading && itinerary.length === 0 && (
                        <div className="h-[600px] border-2 border-dashed border-white/10 rounded-[32px] flex flex-col items-center justify-center p-10 text-center text-gray-500">
                            <div className="text-6xl mb-4">🗺️</div>
                            <h3 className="text-2xl font-bold text-gray-400 mb-2">Your Itinerary Awaits</h3>
                            <p className="max-w-md mx-auto">Fill out your trip details on the left, and our AI will craft the perfect daily schedule for you.</p>
                        </div>
                    )}

                    {loading && (
                        <div className="h-[600px] border border-white/10 bg-white/5 rounded-[32px] flex flex-col items-center justify-center p-10 text-center space-y-8 animate-pulse">
                            <div className="grid grid-cols-2 gap-4 w-full max-w-lg">
                                <div className="h-24 bg-white/5 rounded-2xl animate-pulse delay-75"></div>
                                <div className="h-24 bg-white/5 rounded-2xl animate-pulse delay-150"></div>
                                <div className="h-24 bg-white/5 rounded-2xl animate-pulse delay-200"></div>
                                <div className="h-24 bg-white/5 rounded-2xl animate-pulse delay-300"></div>
                            </div>
                            <p className="text-[#00C2FF] text-lg font-medium">Curating hidden gems and optimizing routes...</p>
                        </div>
                    )}

                    {!loading && itinerary.length > 0 && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between bg-gradient-to-r from-[#00C2FF]/20 to-transparent p-8 rounded-3xl border border-[#00C2FF]/30">
                                <div>
                                    <h2 className="text-3xl font-bold text-white">Trip to {destination}</h2>
                                    <p className="text-[#00C2FF] mt-1">{duration} Days • {budget} Budget</p>
                                </div>
                                <button onClick={() => window.location.href = "/contact"} className="px-6 py-3 bg-[#00C2FF] text-black font-semibold rounded-xl hover:opacity-90">
                                    Book This Trip
                                </button>
                            </div>

                            {itinerary.map((day, idx) => (
                                <div key={idx} className="bg-white/5 border border-white/10 rounded-3xl p-8 hover:border-white/20 transition duration-300">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="h-12 w-12 rounded-full bg-[#00C2FF] text-black flex items-center justify-center font-bold text-xl shadow-[0_0_15px_rgba(0,194,255,0.4)]">
                                            {day.day}
                                        </div>
                                        <h3 className="text-2xl font-bold text-white">{day.title}</h3>
                                    </div>
                                    
                                    <div className="space-y-6 pl-16">
                                        <div className="relative before:absolute before:left-[-35px] before:top-2 before:w-3 before:h-3 before:bg-yellow-500 before:rounded-full">
                                            <p className="text-sm text-yellow-500 font-semibold mb-1 uppercase tracking-wider">Morning</p>
                                            <p className="text-gray-300 leading-relaxed">{day.morning}</p>
                                        </div>
                                        <div className="relative before:absolute before:left-[-35px] before:top-2 before:w-3 before:h-3 before:bg-orange-500 before:rounded-full">
                                            <p className="text-sm text-orange-500 font-semibold mb-1 uppercase tracking-wider">Afternoon</p>
                                            <p className="text-gray-300 leading-relaxed">{day.afternoon}</p>
                                        </div>
                                        <div className="relative before:absolute before:left-[-35px] before:top-2 before:w-3 before:h-3 before:bg-indigo-500 before:rounded-full">
                                            <p className="text-sm text-indigo-400 font-semibold mb-1 uppercase tracking-wider">Evening</p>
                                            <p className="text-gray-300 leading-relaxed">{day.evening}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </section>

            <Footer />
        </main>
    );
}