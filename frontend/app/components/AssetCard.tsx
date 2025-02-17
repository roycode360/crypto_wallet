import { ReactElement } from "react";
import { TNFT, TToken } from "../types";
import Image from "next/image";

type Prop = {
  asset: TToken | TNFT;
};

export const AssetCard = ({ asset }: Prop): ReactElement => {
  return (
    <div className="bg-[#1c242b] px-4 py-3 flex items-center rounded-xl">
      <div className="mr-3">
        <Image
          src={asset.logo || "/images/warning.avif"}
          alt="Profile picture"
          width={40}
          height={40}
          className="w-8 rounded-full"
        />
      </div>
      <div className="flex items-center justify-between w-full">
        <div>
          <p className="text-white">{asset.name}</p>
          <p className="text-sm text-brand-white">
            {(asset as TToken).symbol ?? (asset as TNFT).tokenType}
          </p>
        </div>
        <div>
          <p className="text-brand-btn-green">{asset.balance}</p>
        </div>
      </div>
    </div>
  );
};
