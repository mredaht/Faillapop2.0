import { ethers } from 'ethers';
import {
  FAILLAPOP_SHOP_ADDRESS,
  FAILLAPOP_SHOP_ABI,
  FAILLAPOP_TOKEN_ADDRESS,
  FAILLAPOP_TOKEN_ABI,
  FAILLAPOP_VAULT_ADDRESS,
  FAILLAPOP_VAULT_ABI
} from '../contracts/config';

type ExtendedProvider = ethers.providers.ExternalProvider & {
  request: (args: { method: string; params?: any[] }) => Promise<any>;
  on: (event: string, handler: (...args: any[]) => void) => void;
  removeListener: (event: string, handler: (...args: any[]) => void) => void;
};

declare global {
  interface Window {
    ethereum?: ExtendedProvider;
  }
}

export class ContractService {
  private provider: ethers.providers.Web3Provider | null = null;
  private signer: ethers.Signer | null = null;
  private shopContract: ethers.Contract | null = null;
  private tokenContract: ethers.Contract | null = null;
  private vaultContract: ethers.Contract | null = null;

  async init() {
    if (typeof window.ethereum === 'undefined') {
      throw new Error('Please install MetaMask to use this application');
    }

    this.provider = new ethers.providers.Web3Provider(window.ethereum);
    await this.requestAccount();
    this.signer = this.provider.getSigner();
    
    this.shopContract = new ethers.Contract(
      FAILLAPOP_SHOP_ADDRESS,
      FAILLAPOP_SHOP_ABI,
      this.signer
    );

    this.tokenContract = new ethers.Contract(
      FAILLAPOP_TOKEN_ADDRESS,
      FAILLAPOP_TOKEN_ABI,
      this.signer
    );

    this.vaultContract = new ethers.Contract(
      FAILLAPOP_VAULT_ADDRESS,
      FAILLAPOP_VAULT_ABI,
      this.signer
    );
  }

  async requestAccount() {
    if (!window.ethereum) throw new Error('Please install MetaMask to use this application');
    await window.ethereum.request({ method: 'eth_requestAccounts' });
  }

  async getAddress() {
    if (!this.signer) throw new Error('Signer not initialized');
    return await this.signer.getAddress();
  }

  async stakeEth(amount: string) {
    if (!this.vaultContract) throw new Error('Vault contract not initialized');
    const amountInWei = ethers.utils.parseEther(amount);
    const tx = await this.vaultContract.doStake({ value: amountInWei });
    await tx.wait();
  }

  async getStakedBalance(address: string) {
    if (!this.vaultContract) throw new Error('Vault contract not initialized');
    return await this.vaultContract.userBalance(address);
  }

  async createItem(name: string, description: string, price: string) {
    if (!this.shopContract) throw new Error('Shop contract not initialized');
    
    try {
      console.log('Creating item with:', { name, description, price });
      
      const priceInWei = ethers.utils.parseEther(price);
      console.log('Price in wei:', priceInWei.toString());
      
      // Verify contract connection first
      console.log('Testing contract connection...');
      try {
        const currentIndex = await this.shopContract.offerIndex();
        console.log('Current item count:', currentIndex.toString());
      } catch (connectionError) {
        console.error('Contract connection failed:', connectionError);
        throw new Error('Cannot connect to shop contract. Check network connection.');
      }
      
      // Create the item with timeout
      console.log('Calling newSale...');
      
      // Add a timeout wrapper
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Transaction timeout after 30 seconds')), 30000);
      });
      
      const transactionPromise = this.shopContract.newSale(name, description, priceInWei);
      
      const tx = await Promise.race([transactionPromise, timeoutPromise]);
      console.log('Transaction sent:', tx.hash);
      
      const receiptPromise = tx.wait();
      const receiptTimeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Transaction confirmation timeout after 60 seconds')), 60000);
      });
      
      const receipt = await Promise.race([receiptPromise, receiptTimeoutPromise]);
      console.log('Transaction confirmed:', receipt.transactionHash);
      
      return receipt;
    } catch (error: any) {
      console.error('Error in createItem:', error);
      if (error.code === 'ACTION_REJECTED') {
        throw new Error('Transaction was rejected by user');
      } else if (error.message && error.message.includes('timeout')) {
        throw new Error('Transaction timed out. Please try again.');
      } else if (error.message && error.message.includes('reverted')) {
        throw new Error('Transaction failed: ' + (error.reason || error.message));
      }
      throw error;
    }
  }

  async buyItem(itemId: number) {
    if (!this.shopContract) throw new Error('Contract not initialized');
    const sale = await this.shopContract.offeredItems(itemId);
    const tx = await this.shopContract.doBuy(itemId, { value: sale.price });
    await tx.wait();
  }

  async getAllItems() {
    if (!this.shopContract) throw new Error('Contract not initialized');
    
    try {
      const itemCount = await this.shopContract.offerIndex();
      const items = [] as any[];

      for (let i = 0; i < itemCount; i++) {
        try {
          const sale = await this.shopContract.offeredItems(i);
          console.log('Sale data:', sale); // Debug log
          
          items.push({
            id: i,
            name: sale.title || sale[2] || 'Unknown Item', // title is at index 2
            description: sale.description || sale[3] || 'No description', // description at index 3
            price: ethers.utils.formatEther(sale.price || sale[4] || '0'), // price at index 4
            seller: sale.seller || sale[0] || '0x0', // seller at index 0
            isSold: false // Simplify for now, will improve later
          });
        } catch (itemError) {
          console.error(`Error loading item ${i}:`, itemError);
          // Skip this item and continue
        }
      }

      return items;
    } catch (error) {
      console.error('Error in getAllItems:', error);
      throw new Error(`Failed to load items: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async isBlacklisted(address: string): Promise<boolean> {
    return false;
  }
} 