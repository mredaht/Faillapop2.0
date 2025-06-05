import React, { useState, useEffect } from 'react';
import WalletConnect from './components/WalletConnect';
import { ItemList } from './components/ItemList';
import CreateItem from './components/CreateItem';
import { Item } from './types/Item';
import { ContractService } from './services/ContractService';
import './styles/global.css';

const contractService = new ContractService();

function App() {
  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const [isBlacklisted, setIsBlacklisted] = useState(false);

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

  const handleCreateItem = async (name: string, description: string, price: string) => {
    if (isBlacklisted) {
      setError('You are blacklisted and cannot create items');
      return;
    }

    try {
      setError(null);
      await contractService.createItem(name, description, price);
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
              {isBlacklisted ? (
                <div className="blacklist-warning">
                  Your address has been blacklisted. You cannot create new items.
                </div>
              ) : (
                <CreateItem onCreate={handleCreateItem} />
              )}
              
              {isLoading ? (
                <div className="loading">
                  Loading items...
                </div>
              ) : (
                <ItemList 
                  items={items} 
                  onBuyItem={handleBuyItem}
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
