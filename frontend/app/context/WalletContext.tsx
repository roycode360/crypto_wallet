"use client";

import { useRouter } from "next/navigation";
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { ROUTES } from "../routes";
import toast from "react-hot-toast";
import { TUser } from "../types";
import { useQuery } from "@tanstack/react-query";
import { createUser } from "../services/user.service";

interface WalletContextProps {
  walletAddress: string | null;
  setWalletAddress: (address: string | null) => void;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => Promise<void>;
  isLoading: boolean;
  isCheckingWallet: boolean;
  user: TUser | undefined;
}

const WalletContext = createContext<WalletContextProps | undefined>(undefined);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isCheckingWallet, setIsCheckingWallet] = useState<boolean>(true);

  const router = useRouter();
  const routerRef = useRef(router);

  const { data: user } = useQuery({
    queryKey: ["create-user", walletAddress],
    queryFn: async () => createUser(walletAddress ?? ""),
    enabled: !!walletAddress,
  });

  useEffect(() => {
    const checkWallet = async () => {
      if (typeof window === "undefined" || !window.ethereum) {
        routerRef.current.push(ROUTES.BASE);
        return;
      }

      try {
        setIsCheckingWallet(true);
        const accounts: string[] = await window.ethereum.request({
          method: "eth_accounts",
        });

        setIsCheckingWallet(false);
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
        } else {
          routerRef.current.push(ROUTES.BASE);
        }
      } catch {
        toast.error("Error checking wallet");
        routerRef.current.push(ROUTES.BASE);
      }
    };

    checkWallet();
  }, []);

  const connectWallet = async () => {
    setIsLoading(true);
    if (typeof window !== "undefined" && window.ethereum) {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        setWalletAddress(accounts[0]);
        router.push(ROUTES.DASHBOARD);
      } catch {
        toast.error("Wallet connection failed");
      }
    } else {
      toast.error("Please install MetaMask");
    }
    setIsLoading(false);
  };

  const disconnectWallet = async () => {
    router.push(ROUTES.BASE);
    setIsLoading(true);
    setWalletAddress(null);
    setIsLoading(false);
  };

  return (
    <WalletContext.Provider
      value={{
        walletAddress,
        setWalletAddress,
        connectWallet,
        disconnectWallet,
        isLoading,
        isCheckingWallet,
        user,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWalletContext = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWalletContext must be used within a WalletProvider");
  }
  return context;
};
