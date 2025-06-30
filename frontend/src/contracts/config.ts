// Import ABIs from local files
import FP_Shop from './abis/FP_Shop_complete.json';
import FP_Token from './abis/FP_Token.json';
import FP_CoolNFT from './abis/FP_CoolNFT.json';
import FP_PowersellerNFT from './abis/FP_PowersellerNFT.json';
import FP_DAO from './abis/FP_DAO.json';
import FP_Vault from './abis/FP_Vault.json';

// Contract addresses from Foundry deployment
export const FAILLAPOP_SHOP_ADDRESS = "0x4ed7c70F96B99c776995fB64377f0d4aB3B0e1C1";
export const FAILLAPOP_TOKEN_ADDRESS = "0x322813Fd9A801c5507c9de605d63CEA4f2CE6c44";
export const FAILLAPOP_COOLNFT_ADDRESS = "0xa85233C63b9Ee964Add6F2cffe00Fd84eb32338f";
export const FAILLAPOP_POWERSELLER_ADDRESS = "0x4A679253410272dd5232B3Ff7cF5dbB88f295319";
export const FAILLAPOP_DAO_ADDRESS = "0x7a2088a1bFc9d81c55368AE168C2C02570cB814F";
export const FAILLAPOP_VAULT_ADDRESS = "0x09635F643e140090A9A8Dcd712eD6285858ceBef";
export const FAILLAPOP_PROXY_ADDRESS = "0xc5a5C42992dECbae36851359345FE25997F5C42d";

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