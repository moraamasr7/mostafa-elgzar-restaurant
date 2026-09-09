'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartLine, CartContextType } from '../types/cart.types';

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'mostafa_elgzar_cart_v1';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartLine[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Restore cart on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setCart(parsed);
        }
      }
    } catch {
      // Ignore storage read errors
    }
  }, []);

  // Save cart changes
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch {
      // Ignore storage write errors
    }
  }, [cart]);

  const addToCart = (line: CartLine) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex((l) => l.variant_id === line.variant_id);
      if (existingIndex > -1) {
        const updated = [...prev];
        const existing = updated[existingIndex];
        updated[existingIndex] = {
          ...existing,
          quantity: Math.min(50, existing.quantity + line.quantity),
          item_notes: line.item_notes || existing.item_notes,
        };
        return updated;
      }
      return [...prev, line];
    });
  };

  const removeFromCart = (variantId: string) => {
    setCart((prev) => prev.filter((l) => l.variant_id !== variantId));
  };

  const updateQuantity = (variantId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(variantId);
      return;
    }
    const clampedQty = Math.min(50, newQuantity);
    setCart((prev) =>
      prev.map((l) => (l.variant_id === variantId ? { ...l, quantity: clampedQty } : l))
    );
  };

  const clearCart = () => {
    setCart([]);
    try {
      localStorage.removeItem(CART_STORAGE_KEY);
    } catch {}
  };

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  const openCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const closeCheckout = () => setIsCheckoutOpen(false);

  const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        isCheckoutOpen,
        setIsCheckoutOpen,
        openCart,
        closeCart,
        openCheckout,
        closeCheckout,
        totalCount,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextType {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
