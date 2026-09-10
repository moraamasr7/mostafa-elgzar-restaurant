'use client';

import React from 'react';
import { useCart } from '@/features/cart/context/CartContext';
import CheckoutForm from './CheckoutForm';

export default function GlobalCheckout() {
  const { isCheckoutOpen, closeCheckout } = useCart();

  if (!isCheckoutOpen) return null;

  return <CheckoutForm isOpen={isCheckoutOpen} onClose={closeCheckout} />;
}
