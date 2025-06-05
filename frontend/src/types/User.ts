export type UserRole = 'buyer' | 'seller' | 'admin';

export interface User {
  address: string;
  role: UserRole;
} 