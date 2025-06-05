import React from 'react';
import { Item } from '../types/Item';
import { ethers } from 'ethers';

interface ItemListProps {
  items: Item[];
  onBuyItem: (item: Item) => Promise<void>;
  userAddress: string | null;
}

export const ItemList: React.FC<ItemListProps> = ({ items, onBuyItem, userAddress }) => {
  const handleBuy = async (item: Item) => {
    try {
      await onBuyItem(item);
    } catch (err) {
      console.error('Error buying item:', err);
      alert(err instanceof Error ? err.message : 'Error buying item');
    }
  };

  if (items.length === 0) {
    return (
      <div className="no-items">
        <p>No items available</p>
      </div>
    );
  }

  return (
    <div className="item-list">
      {items.map((item) => (
        <div key={item.id} className="item-card">
          <div className="item-content">
            <h3>{item.name}</h3>
            <p className="description">{item.description}</p>
            <p className="price">{item.price} ETH</p>
            <p className="seller">
              Seller: {item.seller.slice(0, 6)}...{item.seller.slice(-4)}
            </p>
            <p className="status">
              Status: {item.isSold ? 'Sold' : 'Available'}
            </p>
          </div>

          {!item.isSold && 
           userAddress && 
           userAddress.toLowerCase() !== item.seller.toLowerCase() && (
            <button
              onClick={() => handleBuy(item)}
              className="buy-button"
            >
              Buy Now
            </button>
          )}
        </div>
      ))}
    </div>
  );
}; 