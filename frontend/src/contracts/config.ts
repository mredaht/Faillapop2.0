// Import ABIs from local files
import FP_Shop from './abis/FP_Shop.json';
import FP_Token from './abis/FP_Token.json';
import FP_CoolNFT from './abis/FP_CoolNFT.json';
import FP_PowersellerNFT from './abis/FP_PowersellerNFT.json';
import FP_DAO from './abis/FP_DAO.json';
import FP_Vault from './abis/FP_Vault.json';

// Contract addresses from Foundry deployment
export const FAILLAPOP_SHOP_ADDRESS = "0x0165878A594ca255338adfa4d48449f69242Eb8F";
export const FAILLAPOP_TOKEN_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
export const FAILLAPOP_COOLNFT_ADDRESS = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";
export const FAILLAPOP_POWERSELLER_ADDRESS = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9";
export const FAILLAPOP_DAO_ADDRESS = "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9";
export const FAILLAPOP_VAULT_ADDRESS = "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707";
export const FAILLAPOP_PROXY_ADDRESS = "0x0165878A594ca255338adfa4d48449f69242Eb8F";

// Export ABIs
export const FAILLAPOP_SHOP_ABI = FP_Shop.abi;
export const FAILLAPOP_TOKEN_ABI = FP_Token.abi;
export const FAILLAPOP_COOLNFT_ABI = FP_CoolNFT.abi;
export const FAILLAPOP_POWERSELLER_ABI = FP_PowersellerNFT.abi;
export const FAILLAPOP_DAO_ABI = FP_DAO.abi;
export const FAILLAPOP_VAULT_ABI = FP_Vault.abi;

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