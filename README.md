# Faillapop - Project Documentation

## 📌 Based On

This project is an **extension and adaptation of the original [`faillapop`](https://github.com/jcsec-security/faillapop)** repository developed by [jcsec-security](https://github.com/jcsec-security). It builds upon its architecture and concept, introducing improvements in user experience, interface, and features on the Ethereum blockchain.

---

## Description

**Faillapop** is a decentralized marketplace application that enables users to buy and sell products using blockchain technology (Ethereum). It integrates with MetaMask to manage identities and transactions, offering distinct roles such as buyer, seller, and admin.

---

## Installation

### Foundry Setup

1. Install Foundry:
   ```bash
   curl -L https://foundry.paradigm.xyz | bash
   foundryup
   ```

2. Clone the repository and install smart contract dependencies:
   ```bash
   git clone git@github.com:mredaht/Faillapop2.0.git
   cd contracts
   forge install
   ```

3. Install frontend dependencies:
   ```bash
   cd ../frontend
   npm install
   ```

---

## Usage

### Smart Contracts (using Foundry)

1. Start a local blockchain:
   ```bash
   anvil
   ```

2. In a new terminal, compile the contracts:
   ```bash
   forge build
   ```

3. Run the tests:
   ```bash
   forge test
   ```

4. Deploy the contracts:
   ```bash
   forge script script/DeployFaillapop.s.sol --broadcast
   ```

---

### Frontend

1. Start the frontend development server:
   ```bash
   npm run dev
   ```

2. Open in your browser:
   ```
   http://localhost:3000
   ```

---

## Technologies Used

### Frontend

- **React 16.3.0**
- **TypeScript**
- **Custom CSS**
- **React Router DOM** for navigation
- **Context API** for global state management
- **MetaMask** for Ethereum integration

---

## Frontend Folder Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── WalletConnect.tsx
│   │   ├── CreateItem.tsx
│   │   ├── ItemList.tsx
│   │   └── ItemDetails.tsx
│   ├── context/
│   │   └── UserContext.tsx
│   ├── types/
│   │   ├── User.ts
│   │   └── ethereum.d.ts
│   ├── styles/
│   │   └── global.css
│   └── App.tsx
├── public/
└── package.json
```

---

## Main Components

### `WalletConnect.tsx`

- **Purpose:** Manages MetaMask wallet connection.
- **Key Functions:**
  - `connectWallet`: connects the user's wallet.
  - `getUserRole`: determines if user is a buyer, seller, or admin.
- **Context used:** `UserContext`.

---

### `CreateItem.tsx`

- **Purpose:** Allows sellers to create product listings.
- **Features:**
  - Form with validation.
  - Image upload.
  - Fields for name, description, price.
- **Local state:** Uses hooks to handle input.
- **Ethereum connection:** Sends transaction to register product on smart contract.

---

### `ItemList.tsx`

- **Purpose:** Displays all available products.
- **Features:**
  - Search by name.
  - Filter by category or price.
  - Responsive grid layout.
- **Props:** receives data from backend or blockchain.
- **Renders:** multiple `ItemCard` components.

---

### `ItemDetails.tsx`

- **Purpose:** Shows detailed product information.
- **Includes:**
  - Image, description, price.
  - Purchase button (if buyer).
  - Star-based rating system.
- **Modal:** opens modal windows for purchasing or leaving reviews.

---

### `UserContext.tsx`

- **Purpose:** Defines global user context.
- **Includes:**
  - `address`: user's public Ethereum address.
  - `role`: current user role.
  - Methods to update user data.

---

## Types and Interfaces

```ts
interface User {
  address: string;
  role: UserRole;
}

type UserRole = 'buyer' | 'seller' | 'admin';

interface Ethereum {
  request: (args: { method: string; params?: any[] }) => Promise<any>;
  on: (eventName: string, handler: (...args: any[]) => void) => void;
  removeListener: (eventName: string, handler: (...args: any[]) => void) => void;
}
```

---

## Smart Contract Addresses

```ts
export const FAILLAPOP_SHOP_ADDRESS        = "0x0165878A594ca255338adfa4d48449f69242Eb8F";
export const FAILLAPOP_TOKEN_ADDRESS       = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
export const FAILLAPOP_COOLNFT_ADDRESS     = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";
export const FAILLAPOP_POWERSELLER_ADDRESS = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9";
export const FAILLAPOP_DAO_ADDRESS         = "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9";
export const FAILLAPOP_VAULT_ADDRESS       = "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707";
export const FAILLAPOP_PROXY_ADDRESS       = "0x0165878A594ca255338adfa4d48449f69242Eb8F";
```

---

## Core Features

### User Roles

- **Buyer:** Can view and purchase products.
- **Seller:** Can create, edit, and delete their own listings.
- **Admin:** Full system management (moderation, DAO, etc.).

### Key Application Features

- Connect wallet via MetaMask.
- Create and list products from smart contract.
- Send purchase transactions.
- Store reviews and ratings.
- Responsive, modular interface.

---

## TODO

- Add vulnerability documentation and audit notes.