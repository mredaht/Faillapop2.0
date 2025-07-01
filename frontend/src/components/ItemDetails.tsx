import React, { useState } from 'react';
import { Item, ItemState, ItemStateHelpers } from '../types/Item';
import { ethers } from 'ethers';

interface ItemDetailsProps {
  item: Item;
  onClose: () => void;
  onBuy: (item: Item) => Promise<void>;
  onDispute?: (item: Item, reason: string) => Promise<void>;
  onConfirmReceipt?: (item: Item) => Promise<void>;
  userAddress?: string | null;
  isOpen: boolean;
  isSecurityDemo?: boolean;
  contractService?: any;
}

export const ItemDetails: React.FC<ItemDetailsProps> = ({
  item,
  onClose,
  onBuy,
  onDispute,
  onConfirmReceipt,
  userAddress,
  isOpen,
  isSecurityDemo = false,
  contractService
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [disputeReason, setDisputeReason] = useState('');
  
  // Security Demo states
  const [isVulnerableMode, setIsVulnerableMode] = useState(false);
  const [raceConditionActive, setRaceConditionActive] = useState(false);
  const [priceManipulation, setPriceManipulation] = useState(false);
  const [manipulatedPrice, setManipulatedPrice] = useState(item.price);

  if (!isOpen) return null;

  const handleBuy = async () => {
    try {
      setLoading(true);
      setError(null);
      await onBuy(item);
      onClose();
    } catch (error) {
      setError('Error buying item');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDispute = async () => {
    if (!onDispute || !disputeReason) return;
    
    try {
      setLoading(true);
      setError(null);
      await onDispute(item, disputeReason);
      onClose();
    } catch (error) {
      setError('Error disputing item');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmReceipt = async () => {
    if (!onConfirmReceipt) return;
    
    try {
      setLoading(true);
      setError(null);
      await onConfirmReceipt(item);
      onClose();
    } catch (error) {
      setError('Error confirming receipt');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Vulnerable purchase functions for security demo
  const handleVulnerableBuy = async () => {
    if (!contractService) return;
    
    try {
      setLoading(true);
      setError(null);
      
      console.log('🚨 VULNERABILITY DEMONSTRATION: Purchase Attack Simulation');
      console.log(`Target item: ID ${item.id}, Name: ${item.name}`);
      if (item.id === 999) {
        console.log('Note: This is a demo item (ID 999) that does not exist on-chain');
      } else {
        console.log('⚠️ WARNING: This is a REAL item from the marketplace!');
      }
      
      if (raceConditionActive) {
        // Simulate race condition by sending multiple transactions rapidly
        console.log('⚡ Launching race condition attack...');
        const promises = [];
        
        for (let i = 0; i < 3; i++) {
          promises.push(
            contractService.buyItem(item.id, priceManipulation ? manipulatedPrice : item.price)
              .catch((error: any) => {
                console.log(`Transaction ${i + 1} failed (expected):`, error.reason || error.message);
                return { error: error.message, status: 'failed' };
              })
          );
        }
        
        const results = await Promise.allSettled(promises);
        console.log('Race condition results:', results);
        
        // Show educational alert
        const isRealItem = item.id !== 999;
        alert(`🚨 RACE CONDITION ATTACK DEMONSTRATED!
        
✅ Successfully sent 3 simultaneous transactions!
📊 Results: ${isRealItem ? 'Check console for actual results' : 'All failed as expected (demo item doesn\'t exist)'}

${isRealItem ? 
  `⚠️ WARNING: This attack was performed on a REAL marketplace item!
- If successful, multiple purchases could occur
- This could drain buyer's funds  
- Inventory could be bypassed` :
  `In a real scenario with existing items, this could:
- Bypass inventory checks
- Exploit price changes between transactions  
- Create double-spending scenarios
- Cause state inconsistencies`}

🔒 Smart contract ${isRealItem ? 'should protect against' : 'protected us by validating'} ${isRealItem ? 'duplicate purchases' : 'item existence'}!

Protection methods:
- Use mutex locks in smart contracts
- Implement proper state checks  
- Use commit-reveal schemes
- Add transaction ordering protections`);
        
      } else if (priceManipulation) {
        // Simulate price manipulation
        console.log('💰 Attempting price manipulation attack...');
        console.log(`Original price: ${item.price} ETH`);
        console.log(`Manipulated price: ${manipulatedPrice} ETH`);
        
        try {
          await contractService.buyItem(item.id, manipulatedPrice);
        } catch (error: any) {
          console.log('Price manipulation failed (expected):', error.reason || error.message);
        }
        
        const isRealItem = item.id !== 999;
        alert(`🚨 PRICE MANIPULATION ATTACK DEMONSTRATED!
        
✅ Attempted to purchase at manipulated price:
- Listed price: ${item.price} ETH  
- Attack price: ${manipulatedPrice} ETH
📊 Result: ${isRealItem ? 'Check console and wallet for actual results' : 'Failed as expected (demo item doesn\'t exist)'}

${isRealItem ? 
  `⚠️ WARNING: This attack was performed on a REAL marketplace item!
- If successful, you would pay ${manipulatedPrice} ETH instead of ${item.price} ETH
- This could result in financial loss for the seller
- Real funds could be at risk` :
  `In a real scenario, this could exploit:
- Frontend-backend price synchronization issues
- Client-side validation bypasses
- Time-of-check vs time-of-use vulnerabilities`}

🔒 Contract validation ${isRealItem ? 'should protect' : 'protected'} against this attack!

Protection methods:
- Always validate prices on-chain
- Use price oracles for market rates
- Implement proper access controls
- Add price change notifications`);
        
      } else {
        // Normal vulnerable buy (client-side validation bypass)
        console.log('🔓 Attempting client-side validation bypass...');
        console.log('Simulating: buying own item, manipulated price, disabled button bypass');
        
        try {
          await contractService.buyItem(item.id, '0.001');
        } catch (error: any) {
          console.log('Validation bypass failed (expected):', error.reason || error.message);
        }
        
        alert(`🚨 CLIENT-SIDE VALIDATION BYPASS DEMONSTRATED!
        
✅ Attempted to bypass frontend restrictions:
- Buying own items
- Manipulated prices (0.001 ETH instead of ${item.price} ETH)
- Disabled button bypasses
📊 Result: Failed as expected (demo item doesn't exist)

🔒 Smart contract validation worked correctly!

This demonstrates why server-side validation is crucial:
- Never trust client-side validation
- Implement all checks on-chain
- Use proper authorization
- Validate all parameters server-side`);
      }
      
      onClose();
    } catch (error: any) {
      const isRealItem = item.id !== 999;
      
      if (isRealItem) {
        console.log('🚨 Attack on real item failed:', error.reason || error.message);
        alert(`🔒 SMART CONTRACT PROTECTION ACTIVATED!

The attack on the real marketplace item (ID: ${item.id}) was blocked by the smart contract.

Error: ${error.reason || error.message}

✅ What this demonstrates:
- Smart contracts can protect against malicious transactions
- On-chain validation is crucial for security
- Even if frontend is compromised, blockchain validates everything

🎓 Educational value:
- This shows both attack vectors AND protections
- Real smart contract security in action
- Importance of proper validation logic`);
      } else {
        console.log('🎓 Educational note: Transaction failed as expected for demo item');
        alert(`🎓 EDUCATIONAL DEMO COMPLETED!

The transaction failed because this is a demo item (ID: ${item.id}) that doesn't exist on the blockchain.

✅ What we successfully demonstrated:
- Race condition attack patterns
- Price manipulation techniques  
- Client-side validation bypasses

🔒 What the smart contract protected against:
- Invalid item IDs
- Non-existent items
- Malicious parameters

In a real attack scenario with valid items, these vulnerabilities could be exploited if proper validation wasn't implemented.`);
      }
      
      onClose();
    } finally {
      setLoading(false);
    }
  };

  // Enhanced state checks using the new state system
  const canBuy = ItemStateHelpers.isAvailableForPurchase(item.state) && 
                 userAddress && 
                 userAddress.toLowerCase() !== item.seller.toLowerCase();
  
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
            <span style={{ color: ItemStateHelpers.getStateColor(item.state), marginLeft: '8px' }}>
              {ItemStateHelpers.getStateLabel(item.state)}
            </span>
          </p>
          {item.buyTimestamp && (
            <p><strong>Purchase Date:</strong> {new Date(item.buyTimestamp * 1000).toLocaleDateString()}</p>
          )}
        </div>

        {canBuy && isSecurityDemo && (
          <div className="security-demo-section">
            <div className="vulnerability-warning">
              <h3>🚨 Security Vulnerability Demo</h3>
              <p>This item demonstrates purchase-related vulnerabilities</p>
            </div>
            
            <div className="attack-controls">
              <label className="attack-option">
                <input
                  type="checkbox"
                  checked={isVulnerableMode}
                  onChange={(e) => setIsVulnerableMode(e.target.checked)}
                />
                Enable Vulnerability Mode
              </label>
              
              {isVulnerableMode && (
                <div className="attack-types">
                  <label className="attack-option">
                    <input
                      type="radio"
                      name="attackType"
                      checked={raceConditionActive && !priceManipulation}
                      onChange={() => {
                        setRaceConditionActive(true);
                        setPriceManipulation(false);
                      }}
                    />
                    Race Condition Attack
                  </label>
                  
                  <label className="attack-option">
                    <input
                      type="radio"
                      name="attackType"
                      checked={priceManipulation && !raceConditionActive}
                      onChange={() => {
                        setPriceManipulation(true);
                        setRaceConditionActive(false);
                      }}
                    />
                    Price Manipulation
                  </label>
                  
                  {priceManipulation && (
                    <div className="price-manipulation">
                      <label>Manipulated Price (ETH):</label>
                      <input
                        type="number"
                        step="0.001"
                        value={manipulatedPrice}
                        onChange={(e) => setManipulatedPrice(e.target.value)}
                        className="price-input"
                      />
                    </div>
                  )}
                  
                  <label className="attack-option">
                    <input
                      type="radio"
                      name="attackType"
                      checked={!raceConditionActive && !priceManipulation}
                      onChange={() => {
                        setRaceConditionActive(false);
                        setPriceManipulation(false);
                      }}
                    />
                    Client-side Validation Bypass
                  </label>
                </div>
              )}
            </div>
            
            <div className="vulnerable-actions">
              <button
                onClick={isVulnerableMode ? handleVulnerableBuy : handleBuy}
                disabled={loading}
                className={`button ${isVulnerableMode ? 'danger' : 'primary'}`}
              >
                {loading ? 'Processing...' : isVulnerableMode ? '🚨 Execute Vulnerable Purchase' : 'Buy Now'}
              </button>
              
              {isVulnerableMode && (
                <p className="attack-description">
                  {raceConditionActive && "Will send multiple simultaneous transactions"}
                  {priceManipulation && `Will attempt to buy at ${manipulatedPrice} ETH instead of ${item.price} ETH`}
                  {!raceConditionActive && !priceManipulation && "Will bypass client-side validations"}
                </p>
              )}
            </div>
          </div>
        )}

        {canBuy && !isSecurityDemo && (
          <button
            onClick={handleBuy}
            disabled={loading}
            className="button primary"
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
              className="button warning"
            >
              {loading ? 'Processing...' : 'Open Dispute'}
            </button>
          </div>
        )}

        {canConfirmReceipt && (
          <button
            onClick={handleConfirmReceipt}
            disabled={loading}
            className="button success"
          >
            {loading ? 'Processing...' : 'Confirm Receipt'}
          </button>
        )}

        {error && <div className="error">{error}</div>}
      </div>
    </div>
  );
}; 