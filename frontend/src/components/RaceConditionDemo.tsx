import React, { useState, useEffect, useCallback } from 'react';
import { ContractService } from '../services/ContractService';
import { ethers } from 'ethers';
import { ItemState } from '../types/Item';
import './RaceConditionDemo.css';
import { Item } from '../types/Item';
import { useUser } from '../context/UserContext';

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
  const { startPriceManipulation, endPriceManipulation, forceMarketplaceRefresh } = useUser();
  
  const [isLoading, setIsLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [availableItems, setAvailableItems] = useState<Item[]>([]);
  const [attackScenario, setAttackScenario] = useState<AttackScenario | null>(null);
  const [priceManipulationValue, setPriceManipulationValue] = useState<string>('');
  const [isAttacking, setIsAttacking] = useState(false);
  const [attackResults, setAttackResults] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Estado para manipulación de precios
  const [originalPrice, setOriginalPrice] = useState<string>('');
  const [currentPrice, setCurrentPrice] = useState<string>('');
  const [showRealPrice, setShowRealPrice] = useState<boolean>(false);
  const [priceManipulated, setPriceManipulated] = useState<boolean>(false);

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

  // Reset price manipulation state when item or scenario changes
  const resetPriceState = () => {
    setOriginalPrice('');
    setCurrentPrice('');
    setShowRealPrice(false);
    setPriceManipulated(false);
    setPriceManipulationValue('');
    endPriceManipulation(); // Desactivar manipulación global
    forceMarketplaceRefresh(); // Force marketplace to re-render with real prices
  };

  // Reset when item selection changes
  useEffect(() => {
    if (selectedItem) {
      resetPriceState();
    }
  }, [selectedItem]);

  // Reset when scenario changes
  useEffect(() => {
    resetPriceState();
  }, [attackScenario]);

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
    console.log('🚨 EXECUTING ENHANCED PRICE MANIPULATION ATTACK');
    console.log(`Target Item ID: ${itemId}`);
    console.log(`New Price: ${newPrice} ETH`);
    
    const results = [];
    
    try {
      // First, check if user owns the item
      const item = availableItems.find(item => item.id === itemId);
      if (!item) throw new Error('Item not found');

      const isOwner = item.seller.toLowerCase() === userAddress.toLowerCase();
      
      // Store price information for UI spoofing demo
      setOriginalPrice(item.price);
      setCurrentPrice(item.price);
      setShowRealPrice(false);
      setPriceManipulated(false);
      
      console.log(`Original price: ${item.price} ETH`);
      console.log(`Manipulated price: ${newPrice} ETH`);
      console.log(`User is owner: ${isOwner}`);

      results.push({
        type: 'price_info',
        status: 'info',
        message: `💰 Original Price: ${item.price} ETH | Target Price: ${newPrice} ETH | Difference: ${(parseFloat(newPrice) - parseFloat(item.price)).toFixed(3)} ETH`
      });

      if (isOwner) {
        // ENHANCED Scenario 1: Malicious Seller with UI Spoofing
        results.push({
          type: 'explanation',
          status: 'info',
          message: '🎭 SCENARIO: Malicious Seller + UI Spoofing Attack'
        });
        
        results.push({
          type: 'explanation',
          status: 'info',
          message: '📋 Attack Steps: 1) Buyer sees original price in UI & Marketplace, 2) Seller manipulates contract price, 3) Buyer pays manipulated price'
        });

        // Step 1: Simulate buyer seeing original price everywhere & activate global price manipulation
        console.log('🎭 DEBUG: Starting price manipulation for item', itemId, 'with original price', item.price);
        startPriceManipulation(itemId, item.price);
        forceMarketplaceRefresh(); // Force marketplace to re-render with cached prices
        
        results.push({
          type: 'ui_spoofing',
          status: 'info',
          message: `👁️ Buyer sees cached price: ${item.price} ETH (UI + Marketplace show old price)`
        });

        await new Promise(resolve => setTimeout(resolve, 1000));

        // Step 2: Seller manipulates price in contract ONLY
        try {
          console.log('💰 Seller manipulating price in contract (frontend keeps showing old price)...');
          const priceInWei = ethers.utils.parseEther(newPrice);
          const tx = await contractService.quickPriceChange(itemId, priceInWei);
          console.log('✅ Price change successful:', tx);
          
          // Update internal state but keep UI showing original price
          setCurrentPrice(newPrice);
          setPriceManipulated(true);
          
          results.push({ 
            type: 'price_change', 
            status: 'success', 
            tx, 
            message: `🔄 Contract price manipulated: ${item.price} ETH → ${newPrice} ETH (UI still shows ${item.price} ETH)`
          });
          
          results.push({
            type: 'ui_spoofing',
            status: 'vulnerability',
            message: `🎭 Critical: Marketplace still shows ${item.price} ETH while contract has ${newPrice} ETH`
          });
          
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          // Step 3: Simulate buyer attempting purchase at "displayed" price
          results.push({
            type: 'buyer_attempt',
            status: 'vulnerability',
            message: `💸 Buyer attempts to pay ${item.price} ETH but will actually pay ${newPrice} ETH!`
          });
          
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Step 4: Reveal the attack
          setShowRealPrice(true);
          
          results.push({
            type: 'attack_reveal',
            status: 'vulnerability',
            message: `😱 ATTACK SUCCESSFUL! Buyer saw ${item.price} ETH but paid ${newPrice} ETH`
          });
          
          const lossAmount = (parseFloat(newPrice) - parseFloat(item.price)).toFixed(3);
          const lossPercentage = ((parseFloat(lossAmount) / parseFloat(item.price)) * 100).toFixed(1);
          
          results.push({
            type: 'financial_impact',
            status: 'vulnerability',
            message: `💸 Financial Impact: ${lossAmount} ETH loss (${lossPercentage}% more expensive than displayed)`
          });
          
        } catch (error: any) {
          console.log('❌ Price change failed:', error.message);
          results.push({ 
            type: 'price_change', 
            status: 'failed', 
            error: error.message,
            message: 'Price manipulation failed - security working correctly'
          });
        }

        // Add educational information
        results.push({
          type: 'education',
          status: 'info',
          message: '🎓 How to protect: Always verify prices directly in smart contract before signing transactions'
        });

      } else {
        // ENHANCED Scenario 2: Buyer-side perspective with marketplace involvement
        results.push({
          type: 'explanation',
          status: 'info',
          message: '🛡️ SCENARIO: Buyer Protection Demo'
        });
        
        // Show original price (what buyer sees in marketplace)
        results.push({
          type: 'ui_spoofing',
          status: 'info',
          message: `👁️ You see price in Marketplace: ${item.price} ETH (potentially cached/outdated)`
        });

        // Simulate checking real price
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        results.push({
          type: 'price_verification',
          status: 'success',
          message: `🔍 Checking real price in contract... Found: ${item.price} ETH (matches marketplace)`
        });

        // Attempt to change price (should fail)
        try {
          const priceInWei = ethers.utils.parseEther(newPrice);
          const tx = await contractService.quickPriceChange(itemId, priceInWei);
          results.push({ 
            type: 'price_change', 
            status: 'unexpected_success', 
            tx, 
            message: '🚨 CRITICAL VULNERABILITY: Buyer can change prices!' 
          });
        } catch (error: any) {
          results.push({ 
            type: 'price_change', 
            status: 'failed', 
            error: error.message, 
            message: '✅ Security working: Only seller can change prices' 
          });
        }

        // Show safe purchase process
        results.push({
          type: 'education',
          status: 'success',
          message: '🛡️ Safe practice: Price verified before purchase, no manipulation possible'
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
          <strong>📋 Available Attack Demos:</strong>
          <br />
          <br />• <strong>Race Condition Attack:</strong> 5 simultaneous buyers compete for the same item
          <br />• <strong>Expected Result:</strong> Only 1 should succeed, others fail (timing vulnerability)
          <br />• <strong>Price Manipulation Attack:</strong> UI spoofing + real-time price changes
          <br />• <strong>Educational Focus:</strong> Shows how buyers can be deceived by fake/cached prices
          <br />• <strong>Protection Methods:</strong> Always verify prices in smart contract before signing
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

        {attackScenario && attackScenario.type === 'price' && selectedItem && (
          <div className="price-manipulation-config">
            <h3>3. Configure Price Manipulation</h3>
            
            {/* Price comparison display */}
            <div className="price-comparison">
              <div className="price-display-section">
                <div className="original-price">
                  <h4>💰 Original Price</h4>
                  <div className="price-value">{originalPrice || selectedItem.price} ETH</div>
                  <small>What buyer initially sees</small>
                </div>
                
                <div className="arrow">→</div>
                
                <div className="manipulated-price">
                  <h4>🎯 Target Price</h4>
                  <div className="price-value">
                    {priceManipulationValue || '?.???'} ETH
                  </div>
                  <small>What seller wants to charge</small>
                </div>
                
                {priceManipulationValue && (
                  <div className="price-impact">
                    <h4>📊 Impact</h4>
                    <div className="impact-value">
                      {(parseFloat(priceManipulationValue) - parseFloat(selectedItem.price)).toFixed(3)} ETH
                    </div>
                    <small>
                      {parseFloat(priceManipulationValue) > parseFloat(selectedItem.price) ? 
                        `+${(((parseFloat(priceManipulationValue) - parseFloat(selectedItem.price)) / parseFloat(selectedItem.price)) * 100).toFixed(1)}% more` :
                        `${(((parseFloat(priceManipulationValue) - parseFloat(selectedItem.price)) / parseFloat(selectedItem.price)) * 100).toFixed(1)}% less`
                      }
                    </small>
                  </div>
                )}
              </div>
              
              {/* Current contract state */}
              {priceManipulated && (
                <div className="current-state">
                  <h4>🔄 Current Contract State</h4>
                  <div className="state-info">
                    <span className="label">Price in contract:</span>
                    <span className={`value ${showRealPrice ? 'revealed' : 'hidden'}`}>
                      {showRealPrice ? `${currentPrice} ETH` : '???'}
                    </span>
                    {!showRealPrice && (
                      <button 
                        onClick={() => setShowRealPrice(true)}
                        className="reveal-button"
                      >
                        🔍 Check Real Price
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <div className="form-group">
              <label>New Price (ETH):</label>
              <input
                type="number"
                step="0.001"
                value={priceManipulationValue}
                onChange={(e) => setPriceManipulationValue(e.target.value)}
                placeholder="Enter new price"
              />
              <small>
                Current: {selectedItem.price} ETH | 
                {priceManipulationValue ? ` Target: ${priceManipulationValue} ETH` : ' Enter target price'}
              </small>
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
          
          {/* Status de manipulación de precios */}
          <div className={`manipulation-status ${priceManipulated ? 'active' : ''}`}>
            {priceManipulated ? (
              <>
                <strong>Price manipulation attack in progress!</strong>
                <br />
                The marketplace is showing cached prices while the contract has been manipulated.
                <br />
                <button 
                  onClick={() => {
                    resetPriceState();
                    setAttackResults([]);
                  }}
                  className="end-manipulation-button"
                >
                  🔄 End Attack & Reset Demo
                </button>
              </>
            ) : (
              <span>No active price manipulation attack</span>
            )}
          </div>
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