// Import ABIs from local files
import FP_Shop from './abis/FP_Shop_complete.json';
import FP_Token from './abis/FP_Token.json';
import FP_CoolNFT from './abis/FP_CoolNFT.json';
import FP_PowersellerNFT from './abis/FP_PowersellerNFT.json';
import FP_DAO from './abis/FP_DAO.json';
import FP_Vault from './abis/FP_Vault.json';

// Contract addresses from Foundry deployment (Updated)
export const FAILLAPOP_SHOP_ADDRESS = "0x851356ae760d987E095750cCeb3bC6014560891C";
export const FAILLAPOP_TOKEN_ADDRESS = "0xf5059a5D33d5853360D16C683c16e67980206f36";
export const FAILLAPOP_COOLNFT_ADDRESS = "0x95401dc811bb5740090279Ba06cfA8fcF6113778";
export const FAILLAPOP_POWERSELLER_ADDRESS = "0x998abeb3E57409262aE5b751f60747921B33613E";
export const FAILLAPOP_DAO_ADDRESS = "0x70e0bA845a1A0F2DA3359C97E0285013525FFC49";
export const FAILLAPOP_VAULT_ADDRESS = "0x4826533B4897376654Bb4d4AD88B7faFD0C98528";
export const FAILLAPOP_PROXY_ADDRESS = "0x99bbA657f2BbC93c02D617f8bA121cB8Fc104Acf";

// Export ABIs
export const FAILLAPOP_SHOP_ABI = FP_Shop;
export const FAILLAPOP_TOKEN_ABI = FP_Token;
export const FAILLAPOP_COOLNFT_ABI = FP_CoolNFT;
export const FAILLAPOP_POWERSELLER_ABI = FP_PowersellerNFT;
export const FAILLAPOP_DAO_ABI = FP_DAO;
export const FAILLAPOP_VAULT_ABI = FP_Vault;

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