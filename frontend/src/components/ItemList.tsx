import React from 'react';
import { ethers } from 'ethers';
import { Item, ItemState, ItemStateHelpers } from '../types/Item';

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
            {item.buyer && (
              <p className="buyer">Buyer: {item.buyer.slice(0, 6)}...{item.buyer.slice(-4)}</p>
            )}
            
            {/* Status badge */}
            <div className="status-badge" style={{ backgroundColor: ItemStateHelpers.getStateColor(item.state) }}>
              {ItemStateHelpers.getStateLabel(item.state)}
            </div>
            
            {/* Action buttons based on state and user role */}
            {ItemStateHelpers.isAvailableForPurchase(item.state) && 
             item.seller.toLowerCase() !== userAddress.toLowerCase() && (
              <button 
                onClick={() => onBuyItem(item)}
                className="buy-button"
              >
                Buy Now
              </button>
            )}
            
            {item.seller.toLowerCase() === userAddress.toLowerCase() && (
              <span className="your-item-badge">Your Item</span>
            )}
            
            {ItemStateHelpers.isPending(item.state) && 
             item.buyer?.toLowerCase() === userAddress.toLowerCase() && (
              <div className="buyer-actions">
                <small>Waiting for delivery confirmation</small>
              </div>
            )}
            
            {ItemStateHelpers.isDisputed(item.state) && (
              <div className="dispute-status">
                <small>⚠️ Item is under dispute</small>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}; 