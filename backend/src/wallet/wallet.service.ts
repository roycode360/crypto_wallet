// Description: WalletService handles username challenge management and prepares NFT transfer transactions.
// This service uses TypeORM for database interactions and ethers.js for blockchain transaction preparation.

import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Challenge } from './challenge.schema';
import { User } from 'src/user/user.schema';
import { Interface, JsonRpcProvider } from 'ethers';
import { NftTransferDto } from './dto/nft-transfer.dto';
import { AppConfigService } from 'src/config/config.service';

@Injectable()
export class WalletService {
  // TTL (time-to-live) for a username challenge in milliseconds (300000 ms = 5 minutes)
  private readonly ttl = 300000;

  // Inject the Challenge and User repositories using TypeORM.
  constructor(
    @InjectRepository(Challenge)
    private readonly challengeRepository: Repository<Challenge>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    // Inject the configuration service
    private readonly appConfig: AppConfigService,
  ) {}

  /**
   * Saves or updates a username challenge for a given wallet.
   *
   * @param walletAddress - The user's wallet address.
   * @param nonce - The challenge nonce to be saved.
   */
  async saveUsernameChallenge(
    walletAddress: string,
    nonce: string,
  ): Promise<void> {
    try {
      // Calculate the expiration time for the challenge.
      const expiresAt = new Date(Date.now() + this.ttl);

      // Try to find an existing challenge for the given wallet address.
      let challenge = await this.challengeRepository.findOne({
        where: { walletAddress },
      });

      if (challenge) {
        // Update the nonce and expiration if a challenge already exists.
        challenge.nonce = nonce;
        challenge.expiresAt = expiresAt;
      } else {
        // Otherwise, create a new challenge record.
        challenge = this.challengeRepository.create({
          walletAddress,
          nonce,
          expiresAt,
        });
      }

      // Save the challenge record to the database.
      await this.challengeRepository.save(challenge);
    } catch (error) {
      throw new InternalServerErrorException(
        error?.message ?? 'Something went wrong. Please try again.',
      );
    }
  }

  /**
   * Retrieves a valid username challenge for a given wallet address.
   * If the challenge has expired, it is cleared.
   *
   * @param walletAddress - The user's wallet address.
   * @returns The nonce (challenge string) or null if not found/expired.
   */
  async getUsernameChallenge(walletAddress: string): Promise<string | null> {
    try {
      const challenge = await this.challengeRepository.findOne({
        where: { walletAddress },
      });
      if (!challenge) return null;

      // Check if the challenge has expired.
      if (challenge.expiresAt.getTime() < Date.now()) {
        // Delete expired challenge and return null.
        await this.challengeRepository.delete({ walletAddress });
        return null;
      }
      return challenge.nonce;
    } catch (error) {
      throw new InternalServerErrorException(
        error?.message ?? 'Something went wrong. Please try again.',
      );
    }
  }

  /**
   * Clears the username challenge for the given wallet address.
   *
   * @param walletAddress - The user's wallet address.
   */
  async clearUsernameChallenge(walletAddress: string): Promise<void> {
    try {
      await this.challengeRepository.delete({ walletAddress });
    } catch (error) {
      throw new InternalServerErrorException(
        error?.message ?? 'Something went wrong. Please try again.',
      );
    }
  }

  /**
   * Prepares an unsigned NFT transfer transaction.
   * For ERC721 tokens, it encodes a call to safeTransferFrom(from, to, tokenId).
   * For ERC1155 tokens, it encodes a call to safeTransferFrom(from, to, tokenId, amount, data).
   *
   * @param nftTransferDto - Data Transfer Object containing NFT transfer details.
   * @returns An unsigned transaction request with chainId as a string for serialization.
   */
  async prepareNftTransfer(nftTransferDto: NftTransferDto): Promise<any> {
    // Initialize a JsonRpcProvider using the Polygon RPC URL from environment variables.
    const provider = new JsonRpcProvider(this.appConfig.polygonRpcUrl);

    // Define the ABI for both ERC721 and ERC1155 safeTransferFrom methods.
    const abi = [
      'function safeTransferFrom(address from, address to, uint256 tokenId) external',
      'function safeTransferFrom(address from, address to, uint256 id, uint256 amount, bytes data) external',
    ];

    try {
      // Retrieve the user by username to get their wallet address.
      const user = await this.userRepository.findOneBy({
        username: nftTransferDto.username,
      });
      if (!user) {
        throw new Error('User not found!');
      }

      // if user inputs their username, throw error
      if (user.walletAddress === nftTransferDto.fromAddress) {
        throw new Error('Can not send NFT to your username!');
      }

      // Create an Interface instance from the ABI.
      const iface = new Interface(abi);

      let data: string;
      // Determine which function signature to use based on the token type.
      if (nftTransferDto.tokenType === 'ERC1155') {
        data = iface.encodeFunctionData(
          'safeTransferFrom(address,address,uint256,uint256,bytes)',
          [
            nftTransferDto.fromAddress,
            user.walletAddress,
            nftTransferDto.tokenId,
            nftTransferDto.amount,
            '0x',
          ],
        );
      } else {
        data = iface.encodeFunctionData(
          'safeTransferFrom(address,address,uint256)',
          [
            nftTransferDto.fromAddress,
            user.walletAddress,
            nftTransferDto.tokenId,
          ],
        );
      }

      // Retrieve the chain ID from the provider (e.g., Polygon Mainnet's chain ID is 137).
      const chainId = await provider.getNetwork().then((net) => net.chainId);

      // Build the unsigned transaction object.
      const txRequest = {
        to: nftTransferDto.contractAddress,
        data,
        chainId,
      };

      // Create a new object with chainId as a string for JSON serialization.
      const preparedTx = {
        to: txRequest.to,
        data: txRequest.data,
        chainId: txRequest.chainId.toString(),
      };

      // Here we return the prepared transaction object to be signed by the client.
      return preparedTx;
    } catch (error: any) {
      throw new InternalServerErrorException(
        error?.message ?? 'Something went wrong. Please try again.',
      );
    }
  }
}
