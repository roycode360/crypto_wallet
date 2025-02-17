import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './user.schema';
import { WalletService } from '../wallet/wallet.service';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { verifyMessage } from 'ethers';

jest.mock('ethers');

const mockUserRepository = () => ({
  findOneBy: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn().mockImplementation((entity) => entity),
  save: jest.fn(),
});

const mockWalletService = () => ({
  getUsernameChallenge: jest.fn(),
  clearUsernameChallenge: jest.fn(),
});

describe('UserService', () => {
  let userService: UserService;
  let userRepository: Repository<User>;
  let walletService: WalletService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: getRepositoryToken(User), useFactory: mockUserRepository },
        { provide: WalletService, useFactory: mockWalletService },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    walletService = module.get<WalletService>(WalletService);
  });

  it('should create a new user', async () => {
    const createUserDto = { walletAddress: '0x123' };
    const mockUser = { id: 1, walletAddress: '0x123' };

    // Cast repository methods to jest.Mock for proper typing.
    (userRepository.findOneBy as jest.Mock).mockResolvedValue(null);
    (userRepository.create as jest.Mock).mockImplementation((entity) => entity);
    (userRepository.save as jest.Mock).mockResolvedValue(mockUser);

    const result = await userService.createUser(createUserDto);
    expect(result).toEqual(mockUser);
  });

  it('should return existing user if found', async () => {
    const existingUser = { id: 1, walletAddress: '0x123' };
    (userRepository.findOneBy as jest.Mock).mockResolvedValue(existingUser);

    const result = await userService.createUser({ walletAddress: '0x123' });
    expect(result).toEqual(existingUser);
  });

  it('should throw NotFoundException if user not found', async () => {
    (userRepository.findOneBy as jest.Mock).mockResolvedValue(null);

    await expect(userService.getUser(1)).rejects.toThrow(NotFoundException);
  });

  it('should change username if challenge is valid', async () => {
    const user = { id: 1, walletAddress: '0x123', username: 'oldName' };
    const newUsername = 'newName';
    const signature = 'valid-signature';

    // Setup mocks for challenge and verifyMessage
    (walletService.getUsernameChallenge as jest.Mock).mockResolvedValue(
      '123456',
    );
    (userRepository.findOne as jest.Mock).mockResolvedValue(user);
    // Override verifyMessage to return the correct address.
    (verifyMessage as jest.Mock).mockReturnValue('0x123');
    (userRepository.save as jest.Mock).mockResolvedValue({
      ...user,
      username: newUsername,
    });

    const result = await userService.changeUsernameWithChallenge(
      '0x123',
      newUsername,
      signature,
    );
    expect(result.username).toBe(newUsername);
  });

  it('should throw UnauthorizedException for invalid signature', async () => {
    (walletService.getUsernameChallenge as jest.Mock).mockResolvedValue(
      '123456',
    );
    (verifyMessage as jest.Mock).mockReturnValue('0xabc');

    await expect(
      userService.changeUsernameWithChallenge('0x123', 'newName', 'bad-sign'),
    ).rejects.toThrow(UnauthorizedException);
  });
});
