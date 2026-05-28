import { db } from "@/lib/firebase";
import { collection, getDocs, query, where, limit } from "firebase/firestore";
import { Package } from "@/types/package";
import { unstable_cache } from "next/cache";

// Cache all active packages for 1 hour
export const getCachedPackages = unstable_cache(
  async () => {
    console.log("[Firestore] Fetching active packages from database...");
    const q = query(collection(db, "packages"), where("active", "==", true));
    const querySnapshot = await getDocs(q);
    const packagesData: Package[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      packagesData.push({
        id: doc.id,
        title: data.title || "",
        slug: data.slug || "",
        image: data.image || "",
        price: data.price || "",
        seasonalPrice: data.seasonalPrice || "",
        duration: data.duration || "",
        category: data.category || "",
        destination: data.destination || "",
        featured: data.featured || false,
        overview: data.overview || "",
        gallery: data.gallery || [],
        itinerary: data.itinerary || [],
        inclusions: data.inclusions || [],
        exclusions: data.exclusions || [],
        offerText: data.offerText || "",
        seasonTag: data.seasonTag || "",
        seatsLeft: data.seatsLeft || 0,
        active: data.active ?? true,
        parentId: data.parentId || "",
      });
    });
    return packagesData;
  },
  ["packages-list"],
  { revalidate: 3600, tags: ["packages"] }
);

// Cache featured active packages for 1 hour
export const getCachedFeaturedPackages = unstable_cache(
  async () => {
    console.log("[Firestore] Fetching featured packages from database...");
    const q = query(
      collection(db, "packages"),
      where("active", "==", true),
      where("featured", "==", true)
    );
    const querySnapshot = await getDocs(q);
    const packagesData: Package[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      packagesData.push({
        id: doc.id,
        title: data.title || "",
        slug: data.slug || "",
        image: data.image || "",
        price: data.price || "",
        seasonalPrice: data.seasonalPrice || "",
        duration: data.duration || "",
        category: data.category || "",
        destination: data.destination || "",
        featured: data.featured || false,
        overview: data.overview || "",
        gallery: data.gallery || [],
        itinerary: data.itinerary || [],
        inclusions: data.inclusions || [],
        exclusions: data.exclusions || [],
        offerText: data.offerText || "",
        seasonTag: data.seasonTag || "",
        seatsLeft: data.seatsLeft || 0,
        active: data.active ?? true,
        parentId: data.parentId || "",
      });
    });
    return packagesData;
  },
  ["featured-packages-list"],
  { revalidate: 3600, tags: ["packages", "featured-packages"] }
);

// Cache single package by slug for 1 hour
export const getCachedPackageBySlug = (slug: string) => {
  return unstable_cache(
    async () => {
      console.log(`[Firestore] Fetching package by slug (${slug}) from database...`);
      const q = query(
        collection(db, "packages"),
        where("slug", "==", slug),
        limit(1)
      );
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) return null;
      const doc = querySnapshot.docs[0];
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title || "",
        slug: data.slug || "",
        image: data.image || "",
        price: data.price || "",
        seasonalPrice: data.seasonalPrice || "",
        duration: data.duration || "",
        category: data.category || "",
        destination: data.destination || "",
        featured: data.featured || false,
        overview: data.overview || "",
        gallery: data.gallery || [],
        itinerary: data.itinerary || [],
        inclusions: data.inclusions || [],
        exclusions: data.exclusions || [],
        offerText: data.offerText || "",
        seasonTag: data.seasonTag || "",
        seatsLeft: data.seatsLeft || 0,
        active: data.active ?? true,
        parentId: data.parentId || "",
      } as Package;
    },
    [`package-${slug}`],
    { revalidate: 3600, tags: [`package-${slug}`, "packages"] }
  )();
};
