import { supabase } from '@/lib/supabase/client';
import { MenuVariantRow, GroupedCategory, GroupedMenuItem } from '@/types/menu';

export function groupMenu(rows: MenuVariantRow[]): GroupedCategory[] {
  const categoryMap = new Map<string, GroupedCategory>();

  for (const row of rows) {
    if (!categoryMap.has(row.category_id)) {
      categoryMap.set(row.category_id, {
        id: row.category_id,
        name: row.category_name,
        order: row.category_order,
        items: [],
      });
    }

    const category = categoryMap.get(row.category_id)!;
    let menuItem = category.items.find((item) => item.id === row.item_id);

    if (!menuItem) {
      menuItem = {
        id: row.item_id,
        name: row.item_name,
        description: row.item_description,
        available: row.item_available,
        category_id: row.category_id,
        variants: [],
      };
      category.items.push(menuItem);
    }

    menuItem.variants.push({
      id: row.variant_id,
      name: row.variant_name,
      price: Number(row.price),
      available: row.variant_available,
    });
  }

  return Array.from(categoryMap.values()).sort((a, b) => a.order - b.order);
}

export async function getLiveMenu(): Promise<{
  categories: GroupedCategory[];
  error: string | null;
}> {
  try {
    const { data, error } = await supabase
      .from('v_full_menu')
      .select('*')
      .order('category_order', { ascending: true });

    if (error) {
      console.error('Failed to fetch v_full_menu from Supabase:', error);
      return {
        categories: [],
        error: error.message || 'تعذر الاتصال بقاعدة بيانات المطعم حالياً.',
      };
    }

    if (!data || data.length === 0) {
      return {
        categories: [],
        error: 'لم يتم العثور على أي وجبات مسجلة في القائمة حالياً.',
      };
    }

    const grouped = groupMenu(data as MenuVariantRow[]);
    return {
      categories: grouped,
      error: null,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'خطأ غير متوقع في الاتصال';
    console.error('getLiveMenu exception:', message);
    return {
      categories: [],
      error: message,
    };
  }
}
