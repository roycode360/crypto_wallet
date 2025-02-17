import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.schema';
import { Challenge } from 'src/wallet/challenge.schema';
import { WalletService } from 'src/wallet/wallet.service';
import { AppConfigService } from 'src/config/config.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Challenge])],
  controllers: [UserController],
  providers: [UserService, WalletService, AppConfigService],
  exports: [UserService],
})
export class UserModule {}
