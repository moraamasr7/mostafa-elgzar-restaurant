import { MenuItem, MenuCategory } from "@/types/menu";
import { categories as fallbackCategories, menuItems as fallbackMenuItems } from "@/data/menu";
import { siteConfig } from "@/lib/config";

export interface MenuFetchResult {
  categories: MenuCategory[];
  items: MenuItem[];
  isFallback: boolean;
  error?: string;
}

/**
 * Normalizes raw category records from the database into MenuCategory
 */
function normalizeCategory(raw: Record<string, unknown>): MenuCategory {
  return {
    id: String(raw.id || raw.category_id || "uncategorized"),
    name: String(raw.name || raw.name_ar || raw.title || "تصنيف"),
    icon: String(raw.icon || "Grid3X3"),
  };
}

/**
 * Normalizes raw menu item records from the database into MenuItem
 */
function normalizeMenuItem(raw: Record<string, unknown>): MenuItem {
  return {
    id: String(raw.id || raw.item_id || ""),
    name: String(raw.name || raw.name_ar || raw.title || "وجبة"),
    price: typeof raw.price === "number" ? raw.price : Number(raw.price) || 0,
    description: String(raw.description || raw.description_ar || ""),
    category: String(raw.category_id || raw.category || "all"),
    image: raw.image_url || raw.image ? String(raw.image_url || raw.image) : undefined,
    popular: Boolean(raw.is_popular ?? raw.popular ?? false),
    ingredients: Array.isArray(raw.ingredients)
      ? raw.ingredients.map(String)
      : typeof raw.ingredients === "string"
      ? raw.ingredients.split(",").map((s) => s.trim())
      : undefined,
    available: raw.is_available !== false && raw.available !== false,
  };
}

/**
 * Authoritative Public Menu Access Layer
 * 
 * Fetches read-only menu categories and items from Supabase REST endpoint
 * using public anonymous key. Falls back to static menu data if unconfigured or unreachable.
 */
export async function fetchPublicMenu(): Promise<MenuFetchResult> {
  const { url, anonKey } = siteConfig.supabase;

  // If Supabase environment variables are missing, return static fallback
  if (!url || !anonKey) {
    return {
      categories: fallbackCategories,
      items: fallbackMenuItems,
      isFallback: true,
    };
  }

  try {
    const headers = {
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`,
      "Content-Type": "application/json",
    };

    // Fetch categories and items concurrently using explicit public column boundaries
    const [catResponse, itemResponse] = await Promise.all([
      fetch(`${url}/rest/v1/categories?select=id,name,icon,display_order&order=display_order.asc,name.asc`, { headers }),
      fetch(`${url}/rest/v1/menu_items?select=id,name,price,description,category_id,image_url,is_popular,ingredients,is_available&is_available=eq.true&order=name.asc`, { headers }),
    ]);

    if (!catResponse.ok || !itemResponse.ok) {
      throw new Error(`Public menu fetch failed (Categories: ${catResponse.status}, Items: ${itemResponse.status})`);
    }

    const rawCategories: Record<string, unknown>[] = await catResponse.json();
    const rawItems: Record<string, unknown>[] = await itemResponse.json();

    const normalizedCategories = rawCategories.map(normalizeCategory);
    const normalizedItems = rawItems.map(normalizeMenuItem);

    // Prepend 'all' category if not present
    if (!normalizedCategories.some((c) => c.id === "all")) {
      normalizedCategories.unshift({ id: "all", name: "الكل", icon: "Grid3X3" });
    }

    return {
      categories: normalizedCategories.length > 1 ? normalizedCategories : fallbackCategories,
      items: normalizedItems.length > 0 ? normalizedItems : fallbackMenuItems,
      isFallback: false,
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.warn("Using static fallback menu due to fetch error:", errorMessage);

    return {
      categories: fallbackCategories,
      items: fallbackMenuItems,
      isFallback: true,
      error: errorMessage,
    };
  }
}

/**
 * Fetches featured dishes for homepage display
 */
export async function fetchFeaturedDishes(): Promise<{ items: MenuItem[]; isFallback: boolean }> {
  const menuData = await fetchPublicMenu();
  const popularItems = menuData.items.filter((item) => item.popular && item.available !== false);
  
  return {
    items: popularItems.length > 0 ? popularItems : menuData.items.slice(0, 6),
    isFallback: menuData.isFallback,
  };
}
