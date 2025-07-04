import React, { useState, useEffect, useCallback } from 'react';
import { ContractService } from '../services/ContractService';
import { ethers } from 'ethers';
import { ItemState } from '../types/Item';
import './RaceConditionDemo.css';
import { Item } from '../types/Item';

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
  const [isLoading, setIsLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [availableItems, setAvailableItems] = useState<Item[]>([]);
  const [attackScenario, setAttackScenario] = useState<AttackScenario | null>(null);
  const [priceManipulationValue, setPriceManipulationValue] = useState<string>('');
  const [isAttacking, setIsAttacking] = useState(false);
  const [attackResults, setAttackResults] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const scenarios: AttackScenario[] = [
    { id: 'race_multiple_buyers', name: 'Race Condition Attack', description: 'Multiple buyers attempt to purchase the same item simultaneously', type: 'race', enabled: true },
    { id: 'price_manipulation', name: 'Price Manipulation', description: 'Change item price during active transactions', type: 'price', enabled: true },
  ];

  const loadAvailableItems = useCallback(async () => {
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
      // 2. Items from the user themselves (as sellers manipulating their own prices)
      // 3. Items in "Selling" state that can be purchased
      
      const filteredItems = allItems.filter(item => {
        const isSellingState = item.state === ItemState.Selling;
        console.log(`Item ${item.id}: state=${item.state}, selling=${isSellingState}`);
        return isSellingState;
      });
      
      console.log('Filtered items available for attack:', filteredItems.length);
      console.log('Items data:', filteredItems);
      
      setAvailableItems(filteredItems);
      
      if (filteredItems.length === 0) {
        console.log('No items available for attack demos');
        setError('No items available for demonstration. Create some items in the marketplace first!');
      } else {
        setError(null);
      }
    } catch (error) {
      console.error('Error loading items:', error);
      setError('Failed to load items');
    } finally {
      setIsLoading(false);
    }
  }, [contractService, userAddress]);

  useEffect(() => {
    if (contractService) {
      loadAvailableItems();
    }
  }, [contractService, userAddress, loadAvailableItems]);

  const executeRaceConditionAttack = async (itemId: number) => {
    console.log('🚨 EXECUTING RACE CONDITION ATTACK');
    console.log(`Target Item ID: ${itemId}`);
    
    const results: any[] = [];
    const startTime = Date.now();
    
    // Add initial explanation
    results.push({
      type: 'explanation',
      status: 'info',
      message: '🏁 Starting race condition attack: 5 buyers will attempt to purchase the same item simultaneously. Only one should succeed!'
    });

    // Check initial item state
    try {
      const initialItem = await contractService.getItemDetails(itemId);
      if (initialItem) {
        results.push({
          type: 'initial_state',
          status: 'info',
          message: `📊 Initial item state: ${initialItem.state === 1 ? 'Selling' : 'Other'} | Price: ${initialItem.price} ETH`
        });
      }
    } catch (error) {
      console.log('Could not fetch initial state:', error);
    }

    // Create promises with timing information
    const promises: Promise<any>[] = [];
    
    for (let i = 0; i < 5; i++) {
      const attemptStartTime = Date.now();
      promises.push(
        contractService.buyItem(itemId)
          .then((tx: any) => {
            const duration = Date.now() - attemptStartTime;
            console.log(`✅ Purchase attempt ${i + 1} successful in ${duration}ms:`, tx);
            return { 
              attempt: i + 1, 
              status: 'success', 
              tx,
              timing: {
                started: attemptStartTime - startTime,
                duration: duration
              },
              message: `Transaction ${i + 1} won the race! 🏆`
            };
          })
          .catch((error: any) => {
            const duration = Date.now() - attemptStartTime;
            console.log(`❌ Purchase attempt ${i + 1} failed in ${duration}ms:`, error.message);
            
            // Analyze the error to provide better feedback
            let analysisMessage = '';
            if (error.message.includes('cannot be bought')) {
              analysisMessage = `Lost the race - item already purchased by another buyer 🏃‍♂️`;
            } else if (error.message.includes('Incorrect amount')) {
              analysisMessage = `Price validation failed - someone may have changed the price 💰`;
            } else if (error.message.includes('revert')) {
              analysisMessage = `Transaction reverted - likely due to state change 🔄`;
            } else {
              analysisMessage = `Network or gas error ⛽`;
            }
            
            return { 
              attempt: i + 1, 
              status: 'failed', 
              error: error.message,
              timing: {
                started: attemptStartTime - startTime,
                duration: duration
              },
              message: analysisMessage
            };
          })
      );
    }

    console.log('🚀 All 5 purchase attempts launched simultaneously...');
    
    try {
      // Wait for all promises to settle
      const allResults = await Promise.allSettled(promises);
      const totalTime = Date.now() - startTime;
      
      // Process results with analysis
      let successCount = 0;
      let failureCount = 0;
      
      allResults.forEach((result, index) => {
        const resultData = result.status === 'fulfilled' ? result.value : result.reason;
        results.push(resultData);
        
        if (resultData.status === 'success') {
          successCount++;
        } else {
          failureCount++;
        }
      });
      
      // Add summary analysis
      results.push({
        type: 'race_analysis',
        status: successCount > 1 ? 'vulnerability' : (successCount === 1 ? 'success' : 'info'),
        message: `🎯 Race Results: ${successCount} succeeded, ${failureCount} failed in ${totalTime}ms total`
      });
      
      if (successCount > 1) {
        results.push({
          type: 'explanation',
          status: 'vulnerability',
          message: `🚨 VULNERABILITY DEMONSTRATED: ${successCount} transactions succeeded! This vulnerable contract allows multiple buyers to purchase the same item. The last successful transaction overwrites previous buyers, but all paid!`
        });
      } else if (successCount === 1) {
        results.push({
          type: 'explanation',
          status: 'success',
          message: '✅ Only one transaction succeeded this time. However, the contract is still vulnerable - multiple successes are possible due to the weak state checks and race condition windows.'
        });
      } else {
        results.push({
          type: 'explanation',
          status: 'info',
          message: '❓ All transactions failed - this might indicate network issues, insufficient funds, or the item was already sold by another transaction.'
        });
      }
      
      // Add vulnerability explanation
      results.push({
        type: 'education',
        status: 'vulnerability',
        message: '📚 VULNERABILITY ANALYSIS: This contract allows multiple buyers to pass the state checks (State.Selling OR State.Pending) and purchase the same item. The vulnerability window is extended by the processing delay, and the final buyer overwrites previous ones.'
      });
      
    } catch (error: any) {
      console.error('Race condition attack failed:', error);
      results.push({ 
        type: 'error', 
        status: 'failed', 
        error: error.message,
        message: 'Attack execution failed unexpectedly'
      });
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
          <strong>📋 How to test Race Conditions:</strong>
          <br />
          <br />• <strong>Race Condition Attack:</strong> Launches 5 simultaneous purchase attempts on the same item
          <br />• <strong>Expected Result:</strong> Only 1 should succeed (the "winner"), others should fail
          <br />• <strong>Vulnerability:</strong> The timing window where multiple transactions can pass initial checks
          <br />• <strong>Price Manipulation:</strong> Change price during active transactions (owners only)
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
          ) : error ? (
            <div className="error-message" style={{ color: '#e74c3c', padding: '1rem', background: 'rgba(231, 76, 60, 0.1)', borderRadius: '4px' }}>
              {error}
            </div>
          ) : availableItems.length === 0 ? (
            <div className="no-items">
              <p>No items available for attack.</p>
             
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

        {attackScenario && attackScenario.type === 'price' && (
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
          <div className="results-container">
            <h4>🔍 Attack Results</h4>
            {attackResults.map((result, index) => (
              <div key={index} className={`result ${result.status}`}>
                <div className="result-header">
                  <span className="result-type">
                    {result.type === 'explanation' ? '📚' : 
                     result.type === 'education' ? '🎓' : 
                     result.type === 'race_analysis' ? '📊' : 
                     result.type === 'initial_state' ? '🏁' : 
                     result.attempt ? `#${result.attempt}` : 
                     result.index ? `#${result.index}` : 
                     result.type}
                  </span>
                  <span className={`result-status ${result.status}`}>
                    {result.status.toUpperCase()}
                  </span>
                  {result.timing && (
                    <span className="result-timing">
                      {result.timing.duration}ms
                    </span>
                  )}
                </div>
                <div className="result-details">
                  {result.message && (
                    <div className="result-message">
                      <strong>Result:</strong> {result.message}
                    </div>
                  )}
                  {result.error && (
                    <div>
                      <strong>Error:</strong> {result.error}
                    </div>
                  )}
                  {result.tx && (
                    <div>
                      <strong>Transaction:</strong> {result.tx.hash?.slice(0, 10)}...
                    </div>
                  )}
                  {result.timing && (
                    <div className="timing-info">
                      <strong>Timing:</strong> Started at {result.timing.started}ms, took {result.timing.duration}ms
                    </div>
                  )}
                  {result.value && typeof result.value === 'object' && (
                    <div>
                      <strong>Details:</strong> {JSON.stringify(result.value, null, 2)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RaceConditionDemo; 