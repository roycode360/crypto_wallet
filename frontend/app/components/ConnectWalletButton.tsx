"use client";

import Image from "next/image";
import useWallet from "../hooks/useWallet";
import { PiSpinnerGapBold } from "react-icons/pi";
import classNames from "classnames";

export default function ConnectWalletButton() {
  const { connectWallet, isLoading } = useWallet();

  return (
    <div>
      <button
        disabled={isLoading}
        className={classNames(
          { "cursor-not-allowed": isLoading },
          "bg-[#9431c9] text-white px-4 py-3 rounded-md flex relative"
        )}
        onClick={connectWallet}
      >
        <span>Connect Wallet</span>
        <Image
          src="/images/metamask.png"
          alt="Profile picture"
          width={25}
          height={25}
          className="rounded-full ml-2"
        />
        <PiSpinnerGapBold
          className={classNames(
            {
              block: isLoading,
              hidden: !isLoading,
            },
            "absolute z-10 text-gray-400 text-[34px] animate-spin font-bold mx-auto inset-0 mt-2"
          )}
        />
      </button>
    </div>
  );
}
