"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as THREE from "three";

// Dynamic import for react-globe.gl
const Globe = dynamic(
  () => import("react-globe.gl").then((mod) => mod.default),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-screen w-full items-center justify-center bg-black text-white font-light tracking-widest">
        INITIALIZING PLANET...
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
      { name: "Tokyo", image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=1200&auto=format&fit=crop" },
      { name: "Kyoto", image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=1200&auto=format&fit=crop" },
    ],
  },
  {
    id: "Switzerland",
    lat: 46.8182,
    lng: 8.2275,
    color: "#00c2ff",
    destinations: [
      { name: "Interlaken", image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1200&auto=format&fit=crop" },
    ],
  },
];

export default function LuxuryEarth() {
  const globeRef = useRef<any>(null);
  const [selectedCountry, setSelectedCountry] = useState<any>(null);
  const [dimensions, setDimensions] = useState({ width: 1200, height: 800 });

  // 1. Setup Clouds & Lighting
  useEffect(() => {
    if (!globeRef.current) return;

    const globe = globeRef.current;

    // Add Clouds Layer
    const CLOUDS_IMG_URL = '//unpkg.com/three-globe/example/img/earth-clouds.png';
    const CLOUDS_ALT = 0.004;
    const CLOUDS_ROTATION_SPEED = -0.006; // deg/frame

    new THREE.TextureLoader().load(CLOUDS_IMG_URL, cloudsTexture => {
      const clouds = new THREE.Mesh(
        new THREE.SphereGeometry(globe.getGlobeRadius() * (1 + CLOUDS_ALT), 75, 75),
        new THREE.MeshPhongMaterial({ map: cloudsTexture, transparent: true })
      );
      globe.scene().add(clouds);

      (function rotateClouds() {
        clouds.rotation.y += CLOUDS_ROTATION_SPEED * Math.PI / 180;
        requestAnimationFrame(rotateClouds);
      })();
    });

    // 2. Google Earth style camera controls
    const controls = globe.controls();
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.3;
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 150; // Prevent zooming into the core

    // 3. Ambient Lighting (Night Side)
    const scene = globe.scene();
    scene.children.forEach((child: any) => {
      if (child.type === 'DirectionalLight') {
        child.intensity = 1.5; // Sun brightness
      }
    });

    globe.pointOfView({ lat: 20, lng: 78, altitude: 2.2 }, 0);
  }, []);

  // Handle Resize
  useEffect(() => {
    setDimensions({ width: window.innerWidth, height: window.innerHeight });
    const handleResize = () => setDimensions({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleCountrySelect = (country: any) => {
    setSelectedCountry(country);
    globeRef.current.pointOfView(
      { lat: country.lat, lng: country.lng, altitude: 0.8 },
      2000 // Smooth zoom duration
    );
  };

  return (
    <section className="relative h-screen w-full overflow-hidden bg-black">
      {/* Background Stars */}
      <div className="absolute inset-0 z-0 opacity-60"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=2000&auto=format&fit=crop')",
          backgroundSize: "cover"
        }}
      />

      <div className="absolute inset-0 z-10">
        <Globe
          ref={globeRef}
          width={dimensions.width}
          height={dimensions.height}
          backgroundColor="rgba(0,0,0,0)"

          // MAP TEXTURES
          globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
          bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"

          // Google Earth Style Atmosphere
          showAtmosphere={true}
          atmosphereColor="#3a9ad9"
          atmosphereAltitude={0.25}

          // Points / Markers
          pointsData={countries.map(c => ({ ...c, size: 0.3 }))}
          pointColor="color"
          pointAltitude={0.02}
          pointRadius="size"
          onPointClick={(p: any) => handleCountrySelect(p)}

          // Smooth interaction
          onGlobeClick={() => setSelectedCountry(null)}
        />
      </div>

      {/* UI Overlay: Info Panel */}
      <AnimatePresence>
        {selectedCountry && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 20, stiffness: 100 }}
            className="absolute right-0 top-0 z-40 h-full w-full bg-black/30 backdrop-blur-3xl border-l border-white/10 lg:w-[450px] p-8 text-white"
          >
            <button onClick={() => setSelectedCountry(null)} className="mb-10 text-sm tracking-widest uppercase opacity-50 hover:opacity-100 transition">
              ← Back to Earth
            </button>
            <h2 className="text-6xl font-bold mb-8 italic">{selectedCountry.id}</h2>

            <div className="space-y-8">
              {selectedCountry.destinations.map((dest: any) => (
                <div key={dest.name} className="group cursor-pointer">
                  <div className="relative h-64 overflow-hidden rounded-xl">
                    <img src={dest.image} alt={dest.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 scale-105 group-hover:scale-100" />
                    <div className="absolute bottom-4 left-4 bg-black/60 px-4 py-1 backdrop-blur-md">
                      <p className="text-lg font-medium tracking-tight">{dest.name}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Vignette Overlay for Depth */}
      <div className="pointer-events-none absolute inset-0 z-20 shadow-[inset_0_0_150px_rgba(0,0,0,0.9)]" />
    </section>
  );
}