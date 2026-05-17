export type Package = {
    id: string;
    title: string;
    slug: string;
    image: string;
    price: string;
    duration: string;
    category: string;
    destination: string;
    featured: boolean;

    overview?: string;

    gallery?: string[];

    itinerary?: string[];

    inclusions?: string[];

    exclusions?: string[];
};