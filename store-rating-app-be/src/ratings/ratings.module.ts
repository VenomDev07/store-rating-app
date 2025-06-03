// src/ratings/ratings.module.ts
import { Module } from '@nestjs/common';
import { RatingsController, StoreRatingsController } from './ratings.controller';
import { RatingsService } from './ratings.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [RatingsController, StoreRatingsController],
  providers: [RatingsService],
  exports: [RatingsService],
})
export class RatingsModule {}