"use client";

import useWallet from "../hooks/useWallet";

export default function ConnectWalletButton() {
  const { connectWallet } = useWallet();

  return (
    <div>
      <button
        className="bg-[#9431c9] text-white px-4 py-3 rounded-md"
        onClick={connectWallet}
      >
        Connect Wallet
      </button>
    </div>
  );
}
