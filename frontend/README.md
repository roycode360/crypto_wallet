# Crypto Wallet Frontend

A Next.js-based decentralized application that enables users to connect their wallet, view their native, token, NFT balances, and send NFTs between users on the Polygon network. This project leverages React Query for data fetching, Tailwind CSS for styling, ethers.js and Alchemy's API for blockchain interactions.

---

## Overview

The Crypto Wallet Frontend is a user-friendly dApp interface that allows users to:

- **Connect** their MetaMask wallet.
- **View** native MATIC and ERC20 token balances.
- **Manage** NFT collections fetched via the Alchemy API.
- **Send** NFTs using user's username by preparing transactions on the backend and signing them via MetaMask.
- **Interact** with a backend service for user management and transaction preparation.

---

## Features

- **Wallet Integration:** MetaMask connectivity.
- **Real-Time Data:** Uses React Query to fetch up-to-date balances and NFT information.
- **NFT Management:** Browse, select, and send NFTs.
- **Responsive Design:** Built with Next.js and Tailwind CSS for optimal viewing on all devices.
- **User Notifications:** Toast notifications provide real-time feedback on operations.
- **Theming:** Custom theme colors integrated via Tailwind CSS using CSS variables.

---

## Tech Stack

- **Next.js** – React framework for building server-rendered applications.
- **React Query** – Efficient data fetching and caching.
- **Tailwind CSS** – Utility-first CSS framework with custom theming.
- **ethers.js & Alchemy API** – For blockchain interactions.
- **MetaMask** – Browser wallet for Ethereum-based networks.
- **TypeScript** – Ensures type safety and cleaner code.

---

## Getting Started

### Prerequisites

- **Node.js** (Node.js version "^18.18.0 || ^19.8.0 || >= 20.0.0" is required)
- **npm**
- **MetaMask** browser extension installed
- A valid **Alchemy API Key**

### Installation

1. **Clone the Repository:**

   Navigate to the root of the project: cd ..
   git clone https://github.com/roycode360/crypto_wallet.git
   cd frontend

2. **Install Dependencies:**

   npm install

## Environment Variables

Create a .env.local file in the root directory with the following content:
NEXT_PUBLIC_ALCHEMY_API_KEY=<alchemy_api_key>
NEXT_PUBLIC_API_URL=http://localhost:8000

> **Note:**
> NEXT_PUBLIC_ALCHEMY_API_KEY connects to the Alchemy API.
> NEXT_PUBLIC_API_URL points to the backend service.

## Running the Project

To run the project in development mode:

npm run dev

Open http://localhost:3000 to view the app.
