export interface MenuItemVariant {
  id: string;
  name: string;
  price: number;
  available: boolean;
}

export interface GroupedMenuItem {
  id: string;
  name: string;
  description: string | null;
  available: boolean;
  image?: string;
  popular?: boolean;
  category_id?: string;
  variants: MenuItemVariant[];
}

export interface GroupedCategory {
  id: string;
  name: string;
  order: number;
  icon?: string;
  items: GroupedMenuItem[];
}

export interface MenuVariantRow {
  category_id: string;
  category_name: string;
  category_order: number;
  item_id: string;
  item_name: string;
  item_description: string | null;
  item_available: boolean;
  variant_id: string;
  variant_name: string;
  price: number;
  variant_available: boolean;
}

// Backward-compatible single item type
export interface MenuItem {
  id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  image?: string;
  popular?: boolean;
  ingredients?: string[];
  available?: boolean;
}

export interface MenuCategory {
  id: string;
  name: string;
  icon: string;
}
