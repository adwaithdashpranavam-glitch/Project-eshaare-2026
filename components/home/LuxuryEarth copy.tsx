"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// IMPORTANT FIX FOR NEXT.JS 15 + TURBOPACK
const Globe = dynamic(
  () => import("react-globe.gl").then((mod) => mod.default),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-black text-white">
        Loading Earth...
      </div>
    ),
  }
);

const countries = [
  {
    id: "Japan",
    lat: 36.2048,
    lng: 138.2529,
    color: "#ff7b00",
    destinations: [
      {
        name: "Tokyo",
        image:
          "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=1200&auto=format&fit=crop",
      },
      {
        name: "Mount Fuji",
        image:
          "https://images.unsplash.com/photo-1570459027562-4a916cc6113f?q=80&w=1200&auto=format&fit=crop",
      },
      {
        name: "Kyoto",
        image:
          "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=1200&auto=format&fit=crop",
      },
    ],
  },
  {
    id: "Switzerland",
    lat: 46.8182,
    lng: 8.2275,
    color: "#00bcd4",
    destinations: [
      {
        name: "Zermatt",
        image:
          "https://images.unsplash.com/photo-1521295121783-8a321d551ad2?q=80&w=1200&auto=format&fit=crop",
      },
      {
        name: "Interlaken",
        image:
          "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1200&auto=format&fit=crop",
      },
    ],
  },
  {
    id: "Maldives",
    lat: 3.2028,
    lng: 73.2207,
    color: "#00e5ff",
    destinations: [
      {
        name: "Male",
        image:
          "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?q=80&w=1200&auto=format&fit=crop",
      },
      {
        name: "Vaadhoo Island",
        image:
          "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200&auto=format&fit=crop",
      },
    ],
  },
];

export default function LuxuryEarth() {
  const globeRef = useRef<any>(null);

  const [selectedCountry, setSelectedCountry] = useState(countries[0]);

  useEffect(() => {
    if (!globeRef.current) return;

    const controls = globeRef.current.controls();

    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.35;

    globeRef.current.pointOfView(
      {
        lat: 20,
        lng: 0,
        altitude: 2.5,
      },
      0
    );
  }, []);

  const handleCountrySelect = (country: any) => {
    setSelectedCountry(country);

    if (!globeRef.current) return;

    globeRef.current.pointOfView(
      {
        lat: country.lat,
        lng: country.lng,
        altitude: 1.5,
      },
      2000
    );
  };

  return (
    <section className="relative h-screen w-full overflow-hidden bg-black text-white">
      {/* Background Glow */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_top,rgba(0,119,255,0.25),transparent_40%),radial-gradient(circle_at_bottom,rgba(255,119,0,0.2),transparent_30%)]" />

      {/* LEFT SIDEBAR */}
      <div className="absolute left-0 top-0 z-20 h-full w-full overflow-y-auto border-r border-white/10 bg-white/5 backdrop-blur-xl lg:w-[420px]">
        <div className="p-6">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-4xl font-bold leading-tight"
          >
            Explore The World
          </motion.h1>

          <p className="mt-4 text-sm leading-relaxed text-white/70">
            Select a destination from the Earth and discover premium luxury
            travel experiences.
          </p>

          {/* COUNTRY BUTTONS */}
          <div className="mt-8 space-y-3">
            {countries.map((country) => (
              <button
                key={country.id}
                onClick={() => handleCountrySelect(country)}
                className={`w-full rounded-2xl border px-5 py-4 text-left transition-all duration-300 ${selectedCountry.id === country.id
                  ? "border-orange-400 bg-orange-500/20"
                  : "border-white/10 bg-white/5 hover:bg-white/10"
                  }`}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">{country.id}</h3>

                  <div
                    className="h-3 w-3 rounded-full"
                    style={{
                      backgroundColor: country.color,
                    }}
                  />
                </div>
              </button>
            ))}
          </div>

          {/* DESTINATIONS */}
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedCountry.id}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.5 }}
              className="mt-10"
            >
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-2xl font-bold">
                  {selectedCountry.id}
                </h2>

                <button className="rounded-full bg-orange-500 px-4 py-2 text-sm font-semibold transition-all hover:bg-orange-400">
                  Explore
                </button>
              </div>

              <div className="space-y-5">
                {selectedCountry.destinations.map((destination) => (
                  <motion.div
                    whileHover={{ y: -5 }}
                    key={destination.name}
                    className="group overflow-hidden rounded-3xl border border-white/10 bg-white/5"
                  >
                    <div className="relative h-52 overflow-hidden">
                      <img
                        src={destination.image}
                        alt={destination.name}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />

                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent" />

                      <div className="absolute bottom-4 left-4">
                        <h3 className="text-xl font-semibold">
                          {destination.name}
                        </h3>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* GLOBE */}
      <div className="absolute right-0 top-0 z-10 h-full w-full lg:w-[calc(100%-420px)]">
        <Globe
          ref={globeRef}
          width={window.innerWidth}
          height={window.innerHeight}
          globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
          bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
          backgroundColor="rgba(0,0,0,0)"
          atmosphereColor="#3a82ff"
          atmosphereAltitude={0.25}
          animateIn={true}
          labelsData={countries.map((country) => ({
            lat: country.lat,
            lng: country.lng,
            text: country.id,
            color:
              selectedCountry.id === country.id
                ? "#ff7b00"
                : "#ffffff",
          }))}
          labelText="text"
          labelSize={1.5}
          labelDotRadius={0.4}
          labelColor={(d: any) => d.color}
          onLabelClick={(label: any) => {
            const country = countries.find(
              (c) => c.id === label.text
            );

            if (country) {
              handleCountrySelect(country);
            }
          }}
          arcsData={[
            {
              startLat: selectedCountry.lat,
              startLng: selectedCountry.lng,
              endLat: 25.2048,
              endLng: 55.2708,
              color: ["#ff7b00", "#ffffff"],
            },
          ]}
          arcDashLength={0.4}
          arcDashGap={4}
          arcDashAnimateTime={1500}
        />
      </div>

      {/* DARK OVERLAY */}
      <div className="pointer-events-none absolute inset-0 z-30 bg-[radial-gradient(circle_at_center,transparent_45%,rgba(0,0,0,0.8)_100%)]" />
    </section>
  );
}