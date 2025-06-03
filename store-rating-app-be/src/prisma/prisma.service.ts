import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({
      log: ['query', 'info', 'warn', 'error'],
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  // Helper method to get database statistics
  async getDatabaseStats() {
    const [userCount, storeCount, ratingCount] = await Promise.all([
      this.user.count(),
      this.store.count(),
      this.rating.count(),
    ]);

    return {
      totalUsers: userCount,
      totalStores: storeCount,
      totalRatings: ratingCount,
    };
  }
}