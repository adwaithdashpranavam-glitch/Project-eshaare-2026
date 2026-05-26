"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as THREE from "three";
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
        Loading Earth...
      </div>
    ),
  }
);

// DESTINATIONS
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
    color: "#00c2ff",
    destinations: [
      {
        name: "Interlaken",
        image:
          "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1200&auto=format&fit=crop",
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
        name: "Kerala",
        image:
          "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?q=80&w=1200&auto=format&fit=crop",
      },
    ],
  },
];

export default function LuxuryEarth() {
  const globeRef = useRef<any>(null);

  const [dimensions, setDimensions] = useState({
    width: 1200,
    height: 800,
  });

  const [selectedCountry, setSelectedCountry] =
    useState<any>(null);

  const [showLabels, setShowLabels] =
    useState(false);

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

    return () =>
      window.removeEventListener("resize", resize);
  }, []);

  // GLOBE SETTINGS
  useEffect(() => {
    if (!globeRef.current) return;

    const globe = globeRef.current;

    // CAMERA
    globe.pointOfView(
      {
        lat: 20,
        lng: 78,
        altitude: 2.2,
      },
      0
    );

    // CONTROLS
    const controls = globe.controls();

    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.25;

    controls.minDistance = 120;
    controls.maxDistance = 400;

    // SHOW LABELS ON ZOOM
    controls.addEventListener("change", () => {
      const altitude =
        globe.pointOfView().altitude;

      if (altitude < 1.8) {
        setShowLabels(true);
      } else {
        setShowLabels(false);
      }
    });

    // LIGHTING
    const scene = globe.scene();

    scene.children.forEach((obj: any) => {
      if (obj.type === "DirectionalLight") {
        obj.intensity = 2;
      }
    });

    // EXTRA AMBIENT LIGHT
    const ambientLight =
      new THREE.AmbientLight(0xffffff, 0.6);

    scene.add(ambientLight);

    // CLOUDS
    const CLOUDS_IMG_URL =
      "//unpkg.com/three-globe/example/img/earth-clouds.png";

    const CLOUDS_ALT = 0.004;

    new THREE.TextureLoader().load(
      CLOUDS_IMG_URL,
      (cloudsTexture) => {
        const clouds = new THREE.Mesh(
          new THREE.SphereGeometry(
            globe.getGlobeRadius() *
            (1 + CLOUDS_ALT),
            75,
            75
          ),

          new THREE.MeshPhongMaterial({
            map: cloudsTexture,
            transparent: true,
          })
        );

        globe.scene().add(clouds);

        // ROTATE CLOUDS
        const rotateClouds = () => {
          clouds.rotation.y += 0.0004;

          requestAnimationFrame(
            rotateClouds
          );
        };

        rotateClouds();
      }
    );
  }, []);

  // COUNTRY SELECT
  const handleCountrySelect = (
    country: any
  ) => {
    setSelectedCountry(country);

    globeRef.current.pointOfView(
      {
        lat: country.lat,
        lng: country.lng,
        altitude: 0.7,
      },
      2000
    );
  };

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

      {/* GLOBE */}
      <div className="absolute inset-0 z-10">
        <Globe
          ref={globeRef}
          width={dimensions.width}
          height={dimensions.height}
          backgroundColor="rgba(0,0,0,0)"

          // EARTH TEXTURE
          globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"

          bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"

          // ATMOSPHERE
          showAtmosphere
          atmosphereColor="#4da6ff"
          atmosphereAltitude={0.16}

          // COUNTRY BORDERS
          polygonsData={countriesGeo.features}

          polygonCapColor={() =>
            "rgba(0,0,0,0)"
          }

          polygonSideColor={() =>
            "rgba(255,255,255,0.02)"
          }

          polygonStrokeColor={() =>
            "rgba(255,255,255,0.15)"
          }

          polygonsTransitionDuration={
            300
          }

          // CITY LABELS
          htmlElementsData={
            showLabels
              ? (cities as any[])
              : []
          }
          labelsData={showLabels ? countryLabels : []}

          labelLat={(d: any) => d.lat}

          labelLng={(d: any) => d.lng}

          labelText={(d: any) => d.name}

          labelSize={1.5}

          labelDotRadius={0}

          labelColor={() => "#ffffff"}

          labelResolution={4}

          labelAltitude={0.015}
          htmlLat={(d: any) => d.lat}

          htmlLng={(d: any) => d.lng}

          htmlElement={(d: any) => {
            const el =
              document.createElement(
                "div"
              );

            el.innerHTML = `
              <div style="
                color:white;
                font-size:11px;
                font-weight:600;
                text-shadow:0 0 8px black;
                white-space:nowrap;
                opacity:0.9;
              ">
                ${d.name}
              </div>
            `;

            return el;
          }}

          // DESTINATION POINTS
          pointsData={countryLabels.map((c: any) => ({
            ...c,
            color: "#ffffff",
            size: 0.12,
          }))}

          pointColor={() => "#ffffff"}

          pointAltitude={0.015}

          pointRadius="size"
          onPointClick={(point: any) => {
            const found = countries.find(
              (c) => c.id === point.name
            );

            if (found) {
              handleCountrySelect(found);
            }
          }}

          // RESET PANEL
          onGlobeClick={() =>
            setSelectedCountry(null)
          }
        />
      </div>

      {/* SIDE PANEL */}
      <AnimatePresence>
        {selectedCountry && (
          <motion.div
            initial={{
              x: "100%",
            }}
            animate={{
              x: 0,
            }}
            exit={{
              x: "100%",
            }}
            transition={{
              type: "spring",
              damping: 20,
              stiffness: 100,
            }}
            className="absolute right-0 top-0 z-40 h-full w-full border-l border-white/10 bg-black/30 p-8 text-white backdrop-blur-3xl lg:w-[450px]"
          >
            <button
              onClick={() =>
                setSelectedCountry(null)
              }
              className="mb-10 text-sm uppercase tracking-widest opacity-50 transition hover:opacity-100"
            >
              ← Back to Earth
            </button>

            <h2 className="mb-8 text-6xl font-bold italic">
              {selectedCountry.id}
            </h2>

            <div className="space-y-8">
              {selectedCountry?.destinations?.length ? (
                selectedCountry.destinations.map(
                  (dest: any) => (
                    <div
                      key={dest.name}
                      className="group cursor-pointer"
                    >
                      <div className="relative h-64 overflow-hidden rounded-2xl">
                        <img
                          src={dest.image}
                          alt={dest.name}
                          className="h-full w-full object-cover grayscale transition-all duration-700 group-hover:scale-100 group-hover:grayscale-0 scale-105"
                        />

                        <div className="absolute bottom-4 left-4 bg-black/60 px-4 py-1 backdrop-blur-md">
                          <p className="text-lg font-medium tracking-tight">
                            {dest.name}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                )
              ) : (
                <div className="flex h-[300px] items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-center text-white/60">
                  No destinations available
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DARK VIGNETTE */}
      <div className="pointer-events-none absolute inset-0 z-20 shadow-[inset_0_0_180px_rgba(0,0,0,0.95)]" />
    </section>
  );
}