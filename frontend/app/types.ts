export type TToken = {
  balance: number;
  contractAddress: string;
  name: string;
  symbol: string;
  logo: string;
};

export type TNFT = {
  uniqueId: string;
  contractAddress: string;
  logo: string;
  name: string;
  tokenId: string;
  balance: string;
  tokenType: "ERC721" | "ERC1155";
};

export type TUser = {
  id: number;
  username: string;
  walletAddress: string;
};

export interface SendNftParams {
  contractAddress: string;
  fromAddress: string;
  tokenId: string;
  username: string;
  amount: number;
  tokenType: "ERC721" | "ERC1155";
}
