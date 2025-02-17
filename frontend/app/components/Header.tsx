"use client";

import { ReactElement, useState } from "react";
import { MdOutlineContentCopy } from "react-icons/md";
import { useWalletContext } from "../context/WalletContext";
import { shortenPublicKey } from "../utils";
import Image from "next/image";
import { CiEdit } from "react-icons/ci";
import { FaCheck } from "react-icons/fa6";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { changeUsername } from "../services/user.service";
import { PiSpinnerGapBold } from "react-icons/pi";
import { IoMdClose } from "react-icons/io";

export const Header = (): ReactElement => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [newUsername, setNewUsername] = useState<string>("");

  const { disconnectWallet, walletAddress, isCheckingWallet, user } =
    useWalletContext();

  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationKey: ["change-suername"],
    mutationFn: () => changeUsername(walletAddress ?? "", newUsername),
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: ["create-user"] });
      setNewUsername("");
      setIsEditing(false);
    },
  });

  const showSkelecton = isCheckingWallet ? "block" : "hidden";
  const showContent = isCheckingWallet ? "hidden" : "block";

  return (
    <div className="flex items-center justify-between px-4 py-6 sticky top-0 bg-[#121c1f]">
      <div className="flex flex-col xl:flex-row xl:items-center w-full justify-between flex-[1.2] xl:gap-0 gap-3">
        <div className="flex items-center gap-4">
          <>
            <Image
              src="/images/matic-logo.webp"
              alt="Profile picture"
              width={40}
              height={40}
              className={`${showContent} rounded-full`}
            />
            <div
              className={`${showSkelecton} h-[40px] w-[40px] bg-gray-600 rounded-full animate-pulse`}
            ></div>
          </>
          <p
            className={`${showSkelecton} animate-pulse space-x-4 h-4 w-[95px] bg-slate-600 rounded-md`}
          ></p>
          <p className={`text-brand-white ${showContent}`}>
            {shortenPublicKey(walletAddress)}
          </p>
          <div className="flex items-center justify-center w-5 h-5 rounded-md bg-[#1f2a2c]">
            <MdOutlineContentCopy className={`${showContent} text-gray-400`} />
            <p
              className={`${showSkelecton} animate-pulse space-x-4 w-full h-full bg-slate-600 rounded-md`}
            ></p>
          </div>
        </div>
        <div className="">
          <p
            className={`${showSkelecton} animate-pulse space-x-4 h-4 w-[195px] bg-slate-600 rounded-sm`}
          ></p>
          <div className={`${showContent} flex items-end gap-3`}>
            <p
              className={`${
                isEditing ? "hidden" : "block"
              } text-white capitalize`}
            >
              Username:{" "}
              {user?.username || (
                <span className="ml-2 text-gray-500">Add Username</span>
              )}
            </p>
            <input
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              className={`${
                isEditing ? "block" : "hidden"
              } bg-transparent outline-none border-b-[1px] border-white`}
            />
            <CiEdit
              onClick={() => setIsEditing(true)}
              className={`text-gray-400 text-[24px] cursor-pointer ${
                isEditing || isPending ? "hidden" : "block"
              }`}
            />
            <>
              <FaCheck
                onClick={() => {
                  if (newUsername) {
                    mutate();
                  }
                }}
                className={`text-gray-400 text-[24px] cursor-pointer ${
                  isEditing && !isPending ? "block" : "hidden"
                }`}
              />
              <IoMdClose
                onClick={() => setIsEditing(false)}
                className={`text-gray-400 text-[24px] cursor-pointer ${
                  isEditing && !isPending ? "block" : "hidden"
                }`}
              />
            </>
            <PiSpinnerGapBold
              className={`text-gray-400 text-[24px] cursor-pointer ${
                isPending ? "block animate-spin" : "hidden"
              }`}
            />
          </div>
        </div>
      </div>
      <div className="w-full flex items-center justify-end flex-1">
        <button
          className="px-4 rounded-lg text-brand-white bg-[#9431c9] py-1"
          onClick={() => {
            disconnectWallet();
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
};
