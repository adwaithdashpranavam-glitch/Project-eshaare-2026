
"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import {
  Menu,
  X,
  MapPin,
  Phone,
  ChevronDown,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";

import {
  onAuthStateChanged,
  signOut,
  User as FirebaseUser,
} from "firebase/auth";

import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useTranslation } from "@/lib/TranslationContext";

const navData = [
  {
    title: "PRODUCTS",
    subcategories: [
      {
        title: "Visa Services",
        links: [
          "Schengen Visa",
          "UAE Visa",
          "UK Visa",
          "USA Visa",
          "Canada Visa",
          "Australia Visa",
          "Saudi Visa",
        ],
      },
      {
        title: "Holiday Packages",
        links: [
          "Europe Tours",
          "Maldives Packages",
          "Thailand Packages",
          "Bali Packages",
          "Turkey Packages",
          "Georgia Packages",
          "Japan Packages",
          "Honeymoon Packages",
          "Luxury Tours",
        ],
      },
      {
        title: "Flights",
        links: [],
      },
      {
        title: "Hotels",
        links: [],
      },
      {
        title: "Dubai Experiences",
        links: [
          "Desert Safari",
          "Burj Khalifa",
          "Yacht Rental",
          "Ferrari World",
          "Marina Cruise",
          "Abu Dhabi Tours",
        ],
      },
      {
        title: "Travel Insurance",
        links: ["Apply Online", "Request Callback"],
      },
    ],
  },
  {
    title: "LABELS",
    links: [
      "Home",
      "About Us",
      "Contact Us",
      "Why Choose Us",
      "Testimonials",
      "Partners",
      "Careers",
      "Gallery",
      "FAQ",
    ],
  },
  {
    title: "NEWS",
    links: [
      "Visa Updates",
      "Travel News",
      "Destination Guides",
      "Travel Tips",
      "UAE Updates",
      "Schengen News",
      "Blog",
    ],
  },
  {
    title: "ONLINE SERVICES",
    links: [
      "Appointment Booking",
      "WhatsApp Support",
      "Enquiry Form",
      "Live Chat",
      "Call Back Request",
      "Package Customization",
      "Flight Enquiry",
      "Hotel Enquiry",
      "Visa Consultation",
      "Start Your Journey",
    ],
  },
];

const toSlug = (text: string) => {
  const t = text.trim();

  if (t === "Home") return "/";
  if (
    t === "About Us" ||
    t === "Why Choose Us" ||
    t === "Testimonials" ||
    t === "Partners"
  )
    return "/about";

  if (
    t === "Contact Us" ||
    t === "Call Back Request" ||
    t === "Live Chat"
  )
    return "/contact";

  if (t === "Appointment Booking") return "/appointments";

  if (
    t === "Enquiry Form" ||
    t === "Enquire Now" ||
    t === "Start Your Journey" ||
    t === "Package Customization" ||
    t === "Flight Enquiry" ||
    t === "Hotel Enquiry"
  )
    return "/#inquiry";

  if (
    t === "Schengen Visa" ||
    t === "UK Visa" ||
    t === "USA Visa" ||
    t === "Japan Visa" ||
    t === "UAE Visa" ||
    t === "Canada Visa" ||
    t === "Australia Visa" ||
    t === "Saudi Visa" ||
    t === "Visa Services" ||
    t === "Visa Consultation" ||
    t.endsWith("Visa")
  ) {
    return "/visa";
  }

  if (
    t === "Holiday Packages" ||
    t.endsWith("Packages") ||
    t.endsWith("Tours") ||
    t === "Japan Packages" ||
    t === "Thailand Packages" ||
    t === "Maldives Packages" ||
    t === "Europe Tours"
  )
    return "/packages";

  if (
    t.startsWith("Flight") ||
    t === "Business Class" ||
    t === "Multi-City Flights" ||
    t === "Airport Transfers"
  )
    return "/flights";

  if (
    t.startsWith("Hotel") ||
    t === "Luxury Hotels" ||
    t === "Resorts" ||
    t === "Villas" ||
    t === "Family Resorts"
  )
    return "/hotels";

  if (
    t === "Travel Insurance" ||
    t === "Apply Online" ||
    t === "Request Callback"
  )
    return "/insurance";

  if (t === "Dubai Experiences") return "/dubai";

  if (
    t === "Desert Safari" ||
    t === "Burj Khalifa" ||
    t === "Yacht Rental" ||
    t === "Ferrari World" ||
    t === "Marina Cruise" ||
    t === "Abu Dhabi Tours"
  ) {
    return `/packages/${t.toLowerCase().replace(/ /g, "-")}`;
  }

  if (t === "WhatsApp Support") {
    return "https://wa.me/971501234567?text=Hi ESHAARE, I need travel assistance.";
  }

  if (
    t === "Visa Updates" ||
    t === "Travel News" ||
    t === "Destination Guides" ||
    t === "Travel Tips" ||
    t === "UAE Updates" ||
    t === "Schengen News" ||
    t === "Blog"
  )
    return "/blog";

  if (t.startsWith("ESHAARE") || t === "Partner Network")
    return "/about";

  return `/${t.toLowerCase().replace(/ /g, "-")}`;
};

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const { language, setLanguage, t } = useTranslation();

  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const [mobileExpanded, setMobileExpanded] = useState<string | null>(
    null
  );

  const [mobileSubExpanded, setMobileSubExpanded] = useState<
    string | null
  >(null);

  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (currentUser) => {
        setUser(currentUser);

        if (currentUser) {
          setUserName(
            currentUser.displayName ||
            currentUser.email?.split("@")[0] ||
            "Guest"
          );

          try {
            const userDoc = await getDoc(
              doc(db, "users", currentUser.uid)
            );

            if (userDoc.exists()) {
              const data = userDoc.data();

              if (data?.name) {
                setUserName(data.name);
              }
            }
          } catch (err) {
            console.error("Error fetching user profile:", err);
          }
        } else {
          setUserName("");
        }
      }
    );

    return () => unsubscribe();
  }, []);

  const toggleMobileNav = (title: string) => {
    if (mobileExpanded === title) {
      setMobileExpanded(null);
      setMobileSubExpanded(null);
    } else {
      setMobileExpanded(title);
      setMobileSubExpanded(null);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push("/");
    } catch (err) {
      console.error("Error during logout:", err);
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${scrolled
        ? "bg-gray-100/95 backdrop-blur-md shadow-sm"
        : "bg-white/90 backdrop-blur-xl shadow-md border-b border-gray-100"
        }`}
    >
      {/* Welcome banner */}
      {user && (
        <div className="bg-gradient-to-r from-[#060e1a] via-[#0b1626] to-[#060e1a] text-gray-300 text-xs py-2 px-4 xl:px-8 flex items-center justify-between border-b border-amber-500/10 font-medium tracking-wide shadow-sm">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />

            <span>
              {t("Welcome, ")}

              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#e68932] to-amber-300 font-extrabold uppercase tracking-wider">
                {userName}
              </span>
            </span>
          </div>
        </div>
      )}

      <div className="max-w-[95rem] mx-auto px-4 xl:px-6 h-20 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          {pathname &&
            pathname !== "/" &&
            pathname !== "/home" && (
              <button
                onClick={() => router.back()}
                className="mr-1 flex items-center justify-center p-2 rounded-full hover:bg-gray-200/50 text-gray-800 transition-colors"
                title="Go Back"
              >
                <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
              </button>
            )}

          <Link
            href="/"
            className="flex items-center gap-2 group shrink-0"
          >
            <div className="relative">
              <MapPin className="h-6 w-6 text-[#21201e]" />

              <div className="absolute -top-1 -right-2 w-2 h-2 bg-[#0c0c0b] rounded-full animate-pulse" />
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                <span className="text-[#e68932]">ESHAARE</span>

                <span className="text-[#141312]">TOUR</span>
              </h1>

              <p className="text-[12px] tracking-wider text-gray-800 font-semibold -mt-1">
                TOURS & EVENTS
              </p>
            </div>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-6 xl:gap-8 ml-8">
          {navData.map((navItem) => (
            <div
              key={navItem.title}
              className="relative group/main py-8"
            >
              <button className="text-gray-800 group-hover/main:text-[#e68932] transition text-[13px] xl:text-sm font-semibold uppercase tracking-wide flex items-center gap-1 cursor-pointer">
                {t(navItem.title)}

                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              {/* Dropdown */}
              <div className="absolute top-[70px] left-0 w-64 bg-white border border-gray-100 shadow-xl rounded-xl opacity-0 invisible group-hover/main:opacity-100 group-hover/main:visible transition-all duration-300 py-2">
                {navItem.subcategories ? (
                  navItem.subcategories.map((sub) => (
                    <div
                      key={sub.title}
                      className="relative group/sub"
                    >
                      {sub.links && sub.links.length > 0 ? (
                        <>
                          <Link
                            href={toSlug(sub.title)}
                            prefetch={false}
                            className="px-5 py-3 hover:bg-orange-50/50 hover:text-[#e68932] flex items-center justify-between text-sm font-medium text-gray-700 transition-colors"
                          >
                            {t(sub.title)}

                            <ChevronRight className="w-4 h-4 text-gray-400 group-hover/sub:text-[#e68932]" />
                          </Link>

                          <div className="absolute top-0 left-full -ml-1 w-60 bg-white border border-gray-100 shadow-xl rounded-xl opacity-0 invisible group-hover/sub:opacity-100 group-hover/sub:visible transition-all duration-300 py-2">
                            {sub.links.map((link) => (
                              <Link
                                key={link}
                                href={toSlug(link)}
                                prefetch={false}
                                className="block px-5 py-2.5 hover:bg-orange-50/50 hover:text-[#e68932] text-sm text-gray-600 transition-colors"
                              >
                                {t(link)}
                              </Link>
                            ))}
                          </div>
                        </>
                      ) : (
                        <Link
                          href={toSlug(sub.title)}
                          prefetch={false}
                          className="block px-5 py-3 hover:bg-orange-50/50 hover:text-[#e68932] text-sm font-medium text-gray-700 transition-colors"
                        >
                          {t(sub.title)}
                        </Link>
                      )}
                    </div>
                  ))
                ) : (
                  <>
                    {navItem.links?.map((link) => (
                      <Link
                        key={link}
                        href={toSlug(link)}
                        prefetch={false}
                        className="block px-5 py-2.5 hover:bg-orange-50/50 hover:text-[#e68932] text-sm font-medium text-gray-700 transition-colors"
                      >
                        {t(link)}
                      </Link>
                    ))}
                  </>
                )}
              </div>
            </div>
          ))}
        </nav>

        {/* Desktop Buttons */}
        <div className="hidden lg:flex items-center gap-3 xl:gap-4 shrink-0">
          {/* AR Button */}
          {/* <button
            onClick={() =>
              setLanguage(language === "en" ? "ar" : "en")
            }
            className="h-10 w-10 rounded-full bg-[#e68932] text-white font-bold text-xs flex items-center justify-center shadow-md hover:bg-[#cf7726] transition-all duration-300"
          >
            AR
          </button> */}

          {!user ? (
            <Link
              href="/login"
              className="h-11 border border-[#e68932] hover:bg-[#e68932]/10 text-gray-800 px-6 rounded-full font-semibold text-sm flex items-center justify-center transition-all duration-300"
            >
              {t("Login")}
            </Link>
          ) : (
            <Link
              href="/dashboard"
              className="h-11 border border-gray-300 hover:bg-gray-100 text-gray-800 px-6 rounded-full font-semibold text-sm flex items-center justify-center transition-all duration-300"
            >
              {t("Dashboard")}
            </Link>
          )}

          <Link
            href="/#inquiry"
            className="group relative flex items-center gap-2 h-11 bg-[#e68932] border border-[#e68932] text-white px-5 rounded-full font-semibold text-sm hover:bg-[#cf7726] transition-all duration-300 overflow-hidden shadow-md"
          >
            <Phone className="h-4 w-4" />

            <span>{t("Enquire Now")}</span>
          </Link>

          <Image
            src="/images/logo.png"
            alt="ESHAARE Logo"
            width={44}
            height={44}
            className="rounded-full object-cover h-11 w-11 shadow-sm border border-gray-200"
          />
        </div>

        {/* Mobile Buttons */}
        <div className="lg:hidden flex items-center gap-2">
          {/* AR Button */}
          <button
            onClick={() =>
              setLanguage(language === "en" ? "ar" : "en")
            }
            className="h-10 w-10 rounded-full bg-[#e68932] text-white font-bold text-xs flex items-center justify-center shadow-md hover:bg-[#cf7726] transition-all duration-300"
          >
            AR
          </button>

          {/* Menu */}
          <button
            onClick={() => setOpen(!open)}
            className="text-gray-700 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            {open ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="lg:hidden border-t border-gray-100 bg-white max-h-[calc(100vh-80px)] overflow-y-auto shadow-xl">
          <div className="flex flex-col p-4">
            {navData.map((navItem) => (
              <div
                key={navItem.title}
                className="border-b border-gray-50 last:border-0"
              >
                <button
                  onClick={() =>
                    toggleMobileNav(navItem.title)
                  }
                  className="w-full py-4 flex items-center justify-between text-sm font-bold text-gray-800"
                >
                  {t(navItem.title)}

                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${mobileExpanded === navItem.title
                      ? "rotate-180"
                      : ""
                      }`}
                  />
                </button>

                {mobileExpanded === navItem.title && (
                  <div className="pb-3 pl-4 pr-4">
                    {navItem.subcategories ? (
                      navItem.subcategories.map((sub) => (
                        <div key={sub.title} className="mt-1">
                          {sub.links &&
                            sub.links.length > 0 ? (
                            <>
                              <button
                                onClick={() =>
                                  setMobileSubExpanded(
                                    mobileSubExpanded ===
                                      sub.title
                                      ? null
                                      : sub.title
                                  )
                                }
                                className="w-full py-2.5 flex items-center justify-between text-sm font-semibold text-gray-700"
                              >
                                {t(sub.title)}

                                <ChevronDown
                                  className={`w-3.5 h-3.5 transition-transform ${mobileSubExpanded ===
                                    sub.title
                                    ? "rotate-180"
                                    : ""
                                    }`}
                                />
                              </button>

                              {mobileSubExpanded ===
                                sub.title && (
                                  <div className="pl-4 pr-4 py-1 flex flex-col gap-1 border-l-2 border-gray-100 ml-2 mr-2">
                                    {sub.links.map((link) => (
                                      <Link
                                        key={link}
                                        href={toSlug(link)}
                                        prefetch={false}
                                        onClick={() =>
                                          setOpen(false)
                                        }
                                        className="py-2 text-[13px] text-gray-600 block"
                                      >
                                        {t(link)}
                                      </Link>
                                    ))}
                                  </div>
                                )}
                            </>
                          ) : (
                            <Link
                              href={toSlug(sub.title)}
                              prefetch={false}
                              onClick={() =>
                                setOpen(false)
                              }
                              className="block py-2.5 text-sm font-semibold text-gray-700"
                            >
                              {t(sub.title)}
                            </Link>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="flex flex-col gap-1">
                        {navItem.links?.map((link) => (
                          <Link
                            key={link}
                            href={toSlug(link)}
                            prefetch={false}
                            onClick={() =>
                              setOpen(false)
                            }
                            className="py-2.5 text-[13px] font-medium text-gray-600"
                          >
                            {t(link)}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            {/* Mobile CTA */}
            <div className="mt-6 flex flex-col gap-3">
              {!user ? (
                <Link
                  href="/login"
                  className="border border-[#e68932] text-gray-800 py-3 rounded-full text-center font-semibold text-sm"
                  onClick={() => setOpen(false)}
                >
                  {t("Login")}
                </Link>
              ) : (
                <Link
                  href="/dashboard"
                  className="border border-gray-300 text-gray-800 py-3 rounded-full text-center font-semibold text-sm"
                  onClick={() => setOpen(false)}
                >
                  {t("Dashboard")}
                </Link>
              )}

              <Link
                href="/#inquiry"
                className="bg-[#e68932] text-white py-3 rounded-full text-center font-semibold text-sm shadow-md"
                onClick={() => setOpen(false)}
              >
                {t("Enquire Now")}
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}