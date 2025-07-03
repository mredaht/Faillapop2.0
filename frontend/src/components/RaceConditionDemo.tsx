import React, { useState, useEffect } from 'react';
import { ContractService } from '../services/ContractService';
import { ethers } from 'ethers';
import { ItemState } from '../types/Item';
import './RaceConditionDemo.css';

interface RaceConditionDemoProps {
  contractService: ContractService;
  userAddress: string;
}

interface AttackScenario {
  id: string;
  name: string;
  description: string;
  type: 'race' | 'price';
  enabled: boolean;
}

const RaceConditionDemo: React.FC<RaceConditionDemoProps> = ({ contractService, userAddress }) => {
  const [availableItems, setAvailableItems] = useState<any[]>([]);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [attackScenario, setAttackScenario] = useState<AttackScenario | null>(null);
  const [isAttacking, setIsAttacking] = useState(false);
  const [attackResults, setAttackResults] = useState<any[]>([]);
  const [priceManipulationValue, setPriceManipulationValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const scenarios: AttackScenario[] = [
    {
      id: 'race_multiple_buyers',
      name: 'Race Condition: Multiple Buyers',
      description: 'Simulate multiple buyers trying to purchase the same item simultaneously',
      type: 'race',
      enabled: true
    },
    {
      id: 'price_manipulation',
      name: 'Price Manipulation Attack',
      description: 'Change item price while purchase transaction is being processed',
      type: 'price',
      enabled: true
    },
    {
      id: 'race_price_combo',
      name: 'Combined Race + Price Attack',
      description: 'Combine race conditions with price manipulation for maximum chaos',
      type: 'race',
      enabled: true
    }
  ];

  useEffect(() => {
    if (userAddress) {
      console.log('🔍 DEBUG - useEffect triggered with userAddress:', userAddress);
      loadAvailableItems();
    }
  }, [userAddress]);

  const loadAvailableItems = async () => {
    console.log('🔍 DEBUG - ContractService initialized:', !!contractService);
    
    if (!contractService) {
      console.error('ContractService not initialized');
      return;
    }

    try {
      setIsLoading(true);
      console.log('🔍 DEBUG - Race Condition Demo - Loading items');
      const allItems = await contractService.getAllItems();
      console.log('Total items fetched:', allItems.length);
      console.log('Current user address:', userAddress);
      console.log('All items:', allItems);
      
      // For race condition and price manipulation demos, we need items that can be attacked
      // This includes:
      // 1. Items from other users (as buyers attacking sellers)
      // 2. Items from current user (as malicious seller manipulating own prices)
      const attackableItems = allItems.filter(item => {
        const isSellingState = item.state === ItemState.Selling;
        const isUserOwned = item.seller.toLowerCase() === userAddress.toLowerCase();
        const isOtherUserOwned = item.seller.toLowerCase() !== userAddress.toLowerCase();
        
        console.log(`Item ${item.id} (${item.name}): state=${item.state} (ItemState.Selling=${ItemState.Selling}, isSellingState=${isSellingState}), isUserOwned=${isUserOwned}, isOtherUserOwned=${isOtherUserOwned}`);
        
        // Include items in Selling state (both user's own and others')
        return isSellingState;
      });
      
      console.log('Attackable items after filtering:', attackableItems.length);
      console.log('Attackable items:', attackableItems);
      
      setAvailableItems(attackableItems);
    } catch (error: any) {
      console.error('Error loading items:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const executeRaceConditionAttack = async (itemId: number) => {
    console.log('🚨 EXECUTING RACE CONDITION ATTACK');
    console.log(`Target Item ID: ${itemId}`);
    
    const results: any[] = [];
    const promises: Promise<any>[] = [];

    // Launch 5 simultaneous purchase attempts
    for (let i = 0; i < 5; i++) {
      promises.push(
        contractService.buyItem(itemId)
          .then((tx: any) => {
            console.log(`Purchase attempt ${i + 1} successful:`, tx);
            return { attempt: i + 1, status: 'success', tx };
          })
          .catch((error: any) => {
            console.log(`Purchase attempt ${i + 1} failed:`, error.message);
            return { attempt: i + 1, status: 'failed', error: error.message };
          })
      );
    }

    try {
      const allResults = await Promise.allSettled(promises);
      allResults.forEach((result, index) => {
        results.push({
          attempt: index + 1,
          status: result.status,
          value: result.status === 'fulfilled' ? result.value : result.reason
        });
      });
    } catch (error: any) {
      console.error('Race condition attack failed:', error);
      results.push({ type: 'error', status: 'failed', error: error.message });
    }

    return results;
  };

  const executePriceManipulationAttack = async (itemId: number, newPrice: string) => {
    console.log('🚨 EXECUTING PRICE MANIPULATION ATTACK');
    console.log(`Target Item ID: ${itemId}`);
    console.log(`New Price: ${newPrice} ETH`);
    
    const results = [];
    
    try {
      // First, check if user owns the item
      const item = availableItems.find(item => item.id === itemId);
      if (!item) throw new Error('Item not found');

      const isOwner = item.seller.toLowerCase() === userAddress.toLowerCase();
      
      console.log(`Original price: ${item.price} ETH`);
      console.log(`Manipulated price: ${newPrice} ETH`);
      console.log(`User is owner: ${isOwner}`);

      if (isOwner) {
        // Scenario 1: User is the seller - demonstrate malicious seller behavior
        console.log('🎭 SCENARIO: Malicious Seller Price Manipulation');
        console.log('You are the seller of this item. This demonstrates how a malicious seller could:');
        console.log('1. Change price during a buyer\'s transaction');
        console.log('2. Exploit race conditions in the purchase process');
        
        // Simulate a buyer attempting to purchase while seller manipulates price
        const purchasePromise = new Promise((resolve, reject) => {
          setTimeout(() => {
            console.log('📋 Simulating buyer purchase attempt...');
            resolve({ type: 'simulated_purchase', status: 'attempted', message: 'Buyer attempted to buy at original price' });
          }, 500);
        });

        // Change price during "buyer's transaction"
        setTimeout(async () => {
          try {
            console.log('💰 Seller changing price during buyer transaction...');
            const priceInWei = ethers.utils.parseEther(newPrice);
            const tx = await contractService.quickPriceChange(itemId, priceInWei);
            console.log('✅ Price change successful:', tx);
            results.push({ type: 'price_change', status: 'success', tx, message: 'Seller successfully manipulated price during buyer transaction' });
          } catch (error: any) {
            console.log('❌ Price change failed:', error.message);
            results.push({ type: 'price_change', status: 'failed', error: error.message });
          }
        }, 1000);

        const purchaseResult = await purchasePromise;
        results.push(purchaseResult);
        
        // Add explanation
        results.push({
          type: 'explanation',
          status: 'info',
          message: 'This demonstrates how a malicious seller can manipulate prices during active transactions, potentially causing buyers to pay unexpected amounts.'
        });

      } else {
        // Scenario 2: User is not the owner - demonstrate buyer-side attack attempt
        console.log('🛡️ SCENARIO: Buyer Attempting Price Manipulation (Should Fail)');
        console.log('You are not the seller. This demonstrates that:');
        console.log('1. Only sellers can change prices (good security)');
        console.log('2. But race conditions can still occur during purchases');
        
        // Attempt to change price (should fail)
        try {
          const priceInWei = ethers.utils.parseEther(newPrice);
          const tx = await contractService.quickPriceChange(itemId, priceInWei);
          results.push({ type: 'price_change', status: 'unexpected_success', tx, message: 'Buyer successfully changed price - THIS IS A VULNERABILITY!' });
        } catch (error: any) {
          results.push({ type: 'price_change', status: 'failed', error: error.message, message: 'Buyer cannot change price - security working correctly' });
        }

        // But we can still demonstrate race conditions in purchases
        console.log('🏃 Attempting purchase race condition...');
        const purchasePromise = contractService.buyItem(itemId)
          .then((tx) => {
            console.log('Purchase transaction successful:', tx);
            return { type: 'purchase', status: 'success', tx, message: 'Purchase completed' };
          })
          .catch((error) => {
            console.log('Purchase transaction failed:', error.message);
            return { type: 'purchase', status: 'failed', error: error.message };
          });

        const purchaseResult = await purchasePromise;
        results.push(purchaseResult);
        
        // Add explanation
        results.push({
          type: 'explanation',
          status: 'info',
          message: 'While buyers cannot manipulate prices, race conditions in purchases can still occur when multiple buyers target the same item.'
        });
      }

      return results;
    } catch (error: any) {
      console.error('Price manipulation attack failed:', error);
      return [{ type: 'attack', status: 'failed', error: error.message }];
    }
  };

  const executeCombinedAttack = async (itemId: number, newPrice: string) => {
    console.log('🚨 EXECUTING COMBINED RACE + PRICE ATTACK');
    
    const results: any[] = [];
    
    try {
      // First, change the price to create confusion
      const priceInWei = ethers.utils.parseEther(newPrice);
      
      // Launch price manipulation and race condition simultaneously
      const priceChangePromise = contractService.quickPriceChange(itemId, priceInWei)
        .then((tx) => ({ type: 'price_change', status: 'success', tx }))
        .catch((error) => ({ type: 'price_change', status: 'failed', error: error.message }));

      // Launch multiple purchases with slight delays
      const purchasePromises: Promise<any>[] = [];
      for (let i = 0; i < 3; i++) {
        setTimeout(() => {
          purchasePromises.push(
            contractService.buyItem(itemId)
              .then((tx: any) => ({ type: 'purchase', index: i + 1, status: 'success', tx }))
              .catch((error: any) => ({ type: 'purchase', index: i + 1, status: 'failed', error: error.message }))
          );
        }, i * 500); // Stagger the purchases
      }

      const allPromises = [priceChangePromise, ...purchasePromises];
      const allResults = await Promise.allSettled(allPromises);
      
      return allResults.map((result, index) => ({
        index: index + 1,
        status: result.status,
        value: result.status === 'fulfilled' ? result.value : result.reason
      }));
    } catch (error: any) {
      console.error('Combined attack failed:', error);
      return [{ type: 'attack', status: 'failed', error: error.message }];
    }
  };

  const handleAttackExecution = async () => {
    if (!selectedItem || !attackScenario) return;

    setIsAttacking(true);
    setAttackResults([]);

    try {
      let results: any[] = [];
      
      switch (attackScenario.id) {
        case 'race_multiple_buyers':
          results = await executeRaceConditionAttack(selectedItem.id);
          break;
        case 'price_manipulation':
          if (!priceManipulationValue) {
            alert('Please enter a price for manipulation');
            return;
          }
          results = await executePriceManipulationAttack(selectedItem.id, priceManipulationValue);
          break;
        case 'race_price_combo':
          if (!priceManipulationValue) {
            alert('Please enter a price for manipulation');
            return;
          }
          results = await executeCombinedAttack(selectedItem.id, priceManipulationValue);
          break;
        default:
          console.error('Unknown attack scenario');
      }

      setAttackResults(results);
      
      // Refresh items after attack
      await loadAvailableItems();
      
    } catch (error: any) {
      console.error('Attack execution failed:', error);
      setAttackResults([{ type: 'error', status: 'failed', error: error.message }]);
    } finally {
      setIsAttacking(false);
    }
  };

  return (
    <div className="race-condition-demo">
      <div className="demo-header">
        <h2>🚨 Race Condition & Price Manipulation Demo</h2>
        <p className="warning-text">
          This demonstrates real vulnerabilities in the marketplace contract. 
          Use this for educational purposes only!
        </p>
        <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '0.9rem' }}>
          <strong>📋 How to test:</strong>
          <br />• <strong>Your Own Items:</strong> Test as a malicious seller manipulating prices during transactions
          <br />• <strong>Other Users' Items:</strong> Test as a buyer attempting attacks (will show security protection)
          <br />• <strong>Race Conditions:</strong> Multiple simultaneous purchases on the same item
          <br />• Go to "🛒 Marketplace" tab to create items if none are available
          <br />
          <br /><strong>💡 Realistic Scenarios:</strong>
          <br />• Seller changing price while buyer is purchasing
          <br />• Multiple buyers racing to buy limited items
          <br />• Price manipulation during network delays
        </div>
      </div>

      <div className="demo-content">
        <div className="item-selection">
          <h3>1. Select Target Item</h3>
          <button 
            onClick={loadAvailableItems} 
            disabled={isLoading}
            style={{ 
              marginBottom: '1rem', 
              padding: '0.5rem 1rem', 
              background: '#3498db', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            {isLoading ? 'Loading...' : '🔄 Refresh Items'}
          </button>
          {isLoading ? (
            <div className="loading">Loading items...</div>
          ) : availableItems.length === 0 ? (
            <div className="no-items">
              <p>No items available for attack.</p>
              <div style={{ marginTop: '1rem', padding: '1rem', background: '#f0f0f0', borderRadius: '8px', fontSize: '0.9rem' }}>
                <strong>Debug Info:</strong>
                <br />• Check browser console for detailed logs
                <br />• Make sure you have items in "Selling" state
                <br />• Items you own will not appear here
                <br />• Current user: {userAddress ? `${userAddress.slice(0, 6)}...${userAddress.slice(-4)}` : 'Not connected'}
              </div>
            </div>
          ) : (
            <div className="items-grid">
              {availableItems.map(item => {
                const isUserOwned = item.seller.toLowerCase() === userAddress.toLowerCase();
                return (
                  <div 
                    key={item.id}
                    className={`attack-item ${selectedItem?.id === item.id ? 'selected' : ''}`}
                    onClick={() => setSelectedItem(item)}
                  >
                    <h4>{item.name}</h4>
                    <p className="price">{item.price} ETH</p>
                    <p className="seller">Seller: {item.seller.slice(0, 6)}...{item.seller.slice(-4)}</p>
                    <div className="item-id">ID: {item.id}</div>
                    <div className={`scenario-badge ${isUserOwned ? 'owned' : 'other'}`}>
                      {isUserOwned ? '🎭 Malicious Seller Demo' : '🛡️ Buyer Attack Demo'}
                    </div>
                    {isUserOwned && (
                      <div className="scenario-explanation">
                        Test price manipulation as seller
                      </div>
                    )}
                    {!isUserOwned && (
                      <div className="scenario-explanation">
                        Test purchase race conditions as buyer
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="attack-selection">
          <h3>2. Select Attack Scenario</h3>
          <div className="scenarios">
            {scenarios.map(scenario => (
              <div 
                key={scenario.id}
                className={`scenario ${attackScenario?.id === scenario.id ? 'selected' : ''} ${!scenario.enabled ? 'disabled' : ''}`}
                onClick={() => scenario.enabled && setAttackScenario(scenario)}
              >
                <h4>{scenario.name}</h4>
                <p>{scenario.description}</p>
                <span className="scenario-type">{scenario.type}</span>
              </div>
            ))}
          </div>
        </div>

        {attackScenario && (attackScenario.type === 'price' || attackScenario.id === 'race_price_combo') && (
          <div className="price-manipulation-config">
            <h3>3. Configure Price Manipulation</h3>
            <div className="form-group">
              <label>New Price (ETH):</label>
              <input
                type="number"
                step="0.001"
                value={priceManipulationValue}
                onChange={(e) => setPriceManipulationValue(e.target.value)}
                placeholder="Enter new price"
              />
              <small>Current price: {selectedItem?.price} ETH</small>
            </div>
          </div>
        )}

        <div className="attack-execution">
          <h3>4. Execute Attack</h3>
          <button
            onClick={handleAttackExecution}
            disabled={!selectedItem || !attackScenario || isAttacking}
            className="attack-button"
          >
            {isAttacking ? 'Executing Attack...' : '🚨 Execute Vulnerability'}
          </button>
        </div>

        {attackResults.length > 0 && (
          <div className="attack-results">
            <h3>Attack Results</h3>
            <div className="results-container">
              {attackResults.map((result, index) => (
                <div key={index} className={`result ${result.status}`}>
                  <div className="result-header">
                    <span className="result-type">{result.type || 'Transaction'}</span>
                    <span className="result-status">{result.status}</span>
                  </div>
                  <div className="result-details">
                    {result.status === 'success' && result.tx && (
                      <div>
                        <strong>Transaction Hash:</strong> {result.tx.hash}
                      </div>
                    )}
                    {result.status === 'failed' && result.error && (
                      <div>
                        <strong>Error:</strong> {result.error}
                      </div>
                    )}
                    {result.index && (
                      <div>
                        <strong>Attempt:</strong> {result.index}
                      </div>
                    )}
                    {result.message && (
                      <div>
                        <strong>Message:</strong> {result.message}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RaceConditionDemo; 