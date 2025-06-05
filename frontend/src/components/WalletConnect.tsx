import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';

declare global {
  interface Window {
    ethereum?: ethers.providers.ExternalProvider & {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, handler: (...args: any[]) => void) => void;
      removeListener: (event: string, handler: (...args: any[]) => void) => void;
    };
  }
}

interface WalletConnectProps {
  onAddressChange: (address: string | null) => void;
}

const WalletConnect: React.FC<WalletConnectProps> = ({ onAddressChange }) => {
  const [address, setAddress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    checkIfWalletIsConnected();
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', () => window.location.reload());
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', () => window.location.reload());
      }
    };
  }, []);

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      setAddress(null);
      onAddressChange(null);
    } else {
      setAddress(accounts[0]);
      onAddressChange(accounts[0]);
    }
  };

  const checkIfWalletIsConnected = async () => {
    try {
      if (!window.ethereum) {
        setError('Please install MetaMask to use this application');
        return;
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const accounts = await provider.listAccounts();
      
      if (accounts.length > 0) {
        setAddress(accounts[0]);
        onAddressChange(accounts[0]);
      }
    } catch (err) {
      console.error('Error checking wallet connection:', err);
      setError('Error connecting to wallet');
    }
  };

  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        setError('Please install MetaMask to use this application');
        return;
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const signer = provider.getSigner();
      const address = await signer.getAddress();
      
      setAddress(address);
      onAddressChange(address);
      setError(null);
    } catch (err) {
      console.error('Error connecting wallet:', err);
      setError('Error connecting wallet');
    }
  };

  const disconnectWallet = () => {
    setAddress(null);
    onAddressChange(null);
    setIsDropdownOpen(false);
  };

  const switchAccount = async () => {
    try {
      if (!window.ethereum) {
        setError('Please install MetaMask to use this application');
        return;
      }

      await window.ethereum.request({
        method: 'wallet_requestPermissions',
        params: [{ eth_accounts: {} }],
      });

      setIsDropdownOpen(false);
    } catch (err) {
      console.error('Error switching account:', err);
      setError('Error switching account');
    }
  };

  return (
    <div className="wallet-connect">
      {error && <div className="error">{error}</div>}
      
      {!address ? (
        <button onClick={connectWallet} className="connect-button">
          Connect Wallet
        </button>
      ) : (
        <div className="wallet-info">
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="address-button"
          >
            {`${address.slice(0, 6)}...${address.slice(-4)}`}
          </button>
          
          {isDropdownOpen && (
            <div className="dropdown-menu">
              <button onClick={switchAccount}>Switch Account</button>
              <button onClick={disconnectWallet}>Disconnect</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WalletConnect; 