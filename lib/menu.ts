import { MenuItem, MenuCategory } from "@/types/menu";
import { fetchLiveMenuFromSupabase } from "@/data/menu";

export interface MenuFetchResult {
  categories: MenuCategory[];
  items: MenuItem[];
  isFallback: boolean;
  error?: string;
}

/**
 * Authoritative Public Menu Access Layer
 * Fetches menu categories and items from Supabase matching gazzar_master_schema.sql
 */
export async function fetchPublicMenu(): Promise<MenuFetchResult> {
  try {
    const { categories, menuItems } = await fetchLiveMenuFromSupabase();
    return {
      categories,
      items: menuItems,
      isFallback: false,
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "تعذر تحميل المنيو";
    return {
      categories: [],
      items: [],
      isFallback: false,
      error: errorMessage,
    };
  }
}

export async function getCategoryItems(categoryId: string): Promise<MenuItem[]> {
  const menuData = await fetchPublicMenu();
  if (categoryId === "all") {
    return menuData.items;
  }
  return menuData.items.filter((item) => item.category === categoryId);
}

export async function fetchFeaturedDishes(): Promise<{ items: MenuItem[] }> {
  const menuData = await fetchPublicMenu();
  return { items: menuData.items.slice(0, 3) };
}
