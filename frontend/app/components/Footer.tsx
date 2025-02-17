"use client";

import { ReactElement } from "react";
import { CiSettings } from "react-icons/ci";
import { PiHandWithdrawThin, PiWalletThin } from "react-icons/pi";

export const Footer = (): ReactElement => {
  return (
    <div className="bottom-0 flex items-center justify-between w-full px-8 py-6 bg-[#293436] fixed">
      <div className="">
        <PiWalletThin size={32} className="text-[#9431c9]" />
      </div>
      <div className="">
        <PiHandWithdrawThin size={32} className="text-[#9431c9]" />
      </div>
      <div className="">
        <CiSettings size={32} className="text-[#9431c9]" />
      </div>
    </div>
  );
};
