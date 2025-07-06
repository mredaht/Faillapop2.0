import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, UserRole } from '../types/User';

interface PriceManipulationState {
  isActive: boolean;
  originalPrices: { [itemId: number]: string };
  manipulatedPrices: { [itemId: number]: string };
  manipulatedItemId: number | null;
}

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  updateRole: (role: UserRole) => void;
  priceManipulation: PriceManipulationState;
  startPriceManipulation: (itemId: number, originalPrice: string) => void;
  endPriceManipulation: () => void;
  getDisplayPrice: (itemId: number, actualPrice: string) => string;
  forceMarketplaceRefresh: () => void;
  refreshCounter: number;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [priceManipulation, setPriceManipulation] = useState<PriceManipulationState>({
    isActive: false,
    originalPrices: {},
    manipulatedPrices: {},
    manipulatedItemId: null
  });
  const [refreshCounter, setRefreshCounter] = useState(0);

  const updateRole = (role: UserRole) => {
    if (user) {
      setUser({ ...user, role });
    }
  };

  const startPriceManipulation = (itemId: number, originalPrice: string) => {
    console.log(`🎭 Starting price manipulation for item ${itemId}: ${originalPrice} ETH`);
    
    // Simular manipulación realista: incremento del 50% o mínimo 2 ETH más
    const originalValue = parseFloat(originalPrice);
    const increment = Math.max(originalValue * 0.5, 2.0);
    const manipulatedPrice = (originalValue + increment).toFixed(3);
    
    console.log(`🎭 Simulating contract price manipulation: ${originalPrice} ETH → ${manipulatedPrice} ETH`);
    
    setPriceManipulation({
      isActive: true,
      originalPrices: { [itemId]: originalPrice },
      manipulatedPrices: { [itemId]: manipulatedPrice },
      manipulatedItemId: itemId
    });
  };

  const endPriceManipulation = () => {
    console.log('🎭 Ending price manipulation attack');
    setPriceManipulation({
      isActive: false,
      originalPrices: {},
      manipulatedPrices: {},
      manipulatedItemId: null
    });
  };

  const getDisplayPrice = (itemId: number, actualPrice: string): string => {
    // Durante un ataque de manipulación de precios, mostrar precio original
    if (priceManipulation.isActive && priceManipulation.manipulatedItemId === itemId) {
      const originalPrice = priceManipulation.originalPrices[itemId];
      const manipulatedPrice = priceManipulation.manipulatedPrices[itemId];
      if (originalPrice && manipulatedPrice) {
        console.log(`🎭 PRICE MANIPULATION ACTIVE - Displaying cached price for item ${itemId}: ${originalPrice} ETH (contract has: ${manipulatedPrice} ETH)`);
        return originalPrice; // Mostrar precio "cached" en el marketplace
      }
    }
    return actualPrice;
  };

  const forceMarketplaceRefresh = () => {
    console.log('🔄 Forcing marketplace refresh');
    setRefreshCounter(prev => prev + 1);
  };

  return (
    <UserContext.Provider value={{ 
      user, 
      setUser, 
      updateRole, 
      priceManipulation, 
      startPriceManipulation, 
      endPriceManipulation, 
      getDisplayPrice,
      forceMarketplaceRefresh,
      refreshCounter
    }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
} 