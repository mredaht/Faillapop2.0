// Import ABIs from compiled contracts
import FAILLAPOP_SHOP_ABI from './abis/FP_Shop.json';
import FAILLAPOP_VAULT_ABI from './abis/FP_Vault.json';
import FAILLAPOP_TOKEN_ABI from './abis/FP_Token.json';

// Contract addresses from SUCCESSFUL Foundry deployment (LATEST - UPDATED WITH QUICK PRICE CHANGE)
export const FAILLAPOP_SHOP_ADDRESS = "0xd9140951d8aE6E5F625a02F5908535e16e3af964";
export const FAILLAPOP_TOKEN_ADDRESS = "0x56D13Eb21a625EdA8438F55DF2C31dC3632034f5";
export const FAILLAPOP_COOLNFT_ADDRESS = "0xE8addD62feD354203d079926a8e563BC1A7FE81e";
export const FAILLAPOP_POWERSELLER_ADDRESS = "0xe039608E695D21aB11675EBBA00261A0e750526c";
export const FAILLAPOP_DAO_ADDRESS = "0x071586BA1b380B00B793Cc336fe01106B0BFbE6D";
export const FAILLAPOP_VAULT_ADDRESS = "0xe70f935c32dA4dB13e7876795f1e175465e6458e";
export const FAILLAPOP_PROXY_ADDRESS = "0x3C15538ED063e688c8DF3d571Cb7a0062d2fB18D";

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