import { Module } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Challenge } from './challenge.schema';
import { User } from 'src/user/user.schema';
import { AppConfigService } from 'src/config/config.service';

@Module({
  imports: [TypeOrmModule.forFeature([Challenge, User])],
  controllers: [],
  providers: [WalletService, AppConfigService],
})
export class WalletModule {}
