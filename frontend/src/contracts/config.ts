// Import ABIs from compiled contracts
import FAILLAPOP_SHOP_ABI from './abis/FP_Shop.json';
import FAILLAPOP_VAULT_ABI from './abis/FP_Vault.json';
import FAILLAPOP_TOKEN_ABI from './abis/FP_Token.json';

// Contract addresses from LATEST Foundry deployment (FRESH ANVIL INSTANCE)
export const FAILLAPOP_SHOP_ADDRESS = "0x322813Fd9A801c5507c9de605d63CEA4f2CE6c44";
export const FAILLAPOP_TOKEN_ADDRESS = "0xa85233C63b9Ee964Add6F2cffe00Fd84eb32338f";
export const FAILLAPOP_COOLNFT_ADDRESS = "0x4A679253410272dd5232B3Ff7cF5dbB88f295319";
export const FAILLAPOP_POWERSELLER_ADDRESS = "0x7a2088a1bFc9d81c55368AE168C2C02570cB814F";
export const FAILLAPOP_DAO_ADDRESS = "0x09635F643e140090A9A8Dcd712eD6285858ceBef";
export const FAILLAPOP_VAULT_ADDRESS = "0xc5a5C42992dECbae36851359345FE25997F5C42d";
export const FAILLAPOP_PROXY_ADDRESS = "0x67d269191c92Caf3cD7723F116c85e6E9bf55933";

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