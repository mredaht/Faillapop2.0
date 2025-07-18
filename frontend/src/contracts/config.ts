// Import ABIs from compiled contracts
import FAILLAPOP_SHOP_ABI from './abis/FP_Shop.json';
import FAILLAPOP_VAULT_ABI from './abis/FP_Vault.json';
import FAILLAPOP_TOKEN_ABI from './abis/FP_Token.json';

// Contract addresses from LATEST Foundry deployment (FULLY VULNERABLE VERSION)
export const SHOP_CONTRACT_ADDRESS = "0x9E545E3C0baAB3E08CdfD552C960A1050f373042";
export const FAILLAPOP_TOKEN_ADDRESS = "0xa82fF9aFd8f496c3d6ac40E2a0F282E47488CFc9";
export const VAULT_CONTRACT_ADDRESS = "0x95401dc811bb5740090279Ba06cfA8fcF6113778";
export const DAO_CONTRACT_ADDRESS = "0xf5059a5D33d5853360D16C683c16e67980206f36";
export const COOLNFT_CONTRACT_ADDRESS = "0x1613beB3B2C4f22Ee086B2b38C1476A3cE7f78E8";
export const POWERSELLER_NFT_CONTRACT_ADDRESS = "0x851356ae760d987E095750cCeb3bC6014560891C";
export const PROXY_CONTRACT_ADDRESS = "0x998abeb3E57409262aE5b751f60747921B33613E";

// Export ABIs
export { FAILLAPOP_SHOP_ABI, FAILLAPOP_VAULT_ABI, FAILLAPOP_TOKEN_ABI };

export const FAILLAPOP_ABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "itemId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "seller",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "name",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "price",
        "type": "uint256"
      }
    ],
    "name": "ItemListed",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "itemId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "buyer",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "seller",
        "type": "address"
      }
    ],
    "name": "ItemSold",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_itemId",
        "type": "uint256"
      }
    ],
    "name": "buyItem",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "items",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "name",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "description",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "price",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "seller",
        "type": "address"
      },
      {
        "internalType": "bool",
        "name": "isSold",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_name",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_description",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "_price",
        "type": "uint256"
      }
    ],
    "name": "listItem",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "nextItemId",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
]; 