import React, { useState } from 'react';
import { ethers } from 'ethers';
import { Item, ItemStateHelpers } from '../types/Item';
import { ContractService } from '../services/ContractService';

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
      <div className="modal">
        <button onClick={onClose} className="modal-close">×</button>

        <h2>{item.name}</h2>
        <p className="description">{item.description}</p>
        
        <div className="details">
          <p><strong>Price:</strong> {item.price} ETH</p>
          <p><strong>Seller:</strong> {`${item.seller.slice(0, 6)}...${item.seller.slice(-4)}`}</p>
          {item.buyer && (
            <p><strong>Buyer:</strong> {`${item.buyer.slice(0, 6)}...${item.buyer.slice(-4)}`}</p>
          )}
          <p><strong>Status:</strong> 
            <span 
              className={`status-badge ${getStatusBadgeClass(item.state)}`}
              style={{ 
                backgroundColor: ItemStateHelpers.getStateColor(item.state),
                marginLeft: '8px',
                display: 'inline-flex'
              }}
            >
              {ItemStateHelpers.getStateLabel(item.state)}
            </span>
          </p>
          {item.buyTimestamp && (
            <p><strong>Purchase Date:</strong> {new Date(item.buyTimestamp * 1000).toLocaleDateString()}</p>
          )}
        </div>

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

        <div className="item-actions">
          {canBuy && !isSecurityDemo && (
            <button
              onClick={handleBuy}
              disabled={loading}
              className="button button-primary"
            >
              {loading ? 'Processing...' : 'Buy Now'}
            </button>
          )}

          {canDispute && (
            <div className="dispute-section">
              <textarea
                value={disputeReason}
                onChange={(e) => setDisputeReason(e.target.value)}
                placeholder="Enter your reason for dispute..."
                className="dispute-input"
              />
              <button
                onClick={handleDispute}
                disabled={loading || !disputeReason}
                className="button button-warning"
              >
                {loading ? 'Processing...' : 'Open Dispute'}
              </button>
            </div>
          )}

          {canConfirmReceipt && (
            <button
              onClick={handleConfirmReceipt}
              disabled={loading}
              className="button button-success"
            >
              {loading ? 'Processing...' : 'Confirm Receipt'}
            </button>
          )}
        </div>

        {error && <div className="error">{error}</div>}
      </div>
    </div>
  );
}; 