"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type Language = "en" | "ar";

interface TranslationContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  isRtl: boolean;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navbar / Header
    "PRODUCTS": "Products",
    "LABELS": "Labels",
    "NEWS": "News",
    "ONLINE SERVICES": "Online Services",
    "Visa Services": "Visa Services",
    "Holiday Packages": "Holiday Packages",
    "Flights": "Flights",
    "Hotels": "Hotels",
    "Dubai Experiences": "Dubai Experiences",
    "Travel Insurance": "Travel Insurance",
    "Login": "Login",
    "Dashboard": "Dashboard",
    "Enquire Now": "Enquire Now",
    "Search...": "Search for destinations, visas, or tours...",
    "Search destinations, visas, tours...": "Search destinations, visas, tours...",
    "Admin Portal": "Admin Portal",
    
    // Hero & Generic Sections
    "Explore seamless visa processing for global destinations": "Explore seamless visa processing for global destinations",
    "Trending Tours": "Trending Tours",
    "Explore Trending Tour Packages": "Explore Trending Tour Packages",
    "Popular Destinations": "Popular Destinations",
    "Why Choose Us": "Why Choose Us",
    "View More": "View More",
    "Apply for Visa": "Apply for Visa",
    "Apply Now": "Apply Now",
    "Explore": "Explore",
    
    // Inquiry Form
    "Inquiry Form": "Inquiry Form",
    "Plan Your Next Journey": "Plan Your Next Journey",
    "Submit your travel inquiry and our team will contact you shortly.": "Submit your travel inquiry and our team will contact you shortly.",
    "Full Name *": "Full Name *",
    "Email Address": "Email Address",
    "Phone Number *": "Phone Number *",
    "WhatsApp Number": "WhatsApp Number",
    "Nationality": "Nationality",
    "Select Visa Type": "Select Visa Type",
    "Destination Country *": "Destination Country *",
    "Travel Date": "Travel Date",
    "Number of Travelers": "Number of Travelers",
    "Estimated Budget": "Estimated Budget",
    "Tell us about your trip plan... *": "Tell us about your trip plan... *",
    "Submit Inquiry": "Submit Inquiry",
    "Submitting...": "Submitting...",
    "Tourist Visa": "Tourist Visa",
    "Business Visa": "Business Visa",
    "Student Visa": "Student Visa",
    "Work Visa": "Work Visa",
    "Other": "Other",
    
    // Customer Portal / Dashboard
    "My Bookings": "My Bookings",
    "Hotel Bookings": "Hotel Bookings",
    "Visa Applications": "Visa Applications",
    "Saved / Wishlist": "Saved / Wishlist",
    "Payment History": "Payment History",
    "Notifications": "Notifications",
    "Profile Settings": "Profile Settings",
    "Support & Contact": "Support & Contact",
    "Sign Out": "Sign Out",
    "Welcome, ": "Welcome, ",
    
    // Checkout
    "Secure Checkout": "Secure Checkout",
    "Order Summary": "Order Summary",
    "Payment Method": "Payment Method",
    "Credit Card": "Credit Card",
    "Card Number": "Card Number",
    "Expiration Date": "Expiration Date",
    "CVV": "CVV",
    "Cardholder Name": "Cardholder Name",
    "Complete Payment": "Complete Payment",
    "Processing Payment...": "Processing Payment...",
    "Payment Successful!": "Payment Successful!",
  },
  ar: {
    // Navbar / Header
    "PRODUCTS": "المنتجات",
    "LABELS": "الأقسام",
    "NEWS": "الأخبار",
    "ONLINE SERVICES": "الخدمات الإلكترونية",
    "Visa Services": "خدمات التأشيرات",
    "Holiday Packages": "باقات العطلات",
    "Flights": "رحلات الطيران",
    "Hotels": "الفنادق",
    "Dubai Experiences": "تجارب دبي",
    "Travel Insurance": "تأمين السفر",
    "Login": "تسجيل الدخول",
    "Dashboard": "لوحة التحكم",
    "Enquire Now": "استفسر الآن",
    "Search...": "ابحث عن الوجهات، التأشيرات، أو الجولات...",
    "Search destinations, visas, tours...": "ابحث عن الوجهات، التأشيرات، الجولات...",
    "Admin Portal": "بوابة الإدارة",
    
    // Hero & Generic Sections
    "Explore seamless visa processing for global destinations": "استكشف خدمات استخراج التأشيرات السلسة لمختلف الوجهات العالمية",
    "Trending Tours": "الجولات الرائجة",
    "Explore Trending Tour Packages": "استكشف باقات الجولات السياحية الرائجة",
    "Popular Destinations": "الوجهات الشهيرة",
    "Why Choose Us": "لماذا تختارنا",
    "View More": "عرض المزيد",
    "Apply for Visa": "التقديم على التأشيرة",
    "Apply Now": "قدم الآن",
    "Explore": "استكشف",
    
    // Inquiry Form
    "Inquiry Form": "نموذج الاستفسار",
    "Plan Your Next Journey": "خطط لرحلتك القادمة",
    "Submit your travel inquiry and our team will contact you shortly.": "أرسل استفسارك وسيتواصل معك فريقنا في أقرب وقت ممكن.",
    "Full Name *": "الاسم الكامل *",
    "Email Address": "البريد الإلكتروني",
    "Phone Number *": "رقم الهاتف *",
    "WhatsApp Number": "رقم الواتساب",
    "Nationality": "الجنسية",
    "Select Visa Type": "اختر نوع التأشيرة",
    "Destination Country *": "بلد الوجهة *",
    "Travel Date": "تاريخ السفر",
    "Number of Travelers": "عدد المسافرين",
    "Estimated Budget": "الميزانية المقدرة",
    "Tell us about your trip plan... *": "أخبرنا عن تفاصيل رحلتك... *",
    "Submit Inquiry": "إرسال الطلب",
    "Submitting...": "جاري الإرسال...",
    "Tourist Visa": "تأشيرة سياحية",
    "Business Visa": "تأشيرة عمل",
    "Student Visa": "تأشيرة طالب",
    "Work Visa": "تأشيرة عمل",
    "Other": "أخرى",
    
    // Customer Portal / Dashboard
    "My Bookings": "حجوزاتي",
    "Hotel Bookings": "حجوزات الفنادق",
    "Visa Applications": "طلبات التأشيرة",
    "Saved / Wishlist": "المفضلة / قائمة الأمنيات",
    "Payment History": "سجل المدفوعات",
    "Notifications": "الإشعارات",
    "Profile Settings": "إعدادات الملف الشخصي",
    "Support & Contact": "الدعم والتواصل",
    "Sign Out": "تسجيل الخروج",
    "Welcome, ": "مرحباً، ",
    
    // Checkout
    "Secure Checkout": "الدفع الآمن",
    "Order Summary": "ملخص الطلب",
    "Payment Method": "طريقة الدفع",
    "Credit Card": "بطاقة الائتمان",
    "Card Number": "رقم البطاقة",
    "Expiration Date": "تاريخ الانتهاء",
    "CVV": "الرمز السري",
    "Cardholder Name": "اسم صاحب البطاقة",
    "Complete Payment": "إتمام عملية الدفع",
    "Processing Payment...": "جاري معالجة الدفع...",
    "Payment Successful!": "تم الدفع بنجاح!",
  }
};

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

export function TranslationProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");

  useEffect(() => {
    // Hydrate state from localStorage if available
    const savedLang = localStorage.getItem("language") as Language;
    if (savedLang === "en" || savedLang === "ar") {
      setLanguageState(savedLang);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("language", lang);
  };

  const isRtl = language === "ar";

  useEffect(() => {
    // Update HTML dir and lang attributes dynamically
    document.documentElement.dir = isRtl ? "rtl" : "ltr";
    document.documentElement.lang = language;
    
    // Add/remove font style classes for body
    if (isRtl) {
      document.body.classList.add("font-arabic");
    } else {
      document.body.classList.remove("font-arabic");
    }
  }, [language, isRtl]);

  const t = (key: string): string => {
    return translations[language]?.[key] || key;
  };

  return (
    <TranslationContext.Provider value={{ language, setLanguage, t, isRtl }}>
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(TranslationContext);
  if (context === undefined) {
    throw new Error("useTranslation must be used within a TranslationProvider");
  }
  return context;
}
