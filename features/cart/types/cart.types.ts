import { CartLine } from '@/types/orders';

export type { CartLine };

export interface CartContextType {
  cart: CartLine[];
  addToCart: (line: CartLine) => void;
  removeFromCart: (variantId: string) => void;
  updateQuantity: (variantId: string, newQuantity: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;
  openCart: () => void;
  closeCart: () => void;
  openCheckout: () => void;
  closeCheckout: () => void;
  totalCount: number;
  totalPrice: number;
}
