import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';

import configuration from './config/configuration';
import { validate } from './config/env.validation';

import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './user/users.module';
import { StoresModule } from './store/stores.module';
import { RatingsModule } from './ratings/ratings.module';
import { DashboardModule } from './dashboard/dashboard.module';

@Module({
  imports: [
    // Global configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validate,
      envFilePath: ['.env.local', '.env'],
    }),
    
    // Rate limiting
    ThrottlerModule.forRootAsync({
      useFactory: () => ({
        throttlers: [
          {
            ttl: parseInt(process.env.RATE_LIMIT_TTL, 10) || 60000,
            limit: parseInt(process.env.RATE_LIMIT_LIMIT, 10) || 100,
          },
        ],
      }),
    }),
    
    PrismaModule,
    AuthModule,
    UsersModule,
    StoresModule,
    RatingsModule,
    DashboardModule,
  ],
  providers: [
    // Global rate limiting guard
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}