// This is the main Dashboard component where users can view their tokens/NFTs,
// select an NFT, and send it to another user.
"use client";

import { JSX, useState } from "react";
import classNames from "classnames";
import { PiSpinnerGapBold } from "react-icons/pi";

// Import custom components and hooks
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { AssetCard } from "../components/AssetCard";
import { SelectComp } from "../components/atoms/SelectComp";
import { useWalletContext } from "../context/WalletContext";
import { useDashboardData } from "../hooks/useDashboardData";
import { TNFT, TToken } from "../types";

// Import theme constants
import { THEME_COLORS } from "../constants/theme";

// Main Dashboard Component
export default function Dashboard(): JSX.Element {
  // Get wallet data from context
  const { walletAddress, isCheckingWallet } = useWalletContext();

  // Use custom hook for data and mutation logic
  const {
    nativeBalanceQuery,
    tokenBalancesQuery,
    nftBalancesQuery,
    sendNftMutation,
  } = useDashboardData(walletAddress);

  // Local state management for current tab, NFT selection, receiver username, NFT amount, and sending status.
  const [currentTab, setCurrentTab] = useState<"tokens" | "nfts">("tokens");
  const [selectedNft, setSelectedNft] = useState<TNFT | "">("");
  const [receiverUsername, setReceiverUsername] = useState("");
  const [nftAmount, setNftAmount] = useState("1");

  // Derived data from queries
  const nativeBalance = nativeBalanceQuery.data;
  const erc20Tokens = tokenBalancesQuery.data;
  const nftsTokens = nftBalancesQuery.data;

  // Combined loading state
  const isLoading =
    tokenBalancesQuery.isFetching ||
    nftBalancesQuery.isFetching ||
    isCheckingWallet ||
    nativeBalanceQuery.isFetching;

  // Show skeleton loader if necessary
  const showSkeleton =
    (isCheckingWallet || isLoading) && !nativeBalance ? "block" : "hidden";
  const showContent =
    (isCheckingWallet || isLoading) && !nativeBalance ? "hidden" : "block";

  // Decide which asset list to display based on the current tab.
  const assetList = currentTab === "nfts" ? nftsTokens : erc20Tokens;

  // CSS class for current tab highlight.
  const currentTabClass = "border-[#9431c9]";

  return (
    <div>
      <Header />
      <div className="w-full px-4 py-6">
        {/* Native Balance Section */}
        <div
          className="px-4 py-6 text-white rounded-lg"
          style={{ backgroundColor: THEME_COLORS.background }}
        >
          <p className="text-[16px]">Total</p>
          <div className="flex items-center justify-between">
            <div className="mt-2">
              <div className={showContent}>
                <span className="text-[30px] text-brand-white">
                  {nativeBalance ? parseFloat(nativeBalance).toFixed(5) : ""}
                </span>
                <span className="ml-1 text-white">MATIC</span>
              </div>
              <p
                className={`${showSkeleton} animate-pulse space-x-4 h-10 w-[130px] bg-slate-600 rounded-md`}
              />
            </div>
            <div>
              <i className="fa-solid fa-arrow-trend-up text-brand-btn-green" />
            </div>
          </div>
        </div>

        {/* Controls Section: NFT Selector, Receiver Username, NFT Amount, Send NFT Button */}
        <div className="flex items-center justify-between gap-3 my-6 flex-wrap xl:flex-nowrap">
          <SelectComp
            nftList={nftsTokens}
            selectedNft={selectedNft}
            setSelectedNft={setSelectedNft}
          />
          <input
            type="text"
            placeholder="Recipient username"
            className="flex-1 bg-[#293436] text-white placeholder:text-gray-400 focus:border-none outline-none py-[14px] px-3 rounded-md"
            onChange={(e) => setReceiverUsername(e.target.value)}
          />
          <input
            type="number"
            value={nftAmount}
            onChange={(e) => setNftAmount(e.target.value)}
            max={selectedNft ? selectedNft.balance : 1}
            min={1}
            placeholder="Amount"
            className="xl:w-[118px] w-full bg-[#293436] border-none focus:border-none outline-none py-[14px] rounded-md text-white px-3"
          />
          <button
            disabled={sendNftMutation.isPending}
            onClick={() => {
              // Validate that an NFT is selected, receiver username is provided, and the amount is within balance.
              if (
                selectedNft &&
                receiverUsername &&
                +selectedNft.balance >= +nftAmount
              ) {
                sendNftMutation.mutate({
                  contractAddress: (selectedNft as TNFT).contractAddress,
                  fromAddress: walletAddress || "",
                  tokenId: (selectedNft as TNFT).tokenId,
                  username: receiverUsername,
                  amount: +nftAmount,
                  tokenType: (selectedNft as TNFT).tokenType,
                });
              }
            }}
            className={classNames(
              {
                "cursor-not-allowed": sendNftMutation.isPending,
                "cursor-pointer": !sendNftMutation.isPending,
              },
              "bg-[#9431c9] active:opacity-50 px-4 gap-3 xl:w-[100px] py-4 rounded-lg text-[14px] flex items-center relative w-full text-center"
            )}
          >
            <p className="block w-full text-center">Send NFT</p>
            <PiSpinnerGapBold
              className={classNames(
                {
                  block: sendNftMutation.isPending,
                  hidden: !sendNftMutation.isPending,
                },
                "absolute z-10 text-gray-400 text-[34px] animate-spin inset-0 m-auto font-bold"
              )}
            />
          </button>
        </div>

        {/* Tab Navigation Section */}
        <div className="flex items-center xl:gap-10 gap-3 py-7">
          <div
            className={classNames(
              "bg-transparent border-[2px] border-[#293436] flex-1 text-center py-2 rounded-2xl cursor-pointer transition-all",
              { [currentTabClass]: currentTab === "tokens" }
            )}
            onClick={() => setCurrentTab("tokens")}
          >
            Tokens
          </div>
          <div
            className={classNames(
              "bg-transparent border-[2px] border-[#293436] flex-1 py-2 rounded-2xl text-center cursor-pointer transition-all",
              { [currentTabClass]: currentTab === "nfts" }
            )}
            onClick={() => setCurrentTab("nfts")}
          >
            NFTs
          </div>
        </div>

        {/* Assets Display Section */}
        <div>
          <p className="py-6 text-lg text-center text-white">My assets</p>
          <div className="flex flex-col gap-3 mb-20">
            {isLoading && !assetList
              ? Array(4)
                  .fill(0)
                  .map((_, index) => (
                    <div
                      key={index}
                      className="bg-[#1c242b] px-4 py-8 w-full flex items-center rounded-xl animate-pulse"
                    />
                  ))
              : assetList?.map((asset: TToken | TNFT, ind: number) => (
                  <AssetCard key={ind} asset={asset} />
                ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
