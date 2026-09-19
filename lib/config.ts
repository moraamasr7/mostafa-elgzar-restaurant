/**
 * Central Configuration for Mostafa Elgzar Restaurant Website
 * 
 * Manages branding details, environment variable fallbacks,
 * and centralized ordering application integration URLs.
 */

export const siteConfig = {
  name: "مطعم مصطفى الجزار",
  subtitle: "أصل الأكل الحرش",
  phone: "01122339739",
  phoneSecondary: "01020058231",
  telUrl: "tel:01122339739",
  telUrlSecondary: "tel:01020058231",
  location: "5 شارع عمر المختار، متفرع من شارع الحرية بجوار كنيسة الرشاح، المطرية، القاهرة",
  locationMapUrl: "https://maps.app.goo.gl/D5ENYuQWe8EdeyjS6",
  restaurantCoords: {
    lat: 30.1305,
    lng: 31.3135,
  },
  workingHours: "من 10 صباحاً إلى 2 فجراً",
  talabatUrl: "https://www.talabat.com/ar/egypt/restaurant/781448/mostafa-algazaar-restaurant-matareya?aid=7827",

  // Trusted Public Website Production Domain
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "https://mostafaelgzar.com",

  // Ordering Application Integration URL (Read from NEXT_PUBLIC_ORDERING_APP_URL)
  // Authoritative operational ordering system: mostafa_menu_system
  orderingAppUrl: process.env.NEXT_PUBLIC_ORDERING_APP_URL || "",

  // Read-only Supabase Configuration for public menu fetching (PROMPT 3)
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
  },
};

/**
 * Returns the canonical URL for any path on the public website
 */
export function getCanonicalUrl(path: string = ""): string {
  const base = siteConfig.siteUrl.replace(/\/$/, "");
  const cleanPath = path ? (path.startsWith("/") ? path : `/${path}`) : "";
  return `${base}${cleanPath}`;
}

export type PublicOrderType = "takeaway" | "delivery" | "pickup";

export interface OrderingActionParams {
  type?: PublicOrderType;
  itemId?: string;
}

/**
 * Returns the effective URL for ordering actions.
 * Directs seamlessly to the internal platform menu and ordering system (/menu).
 */
export function getOrderingActionUrl(_params?: OrderingActionParams): string {
  return "/menu";
}
