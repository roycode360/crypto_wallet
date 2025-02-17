// This custom hook encapsulates all queries and mutations used on the dashboard,
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  fetchNativeBalance,
  fetchNFTBalances,
  fetchTokenBalances,
} from "../utils/alchemy";
import { sendNFTRequest } from "../services/user.service";
import { BrowserProvider } from "ethers";
import toast from "react-hot-toast";
import { SendNftParams } from "../types";

export const useDashboardData = (walletAddress: string | null) => {
  // Query for native MATIC balance
  const nativeBalanceQuery = useQuery({
    queryKey: ["get-native-balance"],
    queryFn: () => fetchNativeBalance(walletAddress ?? ""),
    enabled: !!walletAddress,
  });

  // Query for ERC20 token balances
  const tokenBalancesQuery = useQuery({
    queryKey: ["get-token-balances"],
    queryFn: () => fetchTokenBalances(walletAddress ?? ""),
    enabled: !!walletAddress,
  });

  // Query for NFT balances
  const nftBalancesQuery = useQuery({
    queryKey: ["get-nft-balances"],
    queryFn: () => fetchNFTBalances(walletAddress ?? ""),
    enabled: !!walletAddress,
  });

  // Mutation for sending NFT transaction
  const sendNftMutation = useMutation({
    mutationKey: ["send-nft"],
    mutationFn: (params: SendNftParams) => sendNFTRequest(params),
    onSuccess: async (txRequest) => {
      if (txRequest) {
        try {
          // Here we get the provider from MetaMask and then the signer for sending transactions.
          const provider = new BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();
          const txResponse = await signer.sendTransaction(txRequest);
          await txResponse.wait();
          toast.success("NFT successfully sent!");
          nftBalancesQuery.refetch();
        } catch {
          toast.error("Something went wrong: Metamask error");
        }
      }
    },
  });

  return {
    nativeBalanceQuery,
    tokenBalancesQuery,
    nftBalancesQuery,
    sendNftMutation,
  };
};
