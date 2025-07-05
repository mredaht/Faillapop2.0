import React from 'react';
import { Item, ItemStateHelpers } from '../types/Item';

interface ItemListProps {
  items: Item[];
  onBuyItem: (item: Item) => void;
  userAddress: string;
}

// Helper function to get CSS class for status badge
const getStatusBadgeClass = (state: number): string => {
  switch (state) {
    case 1: return 'available';      // Selling
    case 2: return 'pending';        // Pending 
    case 3: return 'disputed';       // Disputed
    case 4: return 'sold';           // Sold
    case 5: return 'vacation';       // Vacation
    default: return 'undefined';     // Undefined/Unknown
  }
};

export const ItemList: React.FC<ItemListProps> = ({ items, onBuyItem, userAddress }) => {
  if (items.length === 0) {
    return (
      <div className="no-items">
        <p>No items available in the marketplace.</p>
      </div>
    );
  }

  return (
    <div className="items-grid">
      {items.map((item) => {
        const isYourItem = item.seller.toLowerCase() === userAddress.toLowerCase();
        return (
          <div key={item.id} className={`item-card ${isYourItem ? 'your-item' : ''}`}>
            <div className="item-image">
              {item.imageUrl ? (
                <img src={item.imageUrl} alt={item.name} />
              ) : (
                <div className="placeholder-image">
                  <span>🛍️</span>
                </div>
              )}
            </div>
            
            <div className="item-details">
              <h3>{item.name}</h3>
              <p className="description">{item.description}</p>
              <p className="price">{item.price} ETH</p>
              <p className="seller">Seller: {item.seller.slice(0, 6)}...{item.seller.slice(-4)}</p>
              {item.buyer && (
                <p className="buyer">Buyer: {item.buyer.slice(0, 6)}...{item.buyer.slice(-4)}</p>
              )}
              
              {/* Status badges container for better spacing */}
              <div className="status-badges-container">
                <div 
                  className={`status-badge ${getStatusBadgeClass(item.state)}`}
                  style={{ backgroundColor: ItemStateHelpers.getStateColor(item.state) }}
                >
                  {ItemStateHelpers.getStateLabel(item.state)}
                </div>
                
                {/* Additional badges */}
                {ItemStateHelpers.isDisputed(item.state) && (
                  <div className="vulnerability-badge">
                    Disputed
                  </div>
                )}
                
                {ItemStateHelpers.isSold(item.state) && (
                  <div className="sold-badge">
                    Sold
                  </div>
                )}
              </div>
              
              {/* Action buttons with improved spacing */}
              <div className="item-actions">
                {ItemStateHelpers.isAvailableForPurchase(item.state) && 
                 !isYourItem && (
                  <button 
                    onClick={() => onBuyItem(item)}
                    className="button button-primary"
                  >
                    Buy Now
                  </button>
                )}
                
                {ItemStateHelpers.isPending(item.state) && 
                 item.buyer?.toLowerCase() === userAddress.toLowerCase() && (
                  <div className="buyer-actions">
                    <small>Waiting for delivery confirmation</small>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}; 