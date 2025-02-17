import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpStatus } from '@nestjs/common';
import * as request from 'supertest';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { WalletService } from '../wallet/wallet.service';

describe('UserController (e2e)', () => {
  let app: INestApplication;

  const mockUserService = {
    createUser: jest.fn().mockResolvedValue({ id: 1, walletAddress: '0x123' }),
    getUser: jest.fn().mockResolvedValue({ id: 1, walletAddress: '0x123' }),
    changeUsernameWithChallenge: jest
      .fn()
      .mockResolvedValue({ id: 1, username: 'NewUser' }),
  };

  const mockWalletService = {
    saveUsernameChallenge: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        { provide: UserService, useValue: mockUserService },
        { provide: WalletService, useValue: mockWalletService },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/user (POST) - should create a user', () => {
    return request(app.getHttpServer())
      .post('/user')
      .send({ walletAddress: '0x123' })
      .expect(HttpStatus.CREATED)
      .expect({ id: 1, walletAddress: '0x123' });
  });

  it('/user/:id (GET) - should return user data', () => {
    return request(app.getHttpServer())
      .get('/user/1')
      .expect(HttpStatus.OK)
      .expect({ id: 1, walletAddress: '0x123' });
  });

  it('/user/change-username (POST) - should change username', () => {
    return request(app.getHttpServer())
      .post('/user/change-username')
      .send({
        walletAddress: '0x123',
        newUsername: 'NewUser',
        signature: '0xsomesignature',
      })
      .expect(HttpStatus.OK)
      .expect({ id: 1, username: 'NewUser' });
  });

  afterAll(async () => {
    await app.close();
  });
});
