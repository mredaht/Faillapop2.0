export enum ItemState {
  Selling = 0,      // Item is available for sale
  Pending = 1,      // Item has been bought, waiting for confirmation
  Disputed = 2,     // Sale is being disputed
  Vacation = 3,     // Seller is on vacation mode
  Canceled = 4,     // Sale has been canceled
  Sold = 5          // Sale has been completed
}

export interface Item {
  id: number;
  name: string;
  description: string;
  price: string;
  seller: string;
  buyer?: string;
  state: ItemState;
  buyTimestamp?: number;
  imageUrl?: string;
  // Helper properties for backward compatibility
  isSold: boolean;
}

export interface Dispute {
  disputeId: number;
  disputeTimestamp: number;
  buyerReasoning: string;
  sellerReasoning: string;
}

export interface Sale {
  seller: string;
  buyer: string;
  title: string;
  description: string;
  price: string;
  state: ItemState;
  buyTimestamp: number;
}

// Helper functions for state management
export const ItemStateHelpers = {
  isAvailableForPurchase: (state: ItemState) => state === ItemState.Selling,
  isPending: (state: ItemState) => state === ItemState.Pending,
  isDisputed: (state: ItemState) => state === ItemState.Disputed,
  isSold: (state: ItemState) => state === ItemState.Sold,
  isInVacation: (state: ItemState) => state === ItemState.Vacation,
  canDispute: (state: ItemState) => state === ItemState.Pending,
  canConfirmReceipt: (state: ItemState) => state === ItemState.Pending,
  
  getStateLabel: (state: ItemState): string => {
    switch (state) {
      case ItemState.Selling: return 'Available';
      case ItemState.Pending: return 'Pending Confirmation';
      case ItemState.Disputed: return 'In Dispute';
      case ItemState.Vacation: return 'Seller on Vacation';
      case ItemState.Canceled: return 'Canceled';
      case ItemState.Sold: return 'Sold';
      default: return 'Unknown';
    }
  },
  
  getStateColor: (state: ItemState): string => {
    switch (state) {
      case ItemState.Selling: return '#2ecc71'; // Green
      case ItemState.Pending: return '#f39c12'; // Orange
      case ItemState.Disputed: return '#e74c3c'; // Red
      case ItemState.Vacation: return '#9b59b6'; // Purple
      case ItemState.Canceled: return '#95a5a6'; // Gray
      case ItemState.Sold: return '#95a5a6'; // Gray
      default: return '#bdc3c7'; // Light gray
    }
  }
}; 