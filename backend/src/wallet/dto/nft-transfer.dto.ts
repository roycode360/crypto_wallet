export interface NftTransferDto {
  contractAddress: string;
  fromAddress: string;
  tokenId: string;
  username: string;
  amount?: number;
  tokenType?: 'ERC721' | 'ERC1155';
}
