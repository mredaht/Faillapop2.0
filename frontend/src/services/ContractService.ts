import { ethers } from 'ethers';
import { create } from 'ipfs-http-client';
import { FAILLAPOP_SHOP_ADDRESS, FAILLAPOP_SHOP_ABI, FAILLAPOP_TOKEN_ADDRESS, FAILLAPOP_TOKEN_ABI, FAILLAPOP_VAULT_ADDRESS, FAILLAPOP_VAULT_ABI } from '../contracts/config';
import { Item } from '../types/Item';
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
  private provider: ethers.providers.Web3Provider | null = null;
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
    if (typeof window.ethereum !== 'undefined') {
      try {
        console.log('Initializing contract with address:', FAILLAPOP_SHOP_ADDRESS);
        this.provider = new ethers.providers.Web3Provider(window.ethereum as EthereumProvider);
        
        // Verificar y cambiar a la red correcta si es necesario
        const network = await this.provider.getNetwork();
        console.log('Current network:', network);
        
        if (network.chainId !== 31337) {
          try {
            await window.ethereum?.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: '0x7A69' }], // 31337 en hexadecimal
            });
          } catch (switchError: any) {
            // Si la red no existe, intentar agregarla
            if (switchError.code === 4902) {
              await window.ethereum?.request({
                method: 'wallet_addEthereumChain',
                params: [{
                  chainId: '0x7A69',
                  chainName: 'Localhost 8545',
                  nativeCurrency: {
                    name: 'ETH',
                    symbol: 'ETH',
                    decimals: 18
                  },
                  rpcUrls: ['http://localhost:8545'],
                }],
              });
            } else {
              throw switchError;
            }
          }
        }
        
        const signer = this.provider.getSigner();
        console.log('Signer address:', await signer.getAddress());
        
        this.contract = new ethers.Contract(FAILLAPOP_SHOP_ADDRESS, FAILLAPOP_SHOP_ABI, signer);
        console.log('Contract initialized:', this.contract);
        
        // Verificar que el contrato está desplegado
        const code = await this.provider.getCode(FAILLAPOP_SHOP_ADDRESS);
        if (code === '0x') {
          throw new Error('Contract not deployed at the specified address');
        }
        
        // Verificar que podemos llamar a nextItemId
        const nextId = await this.contract.nextItemId();
        console.log('Next item ID:', nextId.toString());
      } catch (error) {
        console.error('Error initializing contract:', error);
        throw error;
      }
    } else {
      throw new Error('Please install MetaMask!');
    }
  }

  async getAddress(): Promise<string | null> {
    if (!this.provider) return null;
    const accounts = await this.provider.listAccounts();
    return accounts[0] || null;
  }

  async isBlacklisted(address: string): Promise<boolean> {
    // Por ahora, retornamos false ya que no tenemos esta función en el contrato
    return false;
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
    if (!this.contract) throw new Error('Contract not initialized');
    
    let imageUrl = '';
    if (image) {
      imageUrl = await this.uploadToIPFS(image);
    }

    const priceInWei = ethers.utils.parseEther(price);
    const tx = await this.contract.listItem(name, description, priceInWei);
    await tx.wait();
  }

  async getAllItems(): Promise<Item[]> {
    if (!this.contract) throw new Error('Contract not initialized');
    
    const itemCount = await this.contract.nextItemId();
    const items: Item[] = [];

    for (let i = 0; i < itemCount; i++) {
      const item = await this.contract.items(i);
      items.push({
        id: item.id.toNumber(),
        name: item.name,
        description: item.description,
        price: ethers.utils.formatEther(item.price),
        seller: item.seller,
        isSold: item.isSold,
        imageUrl: item.imageUrl || ''
      });
    }

    return items;
  }

  async getSellerItems(sellerAddress: string): Promise<Item[]> {
    if (!this.contract) throw new Error('Contract not initialized');
    
    const itemCount = await this.contract.nextItemId();
    const items: Item[] = [];

    for (let i = 0; i < itemCount; i++) {
      const item = await this.contract.items(i);
      if (item.seller.toLowerCase() === sellerAddress.toLowerCase()) {
        items.push({
          id: item.id.toNumber(),
          name: item.name,
          description: item.description,
          price: ethers.utils.formatEther(item.price),
          seller: item.seller,
          isSold: item.isSold,
          imageUrl: item.imageUrl || ''
        });
      }
    }

    return items;
  }

  async buyItem(itemId: number) {
    if (!this.contract) throw new Error('Contract not initialized');
    const tx = await this.contract.buyItem(itemId);
    await tx.wait();
  }

  async isInitialized(): Promise<boolean> {
    try {
      if (!this.contract) return false;
      await this.contract.nextItemId();
      return true;
    } catch (error) {
      console.error('Error checking contract initialization:', error);
      return false;
    }
  }
} 