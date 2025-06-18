export interface Item {
  id: number;
  name: string;
  description: string;
  price: string;
  seller: string;
  isSold: boolean;
  imageUrl?: string;
}

export interface Dispute {
  disputeId: number;
  disputeTimestamp: number;
  buyerReasoning: string;
  sellerReasoning: string;
}

export enum ItemState {
  Undefined = 0,
  Selling = 1,
  Pending = 2,
  Disputed = 3,
  Sold = 4,
  Vacation = 5
} 