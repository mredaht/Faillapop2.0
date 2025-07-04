// Import ABIs from compiled contracts
import FAILLAPOP_SHOP_ABI from './abis/FP_Shop.json';
import FAILLAPOP_VAULT_ABI from './abis/FP_Vault.json';
import FAILLAPOP_TOKEN_ABI from './abis/FP_Token.json';

// Contract addresses from LATEST Foundry deployment (FRESH ANVIL INSTANCE)
export const FAILLAPOP_SHOP_ADDRESS = "0xB7f8BC63BbcaD18155201308C8f3540b07f84F5e";
export const FAILLAPOP_TOKEN_ADDRESS = "0xA51c1fc2f0D1a1b8494Ed1FE312d7C3a78Ed91C0";
export const FAILLAPOP_COOLNFT_ADDRESS = "0x0DCd1Bf9A1b36cE34237eEaFef220932846BCD82";
export const FAILLAPOP_POWERSELLER_ADDRESS = "0x9A676e781A523b5d0C0e43731313A708CB607508";
export const FAILLAPOP_DAO_ADDRESS = "0x0B306BF915C4d645ff596e518fAf3F9669b97016";
export const FAILLAPOP_VAULT_ADDRESS = "0x959922bE3CAee4b8Cd9a407cc3ac1C251C2007B1";
export const FAILLAPOP_PROXY_ADDRESS = "0x9A9f2CCfdE556A7E9Ff0848998Aa4a0CFD8863AE";

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