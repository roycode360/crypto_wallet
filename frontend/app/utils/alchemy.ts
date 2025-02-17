// Description: This module contains utility functions to interact with the Alchemy API.
// It fetches the native MATIC balance, ERC20 token balances (enriched with metadata), and NFT balances.
// We use ethers.js to format the native balance while handling errors for API calls.

import { formatEther } from "ethers";

const ALCHEMY_API_KEY = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;
const ALCHEMY_BASE_URL = `https://polygon-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`;

/**
 * fetchAlchemyData
 * ----------------
 * A helper function to make a JSON-RPC call to the Alchemy API.
 *
 * @param method - The JSON-RPC method to call (e.g., "eth_getBalance")
 * @param params - An array of parameters for the call.
 * @returns The result from the API call or null in case of an error.
 */
const fetchAlchemyData = async (method: string, params: any): Promise<any> => {
  try {
    const response = await fetch(ALCHEMY_BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: 1,
        jsonrpc: "2.0",
        method,
        params,
      }),
    });

    if (!response.ok) {
      throw new Error(`Alchemy API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.result;
  } catch (error) {
    console.error(`Error fetching ${method}:`, error);
    return null;
  }
};

/**
 * fetchNativeBalance
 * ------------------
 * Fetches the native balance (in wei) for a given wallet address and formats it to Ether.
 *
 * @param walletAddress - The wallet address whose native balance is being requested.
 * @returns The formatted native balance as a string.
 */
export const fetchNativeBalance = async (
  walletAddress: string
): Promise<string> => {
  const result = await fetchAlchemyData("eth_getBalance", [
    walletAddress,
    "latest",
  ]);
  // formatEther converts the wei balance to a human-readable Ether value.
  return formatEther(result);
};

/**
 * fetchTokenMetadata
 * ------------------
 * Fetches metadata for an ERC20 token given its contract address.
 *
 * @param contractAddress - The contract address of the token.
 * @returns An object containing name, symbol, decimals, and logo of the token, or null if not available.
 */
const fetchTokenMetadata = async (
  contractAddress: string
): Promise<{
  name: string;
  symbol: string;
  decimals: number;
  logo: string;
} | null> => {
  const metadata = await fetchAlchemyData("alchemy_getTokenMetadata", [
    contractAddress,
  ]);
  return metadata
    ? {
        name: metadata.name || "Unknown",
        symbol: metadata.symbol || "UNKNOWN",
        decimals: metadata.decimals || 18,
        logo: metadata.logo || "",
      }
    : null;
};

/**
 * fetchTokenBalances
 * ------------------
 * Retrieves the ERC20 token balances for a given wallet address and enriches them with metadata.
 *
 * @param walletAddress - The wallet address to query.
 * @returns An array of token objects containing the contract address, formatted balance, name, symbol, and logo.
 */
export const fetchTokenBalances = async (
  walletAddress: string
): Promise<any[]> => {
  const result = await fetchAlchemyData("alchemy_getTokenBalances", [
    walletAddress,
    "erc20",
  ]);
  if (!result || !result.tokenBalances) return [];

  const tokens = await Promise.all(
    result.tokenBalances.map(
      async (token: { contractAddress: string; tokenBalance: string }) => {
        const metadata = await fetchTokenMetadata(token.contractAddress);
        if (!metadata) return null;

        return {
          contractAddress: token.contractAddress,
          balance:
            parseInt(token.tokenBalance, 16) / Math.pow(10, metadata.decimals),
          name: metadata.name,
          symbol: metadata.symbol,
          logo: metadata.logo,
        };
      }
    )
  );
  // Filter out any null values resulting from missing metadata.
  return tokens.filter(Boolean);
};

/**
 * fetchNFTBalances
 * ----------------
 * Retrieves the NFT balances for a given wallet address using the Alchemy NFT API.
 *
 * @param walletAddress - The wallet address to query.
 * @returns An array of NFT objects containing a unique ID, contract address, tokenId, name, logo, balance, and token type.
 */
export const fetchNFTBalances = async (
  walletAddress: string
): Promise<any[]> => {
  // Construct the GET endpoint URL using the Alchemy NFT API (v3)
  const url = `https://polygon-mainnet.g.alchemy.com/nft/v3/${ALCHEMY_API_KEY}/getNFTsForOwner?owner=${walletAddress}&withMetadata=true`;
  const options = {
    method: "GET",
    headers: {
      accept: "application/json",
    },
  };

  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`NFT API error: ${response.statusText}`);
    }
    const data = await response.json();
    if (!data.ownedNfts) return [];

    // Map the owned NFTs to a consistent object structure.
    return data.ownedNfts.map((nft: any) => ({
      uniqueId: crypto.randomUUID(),
      contractAddress: nft.contract?.address || "unknown",
      tokenId: nft.tokenId,
      name: nft.name || "Unknown NFT",
      logo: nft.image?.cachedUrl || nft.image?.thumbnailUrl || null,
      balance: nft.balance,
      tokenType: nft.tokenType,
    }));
  } catch (error) {
    console.error("Error fetching NFTs:", error);
    return [];
  }
};
