import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, UserRole } from '../types/User';

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  updateRole: (role: UserRole) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const updateRole = (role: UserRole) => {
    if (user) {
      setUser({ ...user, role });
    }
  };

  return (
    <UserContext.Provider value={{ user, setUser, updateRole }}>
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