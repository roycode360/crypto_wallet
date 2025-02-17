// This service wraps the ConfigService provided by @nestjs/config,
// providing typed getters for our specific configuration variables.
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppConfigService {
  constructor(private readonly configService: ConfigService) {}

  // Getter for the Polygon RPC URL.
  // This value is loaded from the environment variable POLYGON_RPC_URL.
  get polygonRpcUrl(): string {
    return this.configService.get<string>('POLYGON_RPC_URL');
  }

  // Getter for DATABASE URL.
  // This value is loaded from the environment variable DATABASE_URL.
  get databaseUrl(): string {
    return this.configService.get<string>('DATABASE_URL');
  }
}
