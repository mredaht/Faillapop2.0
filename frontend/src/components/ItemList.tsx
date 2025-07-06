import React from 'react';
import { Item, ItemStateHelpers } from '../types/Item';
import { useUser } from '../context/UserContext';

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
  const { getDisplayPrice, priceManipulation, refreshCounter } = useUser();
  
  // Debug logging (only when manipulation is active)
  if (priceManipulation.isActive) {
    console.log('🔍 ItemList rendering with priceManipulation:', priceManipulation, 'refreshCounter:', refreshCounter);
  }
  
  // No modificar los items, usar la lógica del contexto directamente
  
  if (items.length === 0) {
    return (
      <div className="no-items">
        <p>No items available in the marketplace.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="items-grid">
        {items.map((item) => {
        const isYourItem = item.seller.toLowerCase() === userAddress.toLowerCase();
        const displayPrice = getDisplayPrice(item.id, item.price);
        
        // Marcar como manipulado si este item está siendo atacado
        const isManipulated = priceManipulation.isActive && 
                            priceManipulation.manipulatedItemId === item.id;
        
        // Debug logging for each item (only when manipulation is active)
        if (priceManipulation.isActive) {
          console.log(`🔍 Item ${item.id}: actualPrice=${item.price}, displayPrice=${displayPrice}, isManipulated=${isManipulated}, originalStored=${priceManipulation.originalPrices[item.id]}, manipulatedPrice=${priceManipulation.manipulatedPrices[item.id]}`);
        }
        
        return (
          <div key={item.id} className={`item-card ${isYourItem ? 'your-item' : ''} ${isManipulated ? 'price-manipulated' : ''}`}>
            <div className="item-image">
              {item.imageUrl && item.imageUrl !== '' && item.imageUrl !== 'placeholder-image' && item.imageUrl !== 'failed-upload' ? (
                <img 
                  src={item.imageUrl.startsWith('http') ? item.imageUrl : `https://ipfs.io/ipfs/${item.imageUrl}`} 
                  alt={item.name} 
                  onError={(e) => {
                    // Si la imagen falla al cargar, usar la imagen por defecto
                    e.currentTarget.src = '/default-item.svg';
                  }}
                />
              ) : (
                <img 
                  src="/default-item.svg" 
                  alt={item.name} 
                  className="default-item-image"
                />
              )}
            </div>
            
            <div className="item-details">
              <h3>{item.name}</h3>
              <p className="description">{item.description}</p>
              <div className="price-section">
                <p className={`price ${isManipulated ? 'cached-price' : ''}`}>
                  {displayPrice} ETH
                  {isManipulated && (
                    <span className="price-status">
                      💰 (Cached price - may be outdated)
                    </span>
                  )}
                </p>
              </div>
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
    </div>
  );
}; 