"use client";

import { useWalletContext } from "../context/WalletContext";

const useWallet = () => {
  const {
    walletAddress,
    setWalletAddress,
    isLoading,
    connectWallet,
    disconnectWallet,
  } = useWalletContext();

  return {
    walletAddress,
    setWalletAddress,
    connectWallet,
    disconnectWallet,
    isLoading,
  };
};

export default useWallet;
