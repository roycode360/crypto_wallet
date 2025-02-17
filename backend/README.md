# Crypto Wallet Backend

A NestJS-based backend service that handles user management, NFT transaction preparation, and blockchain interactions for the Crypto Wallet application. This service uses ethers.js for blockchain operations, integrates with the Alchemy API for querying blockchain data, and exposes RESTful endpoints built with NestJS.

---

## Overview

The Crypto Wallet Backend is a service built with NestJS that supports the Crypto Wallet application by:

- **Managing Users:** Create and update user records, including username changes via challenge-signing.
- **Preparing Transactions:** Generate NFT transfer transactions for both ERC721 and ERC1155 tokens.
- **Blockchain Integration:** Leverage ethers.js and the Alchemy API to fetch blockchain data and interact with smart contracts.
- **Exposing APIs:** Provide RESTful endpoints for user management and NFT operations.

---

## Features

- **User Management:** Create new users and update usernames via secure challenge-response workflows.
- **Transaction Preparation:** Prepare unsigned NFT transfer transactions for ERC721 and ERC1155 tokens.
- **Blockchain Queries:** Retrieve native balances, token balances, and NFT data via the Alchemy API.
- **API Endpoints:** Built with NestJS for scalability and maintainability.
- **Environment Configuration:** Uses environment variables for sensitive configuration.
- **Error Handling:** Comprehensive error handling with NestJS exception filters and logging.

---

## Tech Stack

- **NestJS** – A progressive Node.js framework for building efficient and scalable server-side applications.
- **TypeScript** – Provides static typing for improved code quality and maintainability.
- **ethers.js** – A library for interacting with Ethereum-compatible blockchains.
- **Alchemy API** – Supplies blockchain data and node access for the Polygon network.
- **@nestjs/config** – For managing environment variables and application configuration.
- **Database** - PostgreSQL.

---

## Getting Started

### Prerequisites

- **Node.js**
- **npm**
- A valid **Alchemy API Key** for Polygon Mainnet
- PostgreSQL must be installed and running before your NestJS app can connect to it.

### Installation

1. **Clone the Repository:**

   Navigate to the root of the project: cd ..
   git clone https://github.com/roycode360/crypto_wallet.git
   cd backend

2. **Install Dependencies:**

   npm install

## Environment Variables

Create a .env file in the root directory with the following content:

DATABASE_URL=<your_local_postgres_db_url>
POLYGON_RPC_URL=<your_alchemy_polygon_rpc_url>

> **Note:**
> DATABASE_URL should point to your database connection string.
> POLYGON_RPC_URL is used for blockchain interactions via the Alchemy API.

## Running the Project

To run the project in development mode:

npm run start:dev
The server will start on the port 8000 i.e http://localhost:8000.
