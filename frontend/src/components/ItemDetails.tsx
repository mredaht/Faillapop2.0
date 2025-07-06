import React, { useState } from 'react';
import { ethers } from 'ethers';
import { Item, ItemStateHelpers } from '../types/Item';
import { ContractService } from '../services/ContractService';
import { useUser } from '../context/UserContext';

interface ItemDetailsProps {
  item: Item;
  onClose: () => void;
  onBuy: (item: Item) => void;
  onDispute: (item: Item, reason: string) => void;
  onConfirmReceipt: (item: Item) => void;
  userAddress: string;
  isOpen: boolean;
  isSecurityDemo: boolean;
  contractService: ContractService;
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

export const ItemDetails: React.FC<ItemDetailsProps> = ({
  item,
  onClose,
  onBuy,
  onDispute,
  onConfirmReceipt,
  userAddress,
  isOpen,
  isSecurityDemo,
  contractService
}) => {
  const { getDisplayPrice, priceManipulation: globalPriceManipulation } = useUser();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [disputeReason, setDisputeReason] = useState('');

  const [racePriceAttack, setRacePriceAttack] = useState(false);
  const [priceManipulation, setPriceManipulation] = useState(false);

  if (!isOpen) return null;

  const handleBuy = async () => {
    setLoading(true);
    setError(null);
    
    try {
      if (isSecurityDemo) {
        if (item.id === 999) {
          // Demo mode - just show security warnings
          alert('🚨 SECURITY DEMO: This would be a real purchase in a production environment!');
          return;
        }
        
        // For security demo with real items, demonstrate vulnerabilities
        if (racePriceAttack) {
          alert('🚨 RACE CONDITION ATTACK: Price manipulation detected! In a real attack, this could result in paying more than intended.');
        }
        
        if (priceManipulation) {
          alert('🚨 PRICE MANIPULATION: This demonstrates how vulnerable UIs can be exploited for financial gain.');
        }
      }
      
      await onBuy(item);
      onClose();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error processing purchase');
    } finally {
      setLoading(false);
    }
  };

  const handleDispute = async () => {
    if (!disputeReason.trim()) {
      setError('Please provide a reason for the dispute');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      await onDispute(item, disputeReason);
      onClose();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error opening dispute');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmReceipt = async () => {
    setLoading(true);
    setError(null);
    
    try {
      await onConfirmReceipt(item);
      onClose();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error confirming receipt');
    } finally {
      setLoading(false);
    }
  };

  // Demonstrate race condition attack
  const handleRaceConditionDemo = async () => {
    if (!isSecurityDemo || item.id === 999) {
      alert('🚨 DEMO MODE: This would trigger a real race condition attack!');
      return;
    }
    
    setRacePriceAttack(true);
    setTimeout(() => setRacePriceAttack(false), 2000);
    
    // Simulate race condition by trying to change price while purchase is processing
    alert('🚨 RACE CONDITION DEMO: Attempting to manipulate price during purchase...');
    
    // In a real attack, this would:
    // 1. Monitor pending transactions
    // 2. Submit a price change with higher gas
    // 3. Front-run the buyer's transaction
    
    try {
      const newPrice = (parseFloat(item.price) * 1.5).toString();
      await contractService.quickPriceChange(item.id, ethers.utils.parseEther(newPrice));
      alert(`🚨 VULNERABILITY EXPLOITED: Price changed to ${newPrice} ETH during purchase!`);
    } catch (error) {
      console.error('Race condition demo error:', error);
      alert('🚨 RACE CONDITION DEMO: Attack simulation complete (may fail due to timing)');
    }
  };

  // Demonstrate price manipulation
  const handlePriceManipulationDemo = () => {
    if (!isSecurityDemo) return;
    
    setPriceManipulation(true);
    setTimeout(() => setPriceManipulation(false), 3000);
    
    // Simulate UI manipulation
    const originalPrice = item.price;
    const manipulatedPrice = (parseFloat(originalPrice) * 0.1).toString();
    
    alert(`🚨 PRICE MANIPULATION DEMO: 
    Original Price: ${originalPrice} ETH
    Manipulated Display: ${manipulatedPrice} ETH
    
    This demonstrates how malicious frontends can display false prices while executing transactions at real prices!`);
  };

  const isOwner = userAddress && item.seller.toLowerCase() === userAddress.toLowerCase();
  const canBuy = ItemStateHelpers.isAvailableForPurchase(item.state) && !isOwner;
  const canDispute = ItemStateHelpers.canDispute(item.state) && 
                     userAddress && 
                     userAddress.toLowerCase() === item.buyer?.toLowerCase();
  const canConfirmReceipt = ItemStateHelpers.canConfirmReceipt(item.state) && 
                           userAddress && 
                           userAddress.toLowerCase() === item.buyer?.toLowerCase(); // Disabled for now as we don't have receipt confirmation state

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        {/* Header del modal */}
        <div className="modal-header">
          <h2 className="modal-title">{item.name}</h2>
          <button onClick={onClose} className="modal-close">×</button>
        </div>

        {/* Body del modal */}
        <div className="modal-body">
          <div className="modal-item-details">
            
            {/* Descripción del item */}
            <div className="modal-item-description">
              <h4>Description</h4>
              <p>{item.description}</p>
            </div>

            {/* Información del item en tarjetas */}
            <div className="modal-item-meta">
              <div className="modal-meta-card modal-price-card">
                <div className="modal-meta-icon">💰</div>
                <div className="modal-meta-info">
                  <p className="modal-meta-label">Price</p>
                  <p className="modal-meta-value">
                    {getDisplayPrice(item.id, item.price)} ETH
                    {globalPriceManipulation.isActive && globalPriceManipulation.manipulatedItemId === item.id && (
                      <span style={{display: 'block', fontSize: '0.8rem', color: '#f39c12', fontStyle: 'italic'}}>
                        💰 (Cached price - may be outdated)
                      </span>
                    )}
                  </p>
                </div>
              </div>

              <div className="modal-meta-card modal-seller-card">
                <div className="modal-meta-icon">👤</div>
                <div className="modal-meta-info">
                  <p className="modal-meta-label">Seller</p>
                  <p className="modal-meta-value">{`${item.seller.slice(0, 6)}...${item.seller.slice(-4)}`}</p>
                </div>
              </div>

              {item.buyer && (
                <div className="modal-meta-card">
                  <div className="modal-meta-icon">🛒</div>
                  <div className="modal-meta-info">
                    <p className="modal-meta-label">Buyer</p>
                    <p className="modal-meta-value">{`${item.buyer.slice(0, 6)}...${item.buyer.slice(-4)}`}</p>
                  </div>
                </div>
              )}

              {item.buyTimestamp && (
                <div className="modal-meta-card">
                  <div className="modal-meta-icon">📅</div>
                  <div className="modal-meta-info">
                    <p className="modal-meta-label">Purchase Date</p>
                    <p className="modal-meta-value">{new Date(item.buyTimestamp * 1000).toLocaleDateString()}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Status section */}
            <div className="modal-status-section">
              <h4>Current Status</h4>
              <span 
                className={`status-badge ${getStatusBadgeClass(item.state)}`}
                style={{ 
                  backgroundColor: ItemStateHelpers.getStateColor(item.state),
                  display: 'inline-flex'
                }}
              >
                {ItemStateHelpers.getStateLabel(item.state)}
              </span>
            </div>

            {/* Security demo section */}
            {isSecurityDemo && (
              <div className="security-demo-section">
                <h3>🚨 Vulnerability Testing</h3>
                <p>This section demonstrates Web3 security vulnerabilities:</p>
                
                <div className="button-group">
                  <button 
                    onClick={handleRaceConditionDemo}
                    className="button button-warning"
                    disabled={loading}
                  >
                    🏃‍♂️ Demo Race Condition Attack
                  </button>
                  
                  <button 
                    onClick={handlePriceManipulationDemo}
                    className="button button-warning"
                    disabled={loading}
                  >
                    💰 Demo Price Manipulation
                  </button>
                </div>
                
                {racePriceAttack && (
                  <div className="attack-indicator">
                    <p>🚨 RACE CONDITION ATTACK IN PROGRESS...</p>
                  </div>
                )}
                
                {priceManipulation && (
                  <div className="attack-indicator">
                    <p>🚨 PRICE MANIPULATION ACTIVE...</p>
                  </div>
                )}
              </div>
            )}

            {/* Dispute section */}
            {canDispute && (
              <div className="modal-status-section">
                <h4>Open Dispute</h4>
                <textarea
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  placeholder="Enter your reason for dispute..."
                  className="dispute-input"
                />
              </div>
            )}

            {/* Error message */}
            {error && <div className="error">{error}</div>}
          </div>
        </div>

        {/* Actions del modal */}
        <div className="modal-actions">
          {canBuy && !isSecurityDemo && (
            <button
              onClick={handleBuy}
              disabled={loading}
              className="modal-action-button modal-buy-button"
            >
              {loading ? 'Processing...' : '🛒 Buy Now'}
            </button>
          )}

          {canDispute && (
            <button
              onClick={handleDispute}
              disabled={loading || !disputeReason}
              className="modal-action-button modal-dispute-button"
            >
              {loading ? 'Processing...' : '⚖️ Open Dispute'}
            </button>
          )}

          {canConfirmReceipt && (
            <button
              onClick={handleConfirmReceipt}
              disabled={loading}
              className="modal-action-button modal-confirm-button"
            >
              {loading ? 'Processing...' : '✅ Confirm Receipt'}
            </button>
          )}

          <button
            onClick={onClose}
            className="modal-action-button modal-cancel-button"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}; 