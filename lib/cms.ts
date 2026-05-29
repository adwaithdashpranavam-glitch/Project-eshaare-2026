import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { unstable_cache } from "next/cache";

export interface VisaCategory {
  name: string;
  image: string;
  desc: string;
  href: string;
}

export interface Destination {
  name: string;
  image: string;
}

// Cache visa categories for 1 hour
export const getCachedVisaCategories = unstable_cache(
  async (): Promise<VisaCategory[]> => {
    console.log("[Firestore] Fetching visa categories from database...");
    const querySnapshot = await getDocs(collection(db, "visaCategories"));
    const categories: VisaCategory[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      categories.push({
        name: data.name || "",
        image: data.image || "",
        desc: data.desc || "",
        href: data.href || ""
      });
    });
    return categories;
  },
  ["visa-categories-list"],
  { revalidate: 3600, tags: ["visa-categories"] }
);

// Cache destinations for 1 hour
export const getCachedDestinations = unstable_cache(
  async (): Promise<Destination[]> => {
    console.log("[Firestore] Fetching destinations from database...");
    const querySnapshot = await getDocs(collection(db, "destinations"));
    const destinations: Destination[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      destinations.push({
        name: data.name || "",
        image: data.image || ""
      });
    });
    return destinations;
  },
  ["destinations-list"],
  { revalidate: 3600, tags: ["destinations"] }
);
