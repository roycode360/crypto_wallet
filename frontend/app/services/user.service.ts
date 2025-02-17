// Description: This service handles user-related API requests including user creation, changing username,
// and preparing an NFT send request. We also include a helper function to sign a username challenge using MetaMask.

import { BrowserProvider } from "ethers";
import toast from "react-hot-toast";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * Creates a new user.
 *
 * @param walletAddress - The wallet address of the user.
 * @returns The created user data or undefined if an error occurred.
 */
export const createUser = async (walletAddress: string): Promise<any> => {
  try {
    const response = await fetch(`${API_BASE_URL}/user`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ walletAddress }),
    });

    if (!response.ok) {
      // Throw an error if the response status is not OK.
      throw new Error(`Error: ${response.status} - ${response.statusText}`);
    }

    // Parse and return the JSON response.
    const user = await response.json();
    return user;
  } catch (error) {
    const err = error as Error;
    // Notify the user about the error.
    toast.error(err.message || "An unexpected error occurred");
    // Return undefined so the caller can handle the error accordingly.
    return undefined;
  }
};

/**
 * Requests a challenge for changing the username.
 *
 * @param walletAddress - The wallet address of the user.
 * @returns The challenge string or undefined if an error occurred.
 */
export const changeUserNameRequest = async (
  walletAddress: string
): Promise<string | undefined> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/user/username-change-challenge`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ walletAddress }),
      }
    );

    if (!response.ok) {
      throw new Error(`Error: ${response.status} - ${response.statusText}`);
    }

    // Destructure the challenge from the response.
    const { challenge } = await response.json();
    return challenge;
  } catch (error) {
    const err = error as Error;
    toast.error(err.message || "An unexpected error occurred");
    return undefined;
  }
};

/**
 * Signs a given challenge using MetaMask.
 *
 * @param challenge - The challenge string to be signed.
 * @returns The signature or undefined if an error occurred.
 */
async function signUsernameChallenge(
  challenge: string
): Promise<string | undefined> {
  try {
    // Ensure that Ethereum provider is available.
    if (!window.ethereum) {
      throw new Error("No Ethereum provider found");
    }

    // Create a BrowserProvider instance and obtain the signer.
    const provider = new BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    // Sign the challenge and return the signature.
    const signature = await signer.signMessage(challenge);
    return signature;
  } catch (error) {
    const err = error as Error;
    toast.error(err.message || "An unexpected error occurred");
    return undefined;
  }
}

/**
 * Changes the user's username by signing a challenge.
 *
 * @param walletAddress - The wallet address of the user.
 * @param newUsername - The new username to be set.
 * @returns The updated user data or undefined if an error occurred.
 */
export async function changeUsername(
  walletAddress: string,
  newUsername: string
): Promise<any> {
  try {
    // Request a challenge from the backend.
    const challenge = await changeUserNameRequest(walletAddress);
    if (!challenge) throw new Error("Failed to fetch challenge");

    // Sign the challenge using the user's Ethereum provider.
    const signature = await signUsernameChallenge(challenge);
    if (!signature) throw new Error("Signature failed");

    // Send the signed challenge along with the new username to the backend.
    const response = await fetch(`${API_BASE_URL}/user/change-username`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        walletAddress,
        newUsername,
        signature,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to change username");
    }

    const data = await response.json();
    toast.success("Username changed successfully!");
    return data;
  } catch (error) {
    const err = error as Error;
    toast.error(err.message || "An unexpected error occurred");
    return undefined;
  }
}

/**
 * Sends an NFT transfer request to the backend.
 *
 * @param params - The parameters for sending an NFT.
 * @returns The prepared transaction request object to be signed by metamask or undefined if an error occurred.
 */
export const sendNFTRequest = async ({
  contractAddress,
  tokenId,
  username,
  fromAddress,
  amount,
  tokenType,
}: {
  contractAddress: string;
  tokenId: string;
  username: string;
  fromAddress: string;
  amount?: number;
  tokenType: "ERC721" | "ERC1155";
}): Promise<any> => {
  try {
    // Call the backend API to prepare the NFT transfer transaction.
    const response = await fetch(`${API_BASE_URL}/user/send-nft-request`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contractAddress,
        fromAddress,
        username,
        tokenId,
        amount,
        tokenType,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message);
    }

    // Parse and return the prepared transaction request.
    const txRequest = await response.json();
    return txRequest;
  } catch (error: any) {
    toast.error(error?.message);
    return undefined;
  }
};
