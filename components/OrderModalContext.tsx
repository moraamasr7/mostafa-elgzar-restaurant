"use client";

import React, { createContext, useContext, useState } from "react";
import { useRouter } from "next/navigation";

interface OrderModalContextType {
  openOrderModal: (itemId?: string) => void;
  closeOrderModal: () => void;
  isOpen: boolean;
}

const OrderModalContext = createContext<OrderModalContextType>({
  openOrderModal: () => {},
  closeOrderModal: () => {},
  isOpen: false,
});

export const useOrderModal = () => useContext(OrderModalContext);

export function OrderModalProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const openOrderModal = (_itemId?: string) => {
    // Seamless Direct Navigation to /menu (Unified Cart & Ordering Flow)
    router.push("/menu");
  };

  const closeOrderModal = () => {
    setIsOpen(false);
  };

  return (
    <OrderModalContext.Provider value={{ openOrderModal, closeOrderModal, isOpen }}>
      {children}
    </OrderModalContext.Provider>
  );
}
