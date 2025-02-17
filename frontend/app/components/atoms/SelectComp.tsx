import { TNFT } from "@/app/types";
import { Dispatch, ReactElement, SetStateAction } from "react";

type Props = {
  nftList: TNFT[] | undefined;
  selectedNft: TNFT | "";
  setSelectedNft: Dispatch<SetStateAction<TNFT | "">>;
};

export const SelectComp = ({
  nftList,
  selectedNft,
  setSelectedNft,
}: Props): ReactElement => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedNFT = e.target.value;
    const selected = nftList?.find((nft) => nft.uniqueId === selectedNFT);
    if (selected) {
      setSelectedNft(selected);
    } else {
      setSelectedNft("");
    }
  };

  return (
    <div className="relative inline-block flex-1 w-[100%]">
      <select
        value={selectedNft ? selectedNft?.uniqueId : ""}
        onChange={handleChange}
        className="block appearance-none w-full bg-[#293436] border border-gray-300 text-white py-4 px-4 pr-8 rounded leading-tight focus:outline-none focus:border-none border-none"
      >
        <option value="" disabled>
          Select NFT
        </option>
        {nftList?.map((nft) => (
          <option key={nft.uniqueId} value={nft.uniqueId}>
            {nft.name}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
        <svg
          className="fill-current h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
        >
          <path d="M5.293 7.293L10 12l4.707-4.707-1.414-1.414L10 9.172 6.707 5.879 5.293 7.293z" />
        </svg>
      </div>
    </div>
  );
};
