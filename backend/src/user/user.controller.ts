import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  BadRequestException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { WalletService } from 'src/wallet/wallet.service';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly walletService: WalletService,
  ) {}

  /**
   * Creates a new user.
   * @param createUserDto - The user creation DTO.
   */
  @Post()
  async createUser(@Body() createUserDto: CreateUserDto) {
    return await this.userService.createUser(createUserDto);
  }

  /**
   * Retrieves a user by ID.
   * @param id - The user ID.
   */
  @Get(':id')
  async getUser(@Param('id') id: string) {
    const userId = parseInt(id, 10);
    if (isNaN(userId)) {
      throw new BadRequestException('Invalid user ID');
    }
    return await this.userService.getUser(userId);
  }

  /**
   * Generates a nonce-based challenge for username change.
   * @param walletAddress - The Ethereum wallet address.
   */
  @Post('username-change-challenge')
  async getUsernameChangeChallenge(
    @Body('walletAddress') walletAddress: string,
  ) {
    if (!walletAddress) {
      throw new BadRequestException('Wallet address is required');
    }

    const nonce = crypto.randomUUID(); // More secure nonce generation
    await this.walletService.saveUsernameChallenge(walletAddress, nonce);

    return {
      challenge: `Sign this message to change your username. Nonce: ${nonce}`,
    };
  }

  /**
   * Changes a user's username after verifying the signature.
   */
  @Post('change-username')
  async changeUsername(
    @Body()
    body: {
      walletAddress: string;
      newUsername: string;
      signature: string;
    },
  ) {
    const { walletAddress, newUsername, signature } = body;
    if (!walletAddress || !newUsername || !signature) {
      throw new BadRequestException('Missing required fields');
    }

    return await this.userService.changeUsernameWithChallenge(
      walletAddress,
      newUsername,
      signature,
    );
  }

  /**
   * Handles NFT transfer requests.
   */
  @Post('send-nft-request')
  async sendNftRequest(
    @Body()
    body: {
      contractAddress: string;
      tokenId: string;
      username: string;
      fromAddress: string;
    },
  ) {
    const { contractAddress, fromAddress, tokenId, username } = body;
    if (!contractAddress || !fromAddress || !tokenId || !username) {
      throw new BadRequestException('Missing required fields');
    }

    return await this.walletService.prepareNftTransfer({
      contractAddress,
      fromAddress,
      tokenId,
      username,
    });
  }
}
