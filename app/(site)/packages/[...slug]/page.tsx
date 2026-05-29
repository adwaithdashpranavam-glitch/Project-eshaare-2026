import Image from "next/image";
import Link from "next/link";
import { getCachedPackageBySlug } from "@/lib/packages";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { notFound } from "next/navigation";
import Footer from "@/components/layout/Footer";
import type { Metadata } from "next";
import { 
  ChevronRight, 
  MapPin, 
  Clock, 
  Calendar, 
  ShieldCheck, 
  Check, 
  X as XIcon,
  Phone,
  MessageSquare
} from "lucide-react";

interface PageProps {
  params: Promise<{ slug: string[] }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  if (!slug || slug.length === 0) return { title: "Holiday Packages | Eshaare Tour" };
  const targetSlug = slug[slug.length - 1];
  
  try {
    const pkg = await getCachedPackageBySlug(targetSlug);
    if (!pkg) return { title: "Package Details | Eshaare Tour" };
    
    const pageTitle = `${pkg.title} | Eshaare Tour`;
    const pageDesc = pkg.overview?.substring(0, 160) || `Book the premium holiday package: ${pkg.title} with Eshaare Tour.`;
    
    return {
      title: pageTitle,
      description: pageDesc,
      openGraph: {
        title: pageTitle,
        description: pageDesc,
        images: pkg.image ? [{ url: pkg.image, alt: pkg.title }] : [],
        type: "website"
      },
      twitter: {
        card: "summary_large_image",
        title: pageTitle,
        description: pageDesc,
        images: pkg.image ? [pkg.image] : []
      }
    };
  } catch (err) {
    console.error("SEO metadata fetch error:", err);
    return { title: "Package Details | Eshaare Tour" };
  }
}

export default async function DynamicPackageDetails({ params }: PageProps) {
  const { slug } = await params;
  
  if (!slug || slug.length === 0) {
    notFound();
  }

  // Extract the target slug (the last item in the path)
  const targetSlug = slug[slug.length - 1];
  const pkg = await getCachedPackageBySlug(targetSlug);

  if (!pkg) {
    notFound();
  }

  // Fetch child packages (sub-packages) if this is a parent category/destination node
  const childPackagesQuery = query(
    collection(db, "packages"),
    where("parentId", "==", pkg.slug),
    where("active", "==", true)
  );
  const childSnap = await getDocs(childPackagesQuery);
  const childPackages = childSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  // Query related packages (same parent or category) for the Related Packages section
  const relatedQuery = query(
    collection(db, "packages"),
    where("parentId", "==", pkg.parentId || ""),
    where("active", "==", true)
  );
  const relatedSnap = await getDocs(relatedQuery);
  const relatedPackages = relatedSnap.docs
    .map(doc => ({ id: doc.id, ...doc.data() }))
    .filter((p: any) => p.slug !== pkg.slug) // exclude current
    .slice(0, 3); // limit to 3

  // Build Breadcrumbs trail
  const breadcrumbs = [{ name: "Home", url: "/" }, { name: "Packages", url: "/packages" }];
  let pathAccumulator = "/packages";
  
  for (let i = 0; i < slug.length - 1; i++) {
    pathAccumulator += `/${slug[i]}`;
    const partLabel = slug[i]
      .split("-")
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
    breadcrumbs.push({ name: partLabel, url: pathAccumulator });
  }
  breadcrumbs.push({ name: pkg.title, url: "" });

  const isDirectory = childPackages.length > 0;

  return (
    <main className="bg-[#071120] text-white min-h-screen pt-24">
      {/* BREADCRUMB TRAILS */}
      <div className="max-w-7xl mx-auto px-6 py-4">
        <nav className="flex flex-wrap items-center gap-1.5 text-xs text-white/50 font-semibold tracking-wide uppercase">
          {breadcrumbs.map((crumb, idx) => (
            <div key={idx} className="flex items-center gap-1.5">
              {idx > 0 && <ChevronRight size={12} className="text-white/30" />}
              {crumb.url ? (
                <Link href={crumb.url} className="hover:text-[#00C2FF] transition">
                  {crumb.name}
                </Link>
              ) : (
                <span className="text-[#00C2FF] font-bold truncate max-w-[200px]">{crumb.name}</span>
              )}
            </div>
          ))}
        </nav>
      </div>

      {/* RENDER CATEGORY/PARENT DIRECTORY (e.g. India or Kerala Packages) */}
      {isDirectory ? (
        <section className="max-w-7xl mx-auto px-6 py-12 space-y-12">
          <div className="relative h-[40vh] rounded-[30px] overflow-hidden border border-white/10 shadow-2xl">
            <Image
              src={pkg.image}
              alt={pkg.title}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-black/60" />
            <div className="relative z-10 h-full flex flex-col justify-center px-8 md:px-12">
              <span className="text-xs font-bold uppercase tracking-widest text-[#00C2FF]">
                Destination Center
              </span>
              <h1 className="text-4xl md:text-6xl font-black mt-2 tracking-tight">
                {pkg.title}
              </h1>
              <p className="text-white/70 max-w-xl text-sm leading-relaxed mt-4">
                {pkg.overview || "Explore curated luxury tour itineraries and holiday packages designed for premium experiences."}
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-2xl font-bold border-l-4 border-[#00C2FF] pl-3">
              Available Sub-Packages & Tours
            </h2>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {childPackages.map((child: any) => {
                // Build proper nested hierarchy URL
                const childSlugPath = [...slug, child.slug].join("/");
                return (
                  <div key={child.id} className="group rounded-[30px] border border-white/10 bg-white/5 overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:border-[#00C2FF]/45 flex flex-col justify-between">
                    <div>
                      <div className="relative h-56 w-full">
                        <Image
                          src={child.image}
                          alt={child.title}
                          fill
                          sizes="(max-width: 768px) 100vw, 33vw"
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        {child.duration && (
                          <div className="absolute bottom-4 left-4 rounded-full bg-black/50 backdrop-blur-md px-3 py-1 text-xs font-semibold text-[#00C2FF] flex items-center gap-1 border border-white/10">
                            <Clock size={12} />
                            {child.duration}
                          </div>
                        )}
                      </div>
                      <div className="p-6 space-y-2">
                        <h3 className="text-lg font-bold text-white group-hover:text-[#00C2FF] transition truncate">
                          {child.title}
                        </h3>
                        <p className="text-xs text-white/50 line-clamp-2">{child.overview}</p>
                      </div>
                    </div>
                    <div className="p-6 pt-0 border-t border-white/5 mt-4">
                      <div className="flex items-center justify-between pt-4">
                        <span className="text-sm font-bold text-white">{child.price}</span>
                        <Link href={`/packages/${childSlugPath}`} className="rounded-xl bg-[#00C2FF] hover:bg-[#00a2d5] text-black px-4 py-2.5 text-xs font-bold transition">
                          View details
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      ) : (
        /* RENDER SINGLE LEAF PACKAGE DETAILS */
        <>
          {/* HERO HEADER */}
          <section className="relative h-[60vh] w-full">
            <Image
              src={pkg.image}
              alt={pkg.title}
              fill
              sizes="100vw"
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-black/60" />
            <div className="relative z-10 max-w-7xl mx-auto px-6 h-full flex flex-col justify-center">
              <span className="text-xs font-bold uppercase tracking-[4px] text-[#00C2FF]">
                Luxury Holiday Stay
              </span>
              <h1 className="text-4xl md:text-6xl font-black mt-4 leading-tight tracking-tight">
                {pkg.title}
              </h1>
              <div className="flex flex-wrap gap-4 mt-6 text-sm text-white/80 font-medium">
                {pkg.duration && <span className="flex items-center gap-1"><Clock size={14} className="text-[#00C2FF]" /> {pkg.duration}</span>}
                {pkg.destination && <span className="flex items-center gap-1"><MapPin size={14} className="text-[#00C2FF]" /> {pkg.destination}</span>}
              </div>
            </div>
          </section>

          {/* MAIN CONTENT GRID */}
          <section className="max-w-7xl mx-auto px-6 py-16 grid lg:grid-cols-3 gap-10">
            
            {/* LEFT DETAILS COLUMN */}
            <div className="lg:col-span-2 space-y-10">
              
              {/* Overview */}
              <div className="bg-white/5 border border-white/10 rounded-[30px] p-8 backdrop-blur-md">
                <h2 className="text-2xl font-bold mb-4">Tour Overview</h2>
                <p className="text-white/70 text-sm leading-8 font-medium">
                  {pkg.overview}
                </p>
              </div>

              {/* Photo Gallery */}
              {pkg.gallery && pkg.gallery.length > 0 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold border-l-4 border-[#00C2FF] pl-3">Scenic Gallery</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {pkg.gallery.map((img: string, i: number) => (
                      <div key={i} className="relative h-44 rounded-2xl overflow-hidden border border-white/5 group">
                        <Image
                          src={img}
                          alt=""
                          fill
                          sizes="(max-width: 768px) 50vw, 33vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Itinerary */}
              {pkg.itinerary && pkg.itinerary.length > 0 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold border-l-4 border-[#00C2FF] pl-3">Day-Wise Itinerary</h2>
                  <div className="space-y-4">
                    {pkg.itinerary.map((day: string, idx: number) => (
                      <div key={idx} className="flex gap-4 items-start bg-white/5 border border-white/10 rounded-2xl p-5">
                        <div className="h-8 w-8 rounded-full bg-[#00C2FF] text-black flex items-center justify-center font-bold text-sm shrink-0">
                          {idx + 1}
                        </div>
                        <div className="text-sm text-gray-200 leading-relaxed font-medium mt-0.5">
                          {day}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Inclusions & Exclusions */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-1.5"><ShieldCheck className="text-green-400" /> Package Inclusions</h3>
                  <div className="space-y-3">
                    {pkg.inclusions?.map((item: string) => (
                      <div key={item} className="flex items-start gap-2 text-xs text-gray-300 leading-relaxed">
                        <Check size={14} className="text-green-400 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-1.5"><XIcon size={14} className="text-red-400" /> Package Exclusions</h3>
                  <div className="space-y-3">
                    {pkg.exclusions?.map((item: string) => (
                      <div key={item} className="flex items-start gap-2 text-xs text-gray-400 leading-relaxed">
                        <XIcon size={14} className="text-red-400 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>

            {/* RIGHT BOOKING SIDEBAR */}
            <div>
              <div className="sticky top-28 bg-[#0b1426] border border-white/10 rounded-[30px] p-6 shadow-2xl space-y-6">
                <div>
                  <p className="text-gray-400 text-xs uppercase tracking-wider font-semibold">Starting From</p>
                  <h2 className="text-4xl font-extrabold text-white mt-1">
                    {pkg.price}
                  </h2>
                  {pkg.seasonalPrice && (
                    <p className="text-xs text-red-400 line-through mt-0.5">Seasonal Price: {pkg.seasonalPrice}</p>
                  )}
                  {pkg.seatsLeft !== undefined && pkg.seatsLeft > 0 && (
                    <p className="text-xs text-[#00C2FF] font-semibold mt-2 bg-[#00C2FF]/10 px-2.5 py-1 rounded w-fit">
                      Limited seats left: {pkg.seatsLeft}
                    </p>
                  )}
                </div>

                <div className="space-y-3 pt-2">
                  <a
                    href={`https://wa.me/971501234567?text=Hi%20Eshaare%2C%20I%20want%20to%20enquire%20about%20booking%20the%20package%20${encodeURIComponent(pkg.title)}.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-4 rounded-xl bg-green-500 hover:bg-green-600 text-white font-bold flex items-center justify-center gap-2 text-sm transition"
                  >
                    <MessageSquare size={16} />
                    WhatsApp Booking
                  </a>
                  <Link
                    href="/#inquiry"
                    className="block w-full py-4 rounded-xl bg-[#00C2FF] hover:bg-[#00a2d5] text-black font-bold text-center text-sm transition"
                  >
                    Submit Booking Request
                  </Link>
                </div>
              </div>
            </div>

          </section>

          {/* RELATED PACKAGES SECTION */}
          {relatedPackages.length > 0 && (
            <section className="max-w-7xl mx-auto px-6 py-12 border-t border-white/5 space-y-8">
              <h2 className="text-2xl font-bold border-l-4 border-[#00C2FF] pl-3">Related Packages</h2>
              <div className="grid gap-8 md:grid-cols-3">
                {relatedPackages.map((rel: any) => (
                  <div key={rel.id} className="group rounded-[25px] border border-white/10 bg-white/5 overflow-hidden flex flex-col justify-between hover:border-[#00C2FF]/30 transition duration-300">
                    <div className="relative h-48 w-full">
                      <Image
                        src={rel.image}
                        alt={rel.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover transition duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="p-5 space-y-3">
                      <h3 className="font-bold text-base text-white truncate">{rel.title}</h3>
                      <div className="flex items-center justify-between border-t border-white/5 pt-3 mt-4">
                        <span className="text-sm font-extrabold text-white">{rel.price}</span>
                        <Link href={`/packages/${rel.slug}`} className="text-xs text-[#00C2FF] font-bold hover:underline">
                          View details
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}

      <Footer />
    </main>
  );
}
