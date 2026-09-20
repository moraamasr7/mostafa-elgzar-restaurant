'use client';

import React, { createContext, useContext, useState } from 'react';
import { TableReservationModal } from '../components/TableReservationModal';

interface ReservationContextType {
  isReservationOpen: boolean;
  openReservationModal: (mode?: 'create' | 'inquiry') => void;
  closeReservationModal: () => void;
}

const ReservationContext = createContext<ReservationContextType>({
  isReservationOpen: false,
  openReservationModal: () => {},
  closeReservationModal: () => {},
});

export const useReservation = () => useContext(ReservationContext);

export function ReservationProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<'create' | 'inquiry'>('create');

  const openReservationModal = (initialMode: 'create' | 'inquiry' = 'create') => {
    setMode(initialMode);
    setIsOpen(true);
  };

  const closeReservationModal = () => {
    setIsOpen(false);
  };

  return (
    <ReservationContext.Provider
      value={{
        isReservationOpen: isOpen,
        openReservationModal,
        closeReservationModal,
      }}
    >
      {children}
      <TableReservationModal
        isOpen={isOpen}
        onClose={closeReservationModal}
        initialMode={mode}
      />
    </ReservationContext.Provider>
  );
}
