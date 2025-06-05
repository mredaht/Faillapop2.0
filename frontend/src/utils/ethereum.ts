import { ethers } from 'ethers';
import { MetaMaskInpageProvider } from '@metamask/providers';

declare global {
  interface Window {
    ethereum?: MetaMaskInpageProvider;
  }
}

export const connectWallet = async () => {
  if (typeof window.ethereum === 'undefined') {
    throw new Error('MetaMask is not installed!');
  }

  try {
    // Request account access
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    
    // Create Web3 instance
    const provider = new ethers.providers.Web3Provider(window.ethereum as any);
    const signer = provider.getSigner();
    const address = await signer.getAddress();
    
    return {
      provider,
      signer,
      address
    };
  } catch (error) {
    console.error('Error connecting to MetaMask', error);
    throw error;
  }
};

export const checkIfWalletIsConnected = async () => {
  try {
    if (!window.ethereum) {
      return false;
    }

    const accounts = await window.ethereum.request({ method: 'eth_accounts' }) as string[];
    return accounts && accounts.length > 0;
  } catch (error) {
    console.error('Error checking wallet connection:', error);
    return false;
  }
};

export const getNetworkChainId = async () => {
  if (!window.ethereum) {
    throw new Error('MetaMask is not installed!');
  }

  const chainId = await window.ethereum.request({ method: 'eth_chainId' });
  return chainId;
}; 