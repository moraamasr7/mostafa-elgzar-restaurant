import { supabase } from "@/lib/supabase/client";
import { MenuItem, MenuCategory } from "@/types/menu";

export type { MenuItem, MenuCategory };

/**
 * Authoritative Supabase Data Access Layer for Menu & Categories
 * Adheres strictly to gazzar_master_schema.sql:
 * - categories (id, name, display_order, is_active)
 * - menu_items (id, category_id, name, description, is_available)
 * - item_variants (id, item_id, variant_name, price, is_available)
 */

export interface LiveMenuData {
  categories: MenuCategory[];
  menuItems: MenuItem[];
}

export async function fetchLiveMenuFromSupabase(): Promise<LiveMenuData> {
  try {
    const [categoriesRes, itemsRes] = await Promise.all([
      supabase
        .from("categories")
        .select("id, name, display_order, is_active")
        .eq("is_active", true)
        .order("display_order", { ascending: true }),
      supabase
        .from("menu_items")
        .select(`
          id,
          category_id,
          name,
          description,
          image_url,
          is_available,
          item_variants (
            id,
            variant_name,
            price,
            is_available
          )
        `)
        .eq("is_available", true)
        .order("name", { ascending: true }),
    ]);

    if (categoriesRes.error) {
      console.error("Error fetching categories from Supabase:", categoriesRes.error);
    }
    if (itemsRes.error) {
      console.error("Error fetching menu items from Supabase:", itemsRes.error);
    }

    const rawCategories = categoriesRes.data || [];
    const rawItems = itemsRes.data || [];

    const categories: MenuCategory[] = [
      { id: "all", name: "الكل", icon: "Grid3X3" },
      ...rawCategories.map((cat) => ({
        id: cat.id,
        name: cat.name,
        icon: "UtensilsCrossed",
      })),
    ];

    const menuItems: MenuItem[] = rawItems.map((item: any) => {
      const activeVariants = (item.item_variants || []).filter((v: any) => v.is_available !== false);
      const minPrice = activeVariants.length > 0
        ? Math.min(...activeVariants.map((v: any) => Number(v.price) || 0))
        : 0;

      return {
        id: item.id,
        name: item.name,
        price: minPrice,
        description: item.description || "",
        category: item.category_id,
        image: item.image_url || undefined,
        available: item.is_available,
      };
    });

    return { categories, menuItems };
  } catch (err) {
    console.error("fetchLiveMenuFromSupabase exception:", err);
    return { categories: [], menuItems: [] };
  }
}

// Zero mock data: fallback arrays are strictly empty to prevent showing synthetic data
export const categories: MenuCategory[] = [];
export const menuItems: MenuItem[] = [];
