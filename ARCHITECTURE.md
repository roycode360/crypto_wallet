# Web3 Wallet Platform – Technical Documentation

## 1. Overview

The Web3 Wallet Platform is a decentralized web application that allows users to:

- Connect their cryptocurrency wallet using MetaMask to authenticate.
- View their token and NFT balances on the Polygon mainnet.
- Transfer NFTs to other users on the platform using recipient usernames.

## 2. Overall Architecture

The project is split into two primary parts:

### 2.1. Frontend

- **Framework:** Next.js with TypeScript
- **State Management and Data Fetching:** React Context for wallet state, and React Query (TanStack Query) for data fetching/caching.
- **Blockchain Integration:** Ethers.js for interacting with the blockchain, Alchemy API for fetching token and NFT metadata.
- **Authentication:** Wallet-based authentication where the user connects their wallet to log in. For sensitive actions like username changes, a challenge–response system is used.
- **Routing:** Next.js pages with protected routes that redirect based on wallet connection state.

### 2.2. Backend

- **Framework:** NestJS (Node.js with TypeScript)
- **Database:** PostgreSQL managed via TypeORM, which stores user data, including wallet addresses and usernames.
- **API Endpoints:**
  - User management (create user, get user, update user)
  - Wallet asset endpoints (e.g., retrieving token balances via Alchemy API and native balance via ethers.js)
  - Authentication endpoints including challenge generation and username update

## 3. Authentication and Security

### 3.1. Wallet-Based Authentication

**Connection Flow:**

- Users connect their wallet using MetaMask using `eth_requestAccounts`.
- The connected wallet address is stored in global state (via React Context) and used as the user’s identifier.

**Advantages:**

- Eliminates the need for passwords.
- Leverages cryptographic signatures for secure, decentralized authentication.

### 3.2. Challenge–Response for Privileged Actions

**Purpose:**

- When a user requests to change their username (critical for receiving NFTs), the system requires the user to sign a challenge message to verify ownership of the wallet.

**Process:**

- **Challenge Generation:**
  - The client requests a challenge by sending the wallet address to an API endpoint (`/user/username-change-challenge`).
  - The backend generates a nonce and constructs a challenge message:  
    `Sign this message to change your username. Nonce: 123456`
  - The nonce and its expiration are stored in PostgreSQL.
- **User Signature:**
  - The client receives the challenge message and uses MetaMask to sign it.
- **Verification and Update:**
  - The client submits the signed message along with the new username.
  - The backend retrieves the stored nonce, reconstructs the original challenge message, and uses `ethers.verifyMessage` to recover the wallet address.
  - If the recovered address matches the submitted wallet address, the username is updated, and the challenge is cleared.

**Design Decisions:**

- Using a challenge–response mechanism ensures that only the wallet owner, who possesses the private key, can authorize sensitive operations.
- Storing the nonce in PostgreSQL (with a short TTL) rather than in-memory guarantees persistence across server restart.

## 4. Backend Components and Data Flow

### 4.1. API Controllers and Services

- **UserController:**
  - Handles user creation, retrieval, and updates.
  - Exposes endpoints for generating challenges and changing the username.
- **UserService:**
  - Encapsulates business logic for user management.
  - Contains the method to verify a signed challenge and update the username.
- **WalletService:**
  - **Entity:** Challenge entity stores `walletAddress`, `nonce`, and expiration.
  - **Methods:**
    - `saveUsernameChallenge(walletAddress, nonce)` – saves or updates a challenge in PostgreSQL.
    - `getUsernameChallenge(walletAddress)` – retrieves the nonce and verifies if it’s still valid.
    - `clearUsernameChallenge(walletAddress)` – removes the nonce after successful verification.
    - `prepareNftTransfer(nftTransferDto)` – prepares the NFT transfer transactions to be signed by the user with MetaMask. Also fetching recipient wallet using their username.

### 4.2. Data Models

- **User Entity:**
  - Fields include `id`, `username`, `walletAddress`.
- **Challenge Entity:**
  - Fields include `id`, `walletAddress`, `nonce`, and `expiresAt`.

### 4.3. External Integrations

- **Blockchain Interactions:**
  - Ethers.js is used to fetch native token balances and interact with smart contracts.
- **Alchemy API:**
  - Used to fetch ERC-20 token balances and NFT data.
- **Environment Variables:**
  - Sensitive configuration such as API keys, RPC endpoints, etc., are managed via environment variables.

## 5. Frontend Components and Data Flow

### 5.1. State Management

- **Wallet Context:**
  - Provides global wallet state (wallet address, connection status, and methods for connecting/disconnecting).
- **React Query:**
  - Manages data fetching for assets, user details, and other API calls.

### 5.2. UI Flow

- **Landing Page:**
  - Prompts the user to connect their wallet.
- **Dashboard:**
  - Displays wallet assets (native token balance, ERC-20 tokens, NFTs).
- **Username Change Flow:**
  - When a user opts to change their username, the application:
    - Fetches a challenge from the backend.
    - Prompts the user to sign the challenge.
    - Submits the signature and new username to update the user profile.
- **NFT Transfer Flow:**
  - When a user want to send NFTs:
    - The user needs to fill a form where they select the NFT, recipient (in-platform) username and number of NFTs to send.
    - A request is sent to the backend service which accurately retrieves the recipient’s wallet address based on their username, prepares the transfer transaction and returns the prepared transaction to the client.
    - The user signs the transfer transaction using MetaMask and the NFT is sent to the recipient.

## 6. Key Design Decisions

- **Wallet-Based Authentication:**  
  Eliminates the need for traditional passwords, reducing the risk of credential theft and aligning with decentralized identity principles.
- **Challenge–Response Mechanism:**  
  Protects sensitive operations (like username changes) by ensuring that only the owner of the wallet can authorize these actions. The use of a nonce and expiration ensures that challenges are one-time and time-limited.
- **Separation of Concerns:**
  - **Frontend vs. Backend:** Clear delineation between UI, business logic, and data access layers.
  - **Controller vs. Service:** Controllers manage HTTP requests/responses while services encapsulate business logic, making the system more modular and testable.
- **Persistent Challenge Storage:**  
  Using PostgreSQL (via TypeORM) for storing challenge nonces ensures reliability and supports scaling scenarios versus an in-memory solution.
- **Use of External APIs:**  
  Integrating with services like Alchemy provides reliable and scalable access to blockchain data (like token balances, NFT data) without building a full indexer.

## 7. Deployment

Frontend - Vercel
Backend - Render (The first API request after a period of inactivity might have a slight delay as the server spins up)
