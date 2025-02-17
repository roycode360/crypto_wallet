// File: src/wallet/wallet.service.spec.ts
// This file contains unit tests for the WalletService.
// We mock the dependencies, including the ChallengeRepository, UserRepository, and AppConfigService,
// so that the service can be tested in isolation.

import { Test, TestingModule } from '@nestjs/testing';
import { WalletService } from './wallet.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Challenge } from './challenge.schema';
import { User } from 'src/user/user.schema';
import { AppConfigService } from 'src/config/config.service';

// Create a mock for the Challenge repository
const mockChallengeRepository = () => ({
  findOne: jest.fn(),
  create: jest.fn().mockImplementation((entity) => entity),
  save: jest.fn(),
  delete: jest.fn(),
});

// Create a mock for the User repository
const mockUserRepository = () => ({
  findOneBy: jest.fn(),
});

// Create a mock for the AppConfigService
const mockAppConfigService = {
  polygonRpcUrl:
    'https://polygon-mainnet.g.alchemy.com/v2/YOUR_ALCHEMY_API_KEY',
};

describe('WalletService', () => {
  let walletService: WalletService;
  let challengeRepository: Repository<Challenge>;
  let userRepository: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WalletService,
        {
          provide: getRepositoryToken(Challenge),
          useFactory: mockChallengeRepository,
        },
        { provide: getRepositoryToken(User), useFactory: mockUserRepository },
        { provide: AppConfigService, useValue: mockAppConfigService },
      ],
    }).compile();

    walletService = module.get<WalletService>(WalletService);
    challengeRepository = module.get<Repository<Challenge>>(
      getRepositoryToken(Challenge),
    );
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should save a username challenge', async () => {
    const walletAddress = '0x123';
    const nonce = '123456';
    const mockChallenge = { walletAddress, nonce, expiresAt: new Date() };

    (challengeRepository.findOne as jest.Mock).mockResolvedValue(null);
    (challengeRepository.create as jest.Mock).mockReturnValue(mockChallenge);
    (challengeRepository.save as jest.Mock).mockResolvedValue(mockChallenge);

    await walletService.saveUsernameChallenge(walletAddress, nonce);
    expect(challengeRepository.create).toHaveBeenCalledWith({
      walletAddress,
      nonce,
      expiresAt: expect.any(Date),
    });
  });

  it('should get a username challenge if not expired', async () => {
    const walletAddress = '0x123';
    const nonce = '123456';
    const expiresAt = new Date(Date.now() + 100000);
    (challengeRepository.findOne as jest.Mock).mockResolvedValue({
      walletAddress,
      nonce,
      expiresAt,
    });

    const result = await walletService.getUsernameChallenge(walletAddress);
    expect(result).toBe(nonce);
  });

  it('should return null if challenge is expired', async () => {
    const walletAddress = '0x123';
    (challengeRepository.findOne as jest.Mock).mockResolvedValue({
      walletAddress,
      nonce: '123456',
      expiresAt: new Date(Date.now() - 1000),
    });

    const result = await walletService.getUsernameChallenge(walletAddress);
    expect(result).toBeNull();
  });
});
