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
