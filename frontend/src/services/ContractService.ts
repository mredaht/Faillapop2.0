import { ethers } from 'ethers';
import { create } from 'ipfs-http-client';
import { FAILLAPOP_SHOP_ADDRESS, FAILLAPOP_SHOP_ABI, FAILLAPOP_TOKEN_ADDRESS, FAILLAPOP_TOKEN_ABI, FAILLAPOP_VAULT_ADDRESS, FAILLAPOP_VAULT_ABI, FAILLAPOP_PROXY_ADDRESS } from '../contracts/config';
import { Item, ItemState, Dispute, Sale } from '../types/Item';
import { EthereumProvider } from '../types/ethereum';

declare global {
  interface Window {
    ethereum?: EthereumProvider & {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, handler: (...args: any[]) => void) => void;
      removeListener: (event: string, handler: (...args: any[]) => void) => void;
    };
  }
}

export class ContractService {
  private contract: ethers.Contract | null = null;
  private vaultContract: ethers.Contract | null = null;
  private provider: ethers.providers.Provider | null = null;
  private ipfs: any;

  constructor() {
    // Inicializar IPFS
    this.ipfs = create({
      host: 'localhost',
      port: 5001,
      protocol: 'http',
    });
  }

  async init() {
    try {
      if (typeof window.ethereum !== 'undefined') {
        console.log('Initializing with Ethereum provider');
        this.provider = new ethers.providers.Web3Provider(window.ethereum as EthereumProvider);

        const network = await this.provider.getNetwork();
        console.log('Current network:', network);
        if (network.chainId !== 31337) {
          try {
            await window.ethereum?.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: '0x7A69' }], // 31337 en hexadecimal
            });
          } catch (switchError: any) {
            if (switchError.code === 4902) {
              await window.ethereum?.request({
                method: 'wallet_addEthereumChain',
                params: [{
                  chainId: '0x7A69',
                  chainName: 'Localhost 8545',
                  nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
                  rpcUrls: ['http://localhost:8545'],
                }],
              });
            } else {
              throw switchError;
            }
          }
        }
        
        this.contract = new ethers.Contract(FAILLAPOP_PROXY_ADDRESS, FAILLAPOP_SHOP_ABI, this.provider);
        this.vaultContract = new ethers.Contract(FAILLAPOP_VAULT_ADDRESS, FAILLAPOP_VAULT_ABI.abi, this.provider);
      } else {
        console.log('No Ethereum provider found, using read-only provider');
        this.provider = new ethers.providers.JsonRpcProvider('http://localhost:8545');
        this.contract = new ethers.Contract(FAILLAPOP_PROXY_ADDRESS, FAILLAPOP_SHOP_ABI, this.provider);
        this.vaultContract = new ethers.Contract(FAILLAPOP_VAULT_ADDRESS, FAILLAPOP_VAULT_ABI.abi, this.provider);
      }

      console.log('Verifying contract deployment...');
      const proxyCode = await this.provider.getCode(FAILLAPOP_PROXY_ADDRESS);
      if (proxyCode === '0x') {
        throw new Error('Proxy contract not deployed at the specified address');
      }

      const vaultCode = await this.provider.getCode(FAILLAPOP_VAULT_ADDRESS);
      if (vaultCode === '0x') {
        throw new Error('Vault contract not deployed at the specified address');
      }
      
      if (!this.contract) {
        throw new Error('Shop contract not initialized');
      }
      if (!this.vaultContract) {
        throw new Error('Vault contract not initialized');
      }

      const nextId = await this.contract.offerIndex();
      console.log('Shop contract initialized successfully. Next offer index:', nextId.toString());

      // Test vault contract by calling a simple function
      const vaultBalance = await this.vaultContract.vaultBalance();
      console.log('Vault contract initialized successfully. Vault balance:', vaultBalance.toString());
    } catch (error) {
      console.error('Error initializing contract:', error);
      throw error;
    }
  }

  async getAddress(): Promise<string | null> {
    if (!this.provider || !(this.provider instanceof ethers.providers.Web3Provider)) return null;
    const accounts = await this.provider.listAccounts();
    return accounts[0] || null;
  }

  async isBlacklisted(address: string): Promise<boolean> {
    // Por ahora, retornamos false ya que no tenemos esta función en el contrato
    return false;
  }

  // Vault functions
  async getUserBalance(address: string): Promise<string> {
    if (!this.vaultContract) throw new Error('Vault contract not initialized');
    const balance = await this.vaultContract.userBalance(address);
    return ethers.utils.formatEther(balance);
  }

  async getUserLockedBalance(address: string): Promise<string> {
    if (!this.vaultContract) throw new Error('Vault contract not initialized');
    const lockedBalance = await this.vaultContract.userLockedBalance(address);
    return ethers.utils.formatEther(lockedBalance);
  }

  async getVaultBalance(): Promise<string> {
    if (!this.vaultContract) throw new Error('Vault contract not initialized');
    const balance = await this.vaultContract.vaultBalance();
    return ethers.utils.formatEther(balance);
  }

  async getMaxClaimableAmount(): Promise<string> {
    if (!this.vaultContract) throw new Error('Vault contract not initialized');
    const amount = await this.vaultContract.maxClaimableAmount();
    return ethers.utils.formatEther(amount);
  }

  async getRewardsClaimed(address: string): Promise<string> {
    if (!this.vaultContract) throw new Error('Vault contract not initialized');
    const claimed = await this.vaultContract.rewardsClaimed(address);
    return ethers.utils.formatEther(claimed);
  }

  async getTotalSlashed(): Promise<string> {
    if (!this.vaultContract) throw new Error('Vault contract not initialized');
    const slashed = await this.vaultContract.totalSlashed();
    return ethers.utils.formatEther(slashed);
  }

  async stake(amount: string): Promise<void> {
    if (!this.vaultContract || !this.provider) throw new Error('Vault contract not initialized');
    if (typeof window.ethereum === 'undefined') throw new Error('Please install MetaMask!');
    
    console.log('Staking amount:', amount);
    console.log('Vault contract address:', this.vaultContract.address);
    
    const web3Provider = new ethers.providers.Web3Provider(window.ethereum as any);
    const signer = web3Provider.getSigner();
    const signerAddress = await signer.getAddress();
    console.log('Signer address:', signerAddress);
    
    const vaultWithSigner = this.vaultContract.connect(signer);
    
    const amountInWei = ethers.utils.parseEther(amount);
    console.log('Amount in wei:', amountInWei.toString());
    
    // Try to estimate gas first
    let tx;
    try {
      const gasEstimate = await vaultWithSigner.estimateGas.doStake({ value: amountInWei });
      console.log('Gas estimate:', gasEstimate.toString());
      tx = await vaultWithSigner.doStake({ value: amountInWei });
    } catch (estimateError) {
      console.error('Gas estimation failed, trying with fixed gas limit:', estimateError);
      // If gas estimation fails, try with a fixed gas limit
      tx = await vaultWithSigner.doStake({ 
        value: amountInWei, 
        gasLimit: 100000 // Fixed gas limit
      });
    }
    await tx.wait();
  }

  async unstake(amount: string): Promise<void> {
    if (!this.vaultContract || !this.provider) throw new Error('Vault contract not initialized');
    if (typeof window.ethereum === 'undefined') throw new Error('Please install MetaMask!');
    
    const web3Provider = new ethers.providers.Web3Provider(window.ethereum as any);
    const signer = web3Provider.getSigner();
    const vaultWithSigner = this.vaultContract.connect(signer);
    
    const amountInWei = ethers.utils.parseEther(amount);
    const tx = await vaultWithSigner.doUnstake(amountInWei);
    await tx.wait();
  }

  async claimRewards(): Promise<void> {
    if (!this.vaultContract || !this.provider) throw new Error('Vault contract not initialized');
    if (typeof window.ethereum === 'undefined') throw new Error('Please install MetaMask!');
    
    const web3Provider = new ethers.providers.Web3Provider(window.ethereum as any);
    const signer = web3Provider.getSigner();
    const vaultWithSigner = this.vaultContract.connect(signer);
    
    const tx = await vaultWithSigner.claimRewards();
    await tx.wait();
  }

  async uploadToIPFS(file: File): Promise<string> {
    try {
      const result = await this.ipfs.add(file);
      return result.path;
    } catch (error) {
      console.error('Error uploading to IPFS:', error);
      throw new Error('Failed to upload image to IPFS');
    }
  }

  async createItem(name: string, description: string, price: string, image?: File) {
    if (!this.contract || !this.provider) throw new Error('Contract not initialized');
    if (typeof window.ethereum === 'undefined') throw new Error('Please install MetaMask!');
    
    const web3Provider = new ethers.providers.Web3Provider(window.ethereum as any);
    const signer = web3Provider.getSigner();
    const contractWithSigner = this.contract.connect(signer);
    
    let imageUrl = '';
    if (image) {
      imageUrl = await this.uploadToIPFS(image);
    }

    const priceInWei = ethers.utils.parseEther(price);
    const tx = await contractWithSigner.newSale(name, description, priceInWei);
    await tx.wait();
  }

  async getAllItems(): Promise<Item[]> {
    if (!this.contract) throw new Error('Contract not initialized');
    
    const itemCount = await this.contract.offerIndex();
    const items: Item[] = [];

    for (let i = 0; i < itemCount; i++) {
      const item = await this.contract.offeredItems(i);
      const state = item.state as ItemState;
      
      // Filtrar items que están en estado Undefined (eliminados)
      if (state === ItemState.Undefined) {
        continue;
      }
      
      items.push({
        id: i,
        name: item.title,
        description: item.description,
        price: ethers.utils.formatEther(item.price),
        seller: item.seller,
        buyer: item.buyer === ethers.constants.AddressZero ? undefined : item.buyer,
        state: state,
        buyTimestamp: item.buyTimestamp ? item.buyTimestamp.toNumber() : undefined,
        isSold: state === ItemState.Sold, // Backward compatibility
        imageUrl: '' // No hay campo de imagen en este contrato
      });
    }

    return items;
  }

  async getSellerItems(sellerAddress: string): Promise<Item[]> {
    if (!this.contract) throw new Error('Contract not initialized');
    
    const itemCount = await this.contract.offerIndex();
    const items: Item[] = [];

    for (let i = 0; i < itemCount; i++) {
      const item = await this.contract.offeredItems(i);
      
      // Filtrar items que están en estado Undefined (eliminados)
      const state = item.state as ItemState;
      if (state === ItemState.Undefined) {
        continue;
      }
      
      if (item.seller.toLowerCase() === sellerAddress.toLowerCase()) {
        items.push({
          id: i,
          name: item.title,
          description: item.description,
          price: ethers.utils.formatEther(item.price),
          seller: item.seller,
          buyer: item.buyer === ethers.constants.AddressZero ? undefined : item.buyer,
          state: state,
          buyTimestamp: item.buyTimestamp ? item.buyTimestamp.toNumber() : undefined,
          isSold: state === ItemState.Sold, // Backward compatibility
          imageUrl: '' // No hay campo de imagen en este contrato
        });
      }
    }

    return items;
  }

  async buyItem(itemId: number) {
    if (!this.contract || !this.provider) throw new Error('Contract not initialized');
    if (typeof window.ethereum === 'undefined') throw new Error('Please install MetaMask!');
    
    const web3Provider = new ethers.providers.Web3Provider(window.ethereum as any);
    const signer = web3Provider.getSigner();
    const contractWithSigner = this.contract.connect(signer);
    
    const item = await this.contract.offeredItems(itemId);
    const price = item.price;
    
    const tx = await contractWithSigner.doBuy(itemId, { value: price });
    await tx.wait();
  }

  async isInitialized(): Promise<boolean> {
    try {
      if (!this.contract || !this.vaultContract) return false;
      await this.contract.offerIndex();
      await this.vaultContract.vaultBalance();
      return true;
    } catch (error) {
      console.error('Error checking contract initialization:', error);
      return false;
    }
  }

  // Dispute functions
  async disputeSale(itemId: number, buyerReasoning: string): Promise<void> {
    if (!this.contract || !this.provider) throw new Error('Contract not initialized');
    if (typeof window.ethereum === 'undefined') throw new Error('Please install MetaMask!');
    
    const web3Provider = new ethers.providers.Web3Provider(window.ethereum as any);
    const signer = web3Provider.getSigner();
    const contractWithSigner = this.contract.connect(signer);
    
    const tx = await contractWithSigner.disputeSale(itemId, buyerReasoning);
    await tx.wait();
  }

  async disputedSaleReply(itemId: number, sellerReasoning: string): Promise<void> {
    if (!this.contract || !this.provider) throw new Error('Contract not initialized');
    if (typeof window.ethereum === 'undefined') throw new Error('Please install MetaMask!');
    
    const web3Provider = new ethers.providers.Web3Provider(window.ethereum as any);
    const signer = web3Provider.getSigner();
    const contractWithSigner = this.contract.connect(signer);
    
    const tx = await contractWithSigner.disputedSaleReply(itemId, sellerReasoning);
    await tx.wait();
  }

  async endDispute(itemId: number): Promise<void> {
    if (!this.contract || !this.provider) throw new Error('Contract not initialized');
    if (typeof window.ethereum === 'undefined') throw new Error('Please install MetaMask!');
    
    const web3Provider = new ethers.providers.Web3Provider(window.ethereum as any);
    const signer = web3Provider.getSigner();
    const contractWithSigner = this.contract.connect(signer);
    
    const tx = await contractWithSigner.endDispute(itemId);
    await tx.wait();
  }

  async itemReceived(itemId: number): Promise<void> {
    if (!this.contract || !this.provider) throw new Error('Contract not initialized');
    if (typeof window.ethereum === 'undefined') throw new Error('Please install MetaMask!');
    
    const web3Provider = new ethers.providers.Web3Provider(window.ethereum as any);
    const signer = web3Provider.getSigner();
    const contractWithSigner = this.contract.connect(signer);
    
    const tx = await contractWithSigner.itemReceived(itemId);
    await tx.wait();
  }

  async returnItem(itemId: number): Promise<void> {
    if (!this.contract || !this.provider) throw new Error('Contract not initialized');
    if (typeof window.ethereum === 'undefined') throw new Error('Please install MetaMask!');
    
    const web3Provider = new ethers.providers.Web3Provider(window.ethereum as any);
    const signer = web3Provider.getSigner();
    const contractWithSigner = this.contract.connect(signer);
    
    const tx = await contractWithSigner.returnItem(itemId);
    await tx.wait();
  }

  async setVacationMode(vacationMode: boolean): Promise<void> {
    if (!this.contract || !this.provider) throw new Error('Contract not initialized');
    if (typeof window.ethereum === 'undefined') throw new Error('Please install MetaMask!');
    
    const web3Provider = new ethers.providers.Web3Provider(window.ethereum as any);
    const signer = web3Provider.getSigner();
    const contractWithSigner = this.contract.connect(signer);
    
    const tx = await contractWithSigner.setVacationMode(vacationMode);
    await tx.wait();
  }

  // Query functions for disputes
  async getDispute(itemId: number): Promise<Dispute | null> {
    if (!this.contract) throw new Error('Contract not initialized');
    
    try {
      const dispute = await this.contract.disputedItems(itemId);
      
      // Check if dispute exists (disputeId should be > 0 for active disputes)
      if (dispute.disputeId === 0 && dispute.disputeTimestamp === 0) {
        return null;
      }
      
      return {
        disputeId: dispute.disputeId,
        disputeTimestamp: dispute.disputeTimestamp.toNumber(),
        buyerReasoning: dispute.buyerReasoning,
        sellerReasoning: dispute.sellerReasoning
      };
    } catch (error) {
      console.error('Error getting dispute:', error);
      return null;
    }
  }

  async getItemDetails(itemId: number): Promise<Sale | null> {
    if (!this.contract) throw new Error('Contract not initialized');
    
    try {
      const item = await this.contract.offeredItems(itemId);
      
      // Check if item exists
      if (item.seller === ethers.constants.AddressZero) {
        return null;
      }
      
      return {
        seller: item.seller,
        buyer: item.buyer,
        title: item.title,
        description: item.description,
        price: ethers.utils.formatEther(item.price),
        state: item.state as ItemState,
        buyTimestamp: item.buyTimestamp ? item.buyTimestamp.toNumber() : 0
      };
    } catch (error) {
      console.error('Error getting item details:', error);
      return null;
    }
  }
} 