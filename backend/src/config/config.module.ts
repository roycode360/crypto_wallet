// Here we configure the application-wide environment configuration.
// We use @nestjs/config to load environment variables from a .env file and make them available globally.
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    // ConfigModule.forRoot loads .env automatically and sets the module as global.
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
  ],
})
export class AppConfigModule {}
