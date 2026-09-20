'use client';

import React, { createContext, useContext, useState } from 'react';
import PaperMenuModal from '../components/PaperMenuModal';

interface PaperMenuContextType {
  isPaperMenuOpen: boolean;
  openPaperMenu: () => void;
  closePaperMenu: () => void;
}

const PaperMenuContext = createContext<PaperMenuContextType>({
  isPaperMenuOpen: false,
  openPaperMenu: () => {},
  closePaperMenu: () => {},
});

export const usePaperMenu = () => useContext(PaperMenuContext);

export function PaperMenuProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const openPaperMenu = () => setIsOpen(true);
  const closePaperMenu = () => setIsOpen(false);

  return (
    <PaperMenuContext.Provider
      value={{
        isPaperMenuOpen: isOpen,
        openPaperMenu,
        closePaperMenu,
      }}
    >
      {children}
      <PaperMenuModal isOpen={isOpen} onClose={closePaperMenu} />
    </PaperMenuContext.Provider>
  );
}
