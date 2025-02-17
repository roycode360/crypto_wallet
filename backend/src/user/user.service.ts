import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { verifyMessage } from 'ethers';

import { CreateUserDto } from './dto/create-user.dto';
import { User } from './user.schema';
import { WalletService } from 'src/wallet/wallet.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly walletService: WalletService,
  ) {}

  /**
   * Creates a new user if the wallet address does not already exist, else returns existing user.
   * @param createUserDto - Contains the wallet address.
   * @returns The created user or the existing user.
   */
  async createUser(createUserDto: CreateUserDto): Promise<User> {
    try {
      const { walletAddress } = createUserDto;

      // Check if the user already exists
      const existingUser = await this.userRepository.findOneBy({
        walletAddress,
      });
      if (existingUser) return existingUser;

      // Create a new user
      const newUser = this.userRepository.create({ walletAddress });
      return await this.userRepository.save(newUser);
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException('Username is already taken');
      }
      throw new InternalServerErrorException('Failed to create user.');
    }
  }

  /**
   * Retrieves a user by ID.
   * @param id - The user ID.
   * @returns The user if found, otherwise throws an error.
   */
  async getUser(id: number): Promise<User> {
    const user = await this.userRepository.findOneBy({ id });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  /**
   * Changes the username using a signed message for authentication.
   * @param walletAddress - The user's wallet address.
   * @param newUsername - The new username to set.
   * @param signature - The cryptographic signature verifying the request.
   * @returns The updated user.
   */
  async changeUsernameWithChallenge(
    walletAddress: string,
    newUsername: string,
    signature: string,
  ): Promise<User> {
    try {
      // Retrieve the challenge associated with the wallet
      const expectedNonce =
        await this.walletService.getUsernameChallenge(walletAddress);
      if (!expectedNonce) {
        throw new NotFoundException('No challenge found for this wallet');
      }

      // Construct the expected message
      const expectedMessage = `Sign this message to change your username. Nonce: ${expectedNonce}`;

      // Recover wallet address from the signature
      const recoveredAddress = verifyMessage(expectedMessage, signature);

      // Ensure the recovered address matches the provided wallet address
      if (recoveredAddress.toLowerCase() !== walletAddress.toLowerCase()) {
        throw new UnauthorizedException('Invalid signature!');
      }

      // Retrieve the user from the database
      const user = await this.userRepository.findOne({
        where: { walletAddress },
      });
      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Update and save the new username
      user.username = newUsername;
      const updatedUser = await this.userRepository.save(user);

      // Clear the used challenge to prevent replay attacks
      await this.walletService.clearUsernameChallenge(walletAddress);

      return updatedUser;
    } catch (error: any) {
      if (
        error instanceof UnauthorizedException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }

      if (error.code === '23505') {
        throw new ConflictException('Username is already taken');
      }
      throw new InternalServerErrorException('Failed to update username.');
    }
  }
}
