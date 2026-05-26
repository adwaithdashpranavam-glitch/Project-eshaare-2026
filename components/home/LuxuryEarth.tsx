"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as THREE from "three";
import Link from "next/link";
import countriesGeoJson from "@/data/countries.geo.json";
import countryLabelsData from "@/data/country-labels.json";
import citiesData from "@/data/world-cities.json";

const countryLabels = countryLabelsData as any[];
const cities = citiesData as any[];
const countriesGeo = countriesGeoJson as any;

// GLOBE
const Globe = dynamic(
  () => import("react-globe.gl").then((mod) => mod.default),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-screen items-center justify-center bg-black text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#e68932] border-t-transparent"></div>
          <p className="text-sm font-medium text-gray-400">Loading Earth...</p>
        </div>
      </div>
    ),
  }
);

// Countries Mappings & Content for regional zoom cards
const countries = [
  {
    id: "UAE",
    lat: 23.4241,
    lng: 53.8478,
    color: "#ff3366",
    destinations: [
      {
        name: "Burj Khalifa",
        image: "https://images.unsplash.com/photo-1582672060674-bc2bd808a8b5?q=80&w=1200&auto=format&fit=crop",
      },
      {
        name: "Palm Jumeirah",
        image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=1200&auto=format&fit=crop",
      },
      {
        name: "Desert Safari Dubai",
        image: "https://images.unsplash.com/photo-1473580044384-7ba9967e16a0?q=80&w=1200&auto=format&fit=crop",
      }
    ]
  },
  {
    id: "Japan",
    lat: 36.2048,
    lng: 138.2529,
    color: "#ff7b00",
    destinations: [
      {
        name: "Tokyo (Shibuya)",
        image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=1200&auto=format&fit=crop",
      },
      {
        name: "Kyoto Kinkaku-ji",
        image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=1200&auto=format&fit=crop",
      },
    ],
  },
  {
    id: "Switzerland",
    lat: 46.8182,
    lng: 8.2275,
    color: "#00c2ff",
    destinations: [
      {
        name: "Interlaken & Jungfrau",
        image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1200&auto=format&fit=crop",
      },
    ],
  },
  {
    id: "India",
    lat: 20.5937,
    lng: 78.9629,
    color: "#00ff99",
    destinations: [
      {
        name: "Kerala Backwaters",
        image: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?q=80&w=1200&auto=format&fit=crop",
      },
    ],
  },
];

// Curated Tourist Points of Interest (POIs) - visible at closer LOD
const POIs = [
  {
    name: "Burj Khalifa",
    lat: 25.1972,
    lng: 55.2744,
    country: "UAE",
    image: "https://images.unsplash.com/photo-1582672060674-bc2bd808a8b5?q=80&w=1200&auto=format&fit=crop",
    desc: "The world's tallest building, climbing 828 meters above Dubai's skyline."
  },
  {
    name: "Palm Jumeirah",
    lat: 25.1124,
    lng: 55.1390,
    country: "UAE",
    image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=1200&auto=format&fit=crop",
    desc: "The iconic palm tree-shaped archipelago containing high-end resorts and residences."
  },
  {
    name: "Desert Safari Dubai",
    lat: 25.0234,
    lng: 55.2890,
    country: "UAE",
    image: "https://images.unsplash.com/photo-1473580044384-7ba9967e16a0?q=80&w=1200&auto=format&fit=crop",
    desc: "Experience red dunes bashing, camel riding, and traditional Arabian dinners under the stars."
  },
  {
    name: "Tokyo (Shibuya)",
    lat: 35.6580,
    lng: 139.7016,
    country: "Japan",
    image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=1200&auto=format&fit=crop",
    desc: "The electric heart of Tokyo featuring futuristic lights and the world-famous Shibuya scramble."
  },
  {
    name: "Kyoto Kinkaku-ji",
    lat: 35.0394,
    lng: 135.7292,
    country: "Japan",
    image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=1200&auto=format&fit=crop",
    desc: "The gorgeous Zen Buddhist Golden Pavilion temple, reflecting off the mirror pond."
  },
  {
    name: "Interlaken & Jungfrau",
    lat: 46.6863,
    lng: 7.8632,
    country: "Switzerland",
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1200&auto=format&fit=crop",
    desc: "Stunning Swiss resort town nestled between Alpine lakes with views of the Jungfrau peak."
  },
  {
    name: "Kerala Backwaters",
    lat: 9.4981,
    lng: 76.3388,
    country: "India",
    image: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?q=80&w=1200&auto=format&fit=crop",
    desc: "Cruise serene palm-fringed lagoons and canals aboard a traditional luxury houseboat."
  }
];

export default function LuxuryEarth() {
  const globeRef = useRef<any>(null);

  const [dimensions, setDimensions] = useState({
    width: 1200,
    height: 800,
  });

  const [selectedCountry, setSelectedCountry] = useState<any>(null);
  const [selectedPOI, setSelectedPOI] = useState<any>(null);
  
  // Level of Detail (LOD) Zoom Tier
  const [zoomTier, setZoomTier] = useState<"space" | "regional" | "poi">("space");

  // RESIZE
  useEffect(() => {
    const resize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  // GLOBE SETTINGS & ZOOM ALTITUDE LISTENER
  useEffect(() => {
    if (!globeRef.current) return;

    const globe = globeRef.current;

    // Initial Camera position focused on UAE/India region
    globe.pointOfView(
      {
        lat: 23.4,
        lng: 70.0,
        altitude: 2.2,
      },
      0
    );

    // Controls configurations for damping and speed
    const controls = globe.controls();
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.22;
    controls.minDistance = 100;
    controls.maxDistance = 450;

    // LOD Altitude checks on camera change
    controls.addEventListener("change", () => {
      const altitude = globe.pointOfView().altitude;
      
      if (altitude >= 1.7) {
        setZoomTier("space");
      } else if (altitude >= 1.15) {
        setZoomTier("regional");
      } else {
        setZoomTier("poi");
      }
    });

    // Scene & light modifications
    const scene = globe.scene();
    scene.children.forEach((obj: any) => {
      if (obj.type === "DirectionalLight") {
        obj.intensity = 2.2;
      }
    });

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.65);
    scene.add(ambientLight);

    // Load clouds texture overlay
    const CLOUDS_IMG_URL = "//unpkg.com/three-globe/example/img/earth-clouds.png";
    const CLOUDS_ALT = 0.005;

    new THREE.TextureLoader().load(
      CLOUDS_IMG_URL,
      (cloudsTexture) => {
        const clouds = new THREE.Mesh(
          new THREE.SphereGeometry(
            globe.getGlobeRadius() * (1 + CLOUDS_ALT),
            75,
            75
          ),
          new THREE.MeshPhongMaterial({
            map: cloudsTexture,
            transparent: true,
          })
        );

        globe.scene().add(clouds);

        const rotateClouds = () => {
          clouds.rotation.y += 0.00035;
          requestAnimationFrame(rotateClouds);
        };
        rotateClouds();
      }
    );
  }, []);

  // Actions when selecting a Country
  const handleCountrySelect = (country: any) => {
    setSelectedPOI(null);
    setSelectedCountry(country);

    globeRef.current.pointOfView(
      {
        lat: country.lat,
        lng: country.lng,
        altitude: 1.0,
      },
      1800
    );
  };

  // Dynamic point markers based on active Zoom LOD
  const pointsData = zoomTier === "poi"
    ? POIs.map((p) => ({
        ...p,
        color: "#D4AF37", // Gold highlights for landmarks
        size: 0.22,
        isPOI: true,
      }))
    : countries.map((c) => ({
        name: c.id,
        lat: c.lat,
        lng: c.lng,
        color: c.color,
        size: 0.16,
        isPOI: false,
      }));

  return (
    <section className="relative h-screen w-full overflow-hidden bg-black">
      {/* SPACE BACKGROUND */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=2500&auto=format&fit=crop')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      {/* GLOBE CANVAS */}
      <div className="absolute inset-0 z-10">
        <Globe
          ref={globeRef}
          width={dimensions.width}
          height={dimensions.height}
          backgroundColor="rgba(0,0,0,0)"
          globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
          bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
          
          showAtmosphere
          atmosphereColor="#4da6ff"
          atmosphereAltitude={0.16}

          // GeoJSON borders
          polygonsData={countriesGeo.features}
          polygonCapColor={() => "rgba(0,0,0,0)"}
          polygonSideColor={() => "rgba(255,255,255,0.02)"}
          polygonStrokeColor={() => "rgba(255,255,255,0.12)"}
          polygonsTransitionDuration={300}

          // City labels: show only if zoomed in past space view (LOD)
          htmlElementsData={zoomTier !== "space" ? cities : []}
          htmlLat={(d: any) => d.lat}
          htmlLng={(d: any) => d.lng}
          htmlElement={(d: any) => {
            const el = document.createElement("div");
            el.innerHTML = `
              <div style="
                color:white;
                font-size:10px;
                font-weight:600;
                text-shadow:0 0 6px black;
                white-space:nowrap;
                opacity:0.8;
              ">
                ${d.name}
              </div>
            `;
            return el;
          }}

          // Country labels: visible in Space & Regional views
          labelsData={zoomTier !== "poi" ? countryLabels : []}
          labelLat={(d: any) => d.lat}
          labelLng={(d: any) => d.lng}
          labelText={(d: any) => d.name}
          labelSize={1.4}
          labelDotRadius={0}
          labelColor={() => "#ffffff"}
          labelResolution={4}
          labelAltitude={0.015}

          // Points parameters
          pointsData={pointsData}
          pointColor={(d: any) => d.color || "#ffffff"}
          pointAltitude={0.018}
          pointRadius="size"
          onPointClick={(point: any) => {
            if (point.isPOI) {
              setSelectedPOI(point);
              setSelectedCountry(null);
              
              globeRef.current.pointOfView(
                {
                  lat: point.lat,
                  lng: point.lng,
                  altitude: 0.6,
                },
                1800
              );
            } else {
              const found = countries.find((c) => c.id === point.name);
              if (found) {
                handleCountrySelect(found);
              }
            }
          }}

          onGlobeClick={() => {
            setSelectedCountry(null);
            setSelectedPOI(null);
          }}
        />
      </div>

      {/* FLOATING HUD CONTROLS */}
      <div className="absolute left-6 top-24 z-20 rounded-2xl border border-white/10 bg-black/45 p-4 text-xs tracking-wider text-gray-300 backdrop-blur-md">
        <p className="font-bold text-[#D4AF37] uppercase mb-1">Interactive Earth Explorer</p>
        <p className="flex items-center gap-1.5 mt-1">
          <span className={`h-2 w-2 rounded-full ${zoomTier === "space" ? "bg-green-500 animate-pulse" : "bg-gray-600"}`} />
          Space Level (Continents)
        </p>
        <p className="flex items-center gap-1.5 mt-1">
          <span className={`h-2 w-2 rounded-full ${zoomTier === "regional" ? "bg-green-500 animate-pulse" : "bg-gray-600"}`} />
          Regional Level (Cities)
        </p>
        <p className="flex items-center gap-1.5 mt-1">
          <span className={`h-2 w-2 rounded-full ${zoomTier === "poi" ? "bg-green-500 animate-pulse" : "bg-gray-600"}`} />
          POI Level (Hotspots)
        </p>
      </div>

      {/* DETAILED GLASSMORPHIC SIDE CARDS */}
      <AnimatePresence>
        {/* 1. Country Selection Panel */}
        {selectedCountry && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 20, stiffness: 100 }}
            className="absolute right-0 top-0 z-40 h-full w-full border-l border-white/10 bg-black/40 p-8 text-white backdrop-blur-3xl lg:w-[450px] flex flex-col justify-between overflow-y-auto"
          >
            <div>
              <button
                onClick={() => setSelectedCountry(null)}
                className="mb-8 text-xs uppercase tracking-widest text-gray-400 hover:text-white transition"
              >
                ← Back to Earth
              </button>

              <h2 className="mb-2 text-5xl font-extrabold text-[#D4AF37]">
                {selectedCountry.id}
              </h2>
              <p className="text-sm text-gray-400 mb-8 font-medium">Explore Popular Regions & Hotspots</p>

              <div className="space-y-6">
                {selectedCountry.destinations.map((dest: any) => (
                  <div key={dest.name} className="group relative overflow-hidden rounded-2xl border border-white/5 bg-white/5 p-3 hover:bg-white/10 transition-all duration-300">
                    <div className="relative h-44 overflow-hidden rounded-xl">
                      <img
                        src={dest.image}
                        alt={dest.name}
                        className="h-full w-full object-cover transition-all duration-700 group-hover:scale-105"
                      />
                    </div>
                    <h3 className="mt-3 text-lg font-bold text-white">{dest.name}</h3>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8">
              <Link 
                href="/packages"
                className="block w-full py-4 rounded-xl bg-gradient-to-r from-[#d49237] to-[#f4d06f] hover:scale-[1.02] transition-transform text-black font-bold text-center shadow-lg shadow-yellow-600/10"
              >
                View Packages
              </Link>
            </div>
          </motion.div>
        )}

        {/* 2. Specific POI Panel */}
        {selectedPOI && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 20, stiffness: 100 }}
            className="absolute right-0 top-0 z-40 h-full w-full border-l border-white/10 bg-black/40 p-8 text-white backdrop-blur-3xl lg:w-[450px] flex flex-col justify-between overflow-y-auto"
          >
            <div>
              <button
                onClick={() => setSelectedPOI(null)}
                className="mb-8 text-xs uppercase tracking-widest text-gray-400 hover:text-white transition"
              >
                ← Back to Earth
              </button>

              <div className="relative h-60 w-full overflow-hidden rounded-2xl border border-white/10 shadow-2xl">
                <img
                  src={selectedPOI.image}
                  alt={selectedPOI.name}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <span className="absolute left-4 top-4 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/35 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#D4AF37]">
                  {selectedPOI.country} Hotspot
                </span>
                <h2 className="absolute bottom-4 left-6 text-3xl font-extrabold text-white">
                  {selectedPOI.name}
                </h2>
              </div>

              <div className="mt-8">
                <p className="text-xs uppercase tracking-wider text-[#D4AF37] font-semibold">About This Destination</p>
                <p className="mt-3 text-base leading-7 text-gray-300 font-medium">
                  {selectedPOI.desc}
                </p>
              </div>
            </div>

            <div className="mt-8 space-y-3">
              <Link 
                href="/packages"
                className="block w-full py-4 rounded-xl bg-gradient-to-r from-[#d49237] to-[#f4d06f] hover:scale-[1.02] transition-transform text-black font-bold text-center shadow-lg shadow-yellow-600/10"
              >
                Explore Tour Packages
              </Link>
              <button 
                onClick={() => {
                  setSelectedPOI(null);
                  globeRef.current.pointOfView({ lat: selectedPOI.lat, lng: selectedPOI.lng, altitude: 2.2 }, 1500);
                }}
                className="block w-full py-3.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white text-sm font-semibold text-center transition"
              >
                Zoom Out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* VIGNETTE OVERLAY FOR LUXURY EFFECT */}
      <div className="pointer-events-none absolute inset-0 z-20 shadow-[inset_0_0_180px_rgba(0,0,0,0.95)]" />
    </section>
  );
}