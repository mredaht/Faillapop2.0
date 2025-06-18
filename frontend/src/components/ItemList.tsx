import React from 'react';
import { ethers } from 'ethers';
import { Item } from '../types/Item';

interface ItemListProps {
  items: Item[];
  onBuyItem: (item: Item) => Promise<void>;
  userAddress: string;
}

export const ItemList: React.FC<ItemListProps> = ({ items, onBuyItem, userAddress }) => {
  const getImageUrl = (imageUrl: string) => {
    if (!imageUrl) return '/placeholder.png';
    if (imageUrl.startsWith('ipfs://')) {
      return `https://ipfs.io/ipfs/${imageUrl.replace('ipfs://', '')}`;
    }
    return imageUrl;
  };

  if (items.length === 0) {
    return (
      <div className="no-items">
        <p>No items available</p>
      </div>
    );
  }

  return (
    <div className="items-grid">
      {items.map((item) => (
        <div key={item.id} className="item-card">
          <div className="item-image">
            <img 
              src={getImageUrl(item.imageUrl || '')} 
              alt={item.name}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/placeholder.png';
              }}
            />
          </div>
          <div className="item-details">
            <h3>{item.name}</h3>
            <p className="description">{item.description}</p>
            <p className="price">{item.price} ETH</p>
            <p className="seller">Seller: {item.seller.slice(0, 6)}...{item.seller.slice(-4)}</p>
            {!item.isSold && item.seller.toLowerCase() !== userAddress.toLowerCase() && (
              <button 
                onClick={() => onBuyItem(item)}
                className="buy-button"
              >
                Buy Now
              </button>
            )}
            {item.isSold && (
              <span className="sold-badge">Sold</span>
            )}
            {!item.isSold && item.seller.toLowerCase() === userAddress.toLowerCase() && (
              <span className="your-item-badge">Your Item</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}; 