// Import ABIs from compiled contracts
import FAILLAPOP_SHOP_ABI from './abis/FP_Shop.json';
import FAILLAPOP_VAULT_ABI from './abis/FP_Vault.json';
import FAILLAPOP_TOKEN_ABI from './abis/FP_Token.json';

// Contract addresses from SUCCESSFUL Foundry deployment (FINAL - UPDATED)
export const FAILLAPOP_SHOP_ADDRESS = "0x8f86403A4DE0BB5791fa46B8e795C547942fE4Cf";
export const FAILLAPOP_TOKEN_ADDRESS = "0x9d4454B023096f34B160D6B654540c56A1F81688";
export const FAILLAPOP_COOLNFT_ADDRESS = "0x5eb3Bc0a489C5A8288765d2336659EbCA68FCd00";
export const FAILLAPOP_POWERSELLER_ADDRESS = "0x36C02dA8a0983159322a80FFE9F24b1acfF8B570";
export const FAILLAPOP_DAO_ADDRESS = "0x809d550fca64d94Bd9F66E60752A544199cfAC3D";
export const FAILLAPOP_VAULT_ADDRESS = "0x4c5859f0F772848b2D91F1D83E2Fe57935348029";
export const FAILLAPOP_PROXY_ADDRESS = "0x1291Be112d480055DaFd8a610b7d1e203891C274";

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