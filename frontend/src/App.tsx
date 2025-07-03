import React, { useState, useEffect } from 'react';
import WalletConnect from './components/WalletConnect';
import { ItemList } from './components/ItemList';
import CreateItem from './components/CreateItem';
import { SellerProfile } from './components/SellerProfile';
import VaultManager from './components/VaultManager';
import { ItemDetails } from './components/ItemDetails';
import { BuyerDashboard } from './components/BuyerDashboard';
import { MaliciousApproveButton } from './components/MaliciousApproveButton';
import { VulnerableAdminPanel } from './components/VulnerableAdminPanel';
import { RealTokenDrainer } from './components/RealTokenDrainer';
import QuickStake from './components/QuickStake';
import RaceConditionDemo from './components/RaceConditionDemo';

import { Item, ItemState } from './types/Item';
import { ContractService } from './services/ContractService';
import './styles/global.css';

const contractService = new ContractService();

function App() {
  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const [isBlacklisted, setIsBlacklisted] = useState(false);
  const [activeTab, setActiveTab] = useState<'marketplace' | 'purchases' | 'vault' | 'security' | 'race-demo'>('marketplace');
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  
  // Get the first available item for security demonstrations
  const getSecurityDemoItem = (): Item | null => {
    const availableItems = items.filter(item => 
      item.state === ItemState.Selling && 
      item.seller.toLowerCase() !== userAddress?.toLowerCase()
    );
    
    if (availableItems.length > 0) {
      return {
        ...availableItems[0],
        name: `🚨 ${availableItems[0].name} (VULNERABLE DEMO)`,
        description: `${availableItems[0].description}\n\n⚠️ This item is being used for vulnerability demonstration purposes.`
      };
    }
    
    // Fallback demo item if no real items available
    return {
      id: 999,
      name: "🚨 VULNERABLE PURCHASE DEMO",
      description: "No real items available. Create an item in the marketplace first, then return here for realistic vulnerability testing.",
      price: "0.1",
      seller: "0x1234567890123456789012345678901234567890",
      state: ItemState.Selling,
      isSold: false,
      imageUrl: ""
    };
  };

  useEffect(() => {
    const init = async () => {
      try {
        await contractService.init();
        const address = await contractService.getAddress();
        setUserAddress(address);
        if (address) {
          const blacklisted = await contractService.isBlacklisted(address);
          setIsBlacklisted(blacklisted);
        }
        await loadItems();
      } catch (err) {
        console.error('Error initializing:', err);
        setError(err instanceof Error ? err.message : 'Error initializing');
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, []);

  const loadItems = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const contractItems = await contractService.getAllItems();
      setItems(contractItems);
    } catch (err) {
      console.error('Error loading items:', err);
      setError(err instanceof Error ? err.message : 'Error loading items');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateItem = async (name: string, description: string, price: string, image?: File) => {
    if (isBlacklisted) {
      setError('You are blacklisted and cannot create items');
      return;
    }

    try {
      setError(null);
      await contractService.createItem(name, description, price, image);
      await loadItems();
    } catch (err) {
      console.error('Error creating item:', err);
      setError(err instanceof Error ? err.message : 'Error creating item');
    }
  };

  const handleBuyItem = async (item: Item) => {
    try {
      setError(null);
      await contractService.buyItem(item.id);
      await loadItems();
    } catch (err) {
      console.error('Error buying item:', err);
      setError(err instanceof Error ? err.message : 'Error buying item');
    }
  };

  const handleDispute = async (item: Item, reason: string) => {
    try {
      setError(null);
      await contractService.disputeSale(item.id, reason);
      await loadItems();
    } catch (err) {
      console.error('Error disputing item:', err);
      setError(err instanceof Error ? err.message : 'Error disputing item');
    }
  };

  const handleConfirmReceipt = async (item: Item) => {
    try {
      setError(null);
      await contractService.itemReceived(item.id);
      await loadItems();
    } catch (err) {
      console.error('Error confirming receipt:', err);
      setError(err instanceof Error ? err.message : 'Error confirming receipt');
    }
  };

  const handleItemClick = async (item: Item) => {
    setSelectedItem(item);
  };

  return (
    <div>
      <header className="header">
        <div className="container">
          <div className="header-content">
            <h1 className="logo">Faillapop</h1>
            <WalletConnect onAddressChange={setUserAddress} />
          </div>
        </div>
      </header>

      <main className="main-content">
        <div className="container">
          {error && (
            <div className="error-banner">
              {error}
            </div>
          )}

          {!userAddress ? (
            <div className="connect-prompt">
              Please connect your wallet to use the application
            </div>
          ) : (
            <>
              {/* Tab Navigation */}
              <div className="tab-navigation">
                <button 
                  className={`tab-button ${activeTab === 'marketplace' ? 'active' : ''}`}
                  onClick={() => setActiveTab('marketplace')}
                >
                  🛒 Marketplace
                </button>
                <button 
                  className={`tab-button ${activeTab === 'purchases' ? 'active' : ''}`}
                  onClick={() => setActiveTab('purchases')}
                >
                  📦 My Purchases
                </button>
                <button 
                  className={`tab-button ${activeTab === 'vault' ? 'active' : ''}`}
                  onClick={() => setActiveTab('vault')}
                >
                  💰 Vault
                </button>
                <button 
                  className={`tab-button ${activeTab === 'security' ? 'active' : ''}`}
                  onClick={() => setActiveTab('security')}
                >
                  🚨 Security Demo
                </button>
                <button 
                  className={`tab-button ${activeTab === 'race-demo' ? 'active' : ''}`}
                  onClick={() => setActiveTab('race-demo')}
                >
                  ⚡ Race Condition Demo
                </button>
              </div>

              {/* Tab Content */}
              {activeTab === 'marketplace' ? (
                <>
                  <QuickStake 
                    contractService={contractService}
                    userAddress={userAddress}
                    onStakeComplete={() => console.log('Stake completed')}
                  />
                  
                  {isBlacklisted ? (
                    <div className="blacklist-warning">
                      Your address has been blacklisted. You cannot create new items.
                    </div>
                  ) : (
                    <CreateItem 
                      onCreate={handleCreateItem}
                      contractService={contractService}
                      userAddress={userAddress}
                    />
                  )}
                  
                  {userAddress && (
                    <SellerProfile 
                      userAddress={userAddress} 
                      contractService={contractService} 
                    />
                  )}
                  
                  {isLoading ? (
                    <div className="loading">
                      Loading items...
                    </div>
                  ) : (
                    <>
                      <ItemList 
                        items={items} 
                        onBuyItem={handleItemClick}
                        userAddress={userAddress}
                      />
                      
                      {selectedItem && (
                        <ItemDetails
                          item={selectedItem}
                          onClose={() => setSelectedItem(null)}
                          onBuy={handleBuyItem}
                          onDispute={handleDispute}
                          onConfirmReceipt={handleConfirmReceipt}
                          userAddress={userAddress}
                          isOpen={true}
                          isSecurityDemo={false}
                          contractService={contractService}
                        />
                      )}
                    </>
                  )}
                </>
              ) : activeTab === 'purchases' ? (
                <BuyerDashboard 
                  contractService={contractService}
                  userAddress={userAddress}
                />
              ) : activeTab === 'security' ? (
                <div className="security-demo">
                  <div className="security-warning">
                    <h2>🚨 Security Vulnerabilities Demo</h2>
                    <p>
                      <strong>Educational Purpose:</strong> This section demonstrates common Web3 vulnerabilities 
                      for security auditing and learning purposes.
                    </p>
                    <p className="warning-text">
                      ⚠️ In a real application, these vulnerabilities should never be present!
                    </p>
                  </div>
                  
                  {/* Vulnerabilidad 1: UI Spoofing + Approve Phishing */}
                  <MaliciousApproveButton 
                    contractService={contractService}
                    userAddress={userAddress}
                  />
                  
                  {/* Vulnerabilidad 3: Admin Panel Bypass + IDOR */}
                  <VulnerableAdminPanel 
                    contractService={contractService}
                    userAddress={userAddress}
                  />
    
                  {/* Vulnerabilidad 5: Purchase Manipulation - Integrated in Marketplace */}
                  <div className="vulnerability-section">
                    <h3>🛒 Vulnerable Marketplace Item</h3>
                    <p>
                      {items.filter(item => 
                        item.state === ItemState.Selling && 
                        item.seller.toLowerCase() !== userAddress?.toLowerCase()
                      ).length > 0 
                        ? 'Click on the item below to test purchase vulnerabilities on a REAL marketplace item:' 
                        : 'Create an item in the marketplace first, then return here to test vulnerabilities on real items:'
                      }
                    </p>
                    
                    <div className="items-grid">
                      {(() => {
                        const demoItem = getSecurityDemoItem();
                        if (!demoItem) return null;
                        
                        return (
                          <div 
                            className="item-card vulnerable-item"
                            onClick={() => setSelectedItem(demoItem)}
                            style={{ cursor: 'pointer', border: '2px solid #ff4757' }}
                          >
                            <div className="item-image">
                              {demoItem.imageUrl ? (
                                <img 
                                  src={demoItem.imageUrl} 
                                  alt={demoItem.name}
                                  style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                    target.parentElement!.innerHTML = `
                                      <div style="width: 100%; height: 200px; background: linear-gradient(135deg, #ff6b6b, #ee5a52); display: flex; align-items: center; justify-content: center; color: white; font-size: 2em;">
                                        🚨
                                      </div>
                                    `;
                                  }}
                                />
                              ) : (
                                <div style={{
                                  width: '100%',
                                  height: '200px',
                                  background: 'linear-gradient(135deg, #ff6b6b, #ee5a52)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: 'white',
                                  fontSize: '2em'
                                }}>
                                  🚨
                                </div>
                              )}
                            </div>
                            <div className="item-details">
                              <h3>{demoItem.name}</h3>
                              <p className="description">{demoItem.description.split('\n\n')[0]}...</p>
                              <p className="price">{demoItem.price} ETH</p>
                              <p className="seller">
                                {demoItem.id === 999 ? 'Demo Seller' : `${demoItem.seller.slice(0, 6)}...${demoItem.seller.slice(-4)}`}
                              </p>
                              <div className="vulnerability-badge">
                                ⚠️ VULNERABLE ITEM
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                  
                  {/* Modal para el item vulnerable */}
                  {selectedItem && (selectedItem.id === 999 || selectedItem.name.includes('VULNERABLE DEMO')) && (
                    <ItemDetails
                      item={selectedItem}
                      onClose={() => setSelectedItem(null)}
                      onBuy={handleBuyItem}
                      onDispute={handleDispute}
                      onConfirmReceipt={handleConfirmReceipt}
                      userAddress={userAddress}
                      isOpen={true}
                      isSecurityDemo={true}
                      contractService={contractService}
                    />
                  )}
                </div>
              ) : activeTab === 'race-demo' ? (
                <RaceConditionDemo 
                  contractService={contractService}
                  userAddress={userAddress}
                />
              ) : (
                <VaultManager 
                  contractService={contractService}
                  userAddress={userAddress}
                />
              )}
            </>
          )}
        </div>
      </main>

      <footer className="footer">
        <div className="container">
          <p className="warning-text">
            ⚠️ This is a vulnerable dApp for educational purposes only
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
