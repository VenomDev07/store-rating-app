// src/dashboard/dashboard.service.ts
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';
import { AdminDashboardDto, StoreOwnerDashboardDto } from './dto/dashboard.dto';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getAdminDashboard(): Promise<AdminDashboardDto> {
    // Get basic counts
    const [
      totalUsers,
      totalStores,
      totalRatings,
      totalStoreOwners,
      totalNormalUsers,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.store.count(),
      this.prisma.rating.count(),
      this.prisma.user.count({ where: { role: Role.STORE_OWNER } }),
      this.prisma.user.count({ where: { role: Role.NORMAL_USER } }),
    ]);

    // Get recent users (last 10)
    const recentUsers = await this.prisma.user.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });




const allUsers = await this.prisma.user.findMany({
  orderBy: { createdAt: 'desc' },
  select: {
    id: true,
    name: true,
    email: true,
    address: true,
    role: true,
    createdAt: true,
    ownedStore: {
      select: {
        id: true,
        name: true, // Added store name
        ratings: {
          select: {
            rating: true,
          },
        },
      },
    },
  },
});

// Transform the data
const enrichedUsers = allUsers.map(user => {
  const result: {
    id: number;
    name: string;
    email: string;
    address: string;
    role: Role;
    createdAt: Date;
    storeName?: string;
    averageRating?: number;
    totalRatings?: number;
  } = {
    id: user.id,
    name: user.name,
    email: user.email,
    address: user.address,
    role: user.role,
    createdAt: user.createdAt,
  };

  // Add rating info only for store owners who have a store
  if (user.role === 'STORE_OWNER' && user.ownedStore) {
    const ratings = user.ownedStore.ratings.map(r => r.rating);
    const averageRating = ratings.length > 0
      ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
      : 0;

    result.storeName = user.ownedStore.name;
    result.averageRating = parseFloat(averageRating.toFixed(2));
    result.totalRatings = ratings.length;
  }

  return result;
});

    // Get recent stores (last 10)
    const recentStores = await this.prisma.store.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        owner: {
          select: {
            name: true,
          },
        },
      },
    });

    // Get top rated stores
    const storesWithRatings = await this.prisma.store.findMany({
      include: {
        ratings: {
          select: {
            rating: true,
          },
        },
      },
    });  

    const storesWithAverageRatings = storesWithRatings.map(store => {
    const ratings = store.ratings.map(r => r.rating);
    const averageRating = ratings.length > 0 
      ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length 
      : 0;
    
    return {
      ...store,
      averageRating: parseFloat(averageRating.toFixed(2)), // Round to 2 decimal places
      totalRatings: ratings.length
    };
  });
      

    const topRatedStores = storesWithRatings
      .map(store => {
        const ratings = store.ratings;
        const averageRating = ratings.length > 0 
          ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length 
          : 0;
        
        return {
          id: store.id,
          name: store.name,
          averageRating: Math.round(averageRating * 10) / 10,
          totalRatings: ratings.length,
        };
      })
      .filter(store => store.totalRatings > 0)
      .sort((a, b) => b.averageRating - a.averageRating)
      .slice(0, 5);

    // Get user growth for last 12 months
    const userGrowth = await this.getUserGrowthData();
    
    // Get store growth for last 12 months
    const storeGrowth = await this.getStoreGrowthData();

    return {
      totalUsers,
      totalStores,
      totalRatings,
      totalStoreOwners,
      totalNormalUsers,
      recentUsers,
      storesWithAverageRatings,
      enrichedUsers,
      recentStores: recentStores.map(store => ({
        ...store,
        ownerName: store.owner.name,
        owner: undefined,
      })),
      topRatedStores,
      userGrowth,
      storeGrowth,
    };
  }

  async getStoreOwnerDashboard(userId: number): Promise<StoreOwnerDashboardDto> {
    // Find the store owned by this user
    const store = await this.prisma.store.findUnique({
      where: { ownerId: userId },
      include: {
        ratings: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
                address: true
              },
            },
          },
          orderBy: { id: 'desc' },
        },
      },
    });

    if (!store) {
      throw new NotFoundException('Store not found for this user');
    }

    const ratings = store.ratings;
    const totalRatings = ratings.length;
    const averageRating = totalRatings > 0 
      ? ratings.reduce((sum, r) => sum + r.rating, 0) / totalRatings 
      : 0;

    // Calculate rating distribution
    const ratingDistribution = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };

    ratings.forEach(r => {
      ratingDistribution[r.rating as keyof typeof ratingDistribution]++;
    });

    // Get recent ratings (last 10)
    const recentRatings = ratings.map(rating => ({
      id: rating.id,
      rating: rating.rating,
      userName: rating.user.name,
      email : rating.user.email,
      address : rating.user.address,
      createdAt: new Date(),
    }));

    // Get rating trend for last 12 months
    const ratingTrend = await this.getStoreRatingTrend(store.id);

    return {
      storeId: store.id,
      storeName: store.name,
      totalRatings,
      averageRating: Math.round(averageRating * 10) / 10,
      ratingDistribution,
      recentRatings,
      ratingTrend,
    };
  }

  private async getUserGrowthData() {
    // This is a simplified version. In a real app, you'd use proper date functions
    const months = [];
    const currentDate = new Date();
    
    for (let i = 11; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const nextDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i + 1, 1);
      
      const count = await this.prisma.user.count({
        where: {
          createdAt: {
            gte: date,
            lt: nextDate,
          },
        },
      });

      months.push({
        month: date.toLocaleString('default', { month: 'short', year: 'numeric' }),
        count,
      });
    }

    return months;
  }

  private async getStoreGrowthData() {
    // Similar to user growth data
    const months = [];
    const currentDate = new Date();
    
    for (let i = 11; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const nextDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i + 1, 1);
      
      const count = await this.prisma.store.count({
        where: {
          createdAt: {
            gte: date,
            lt: nextDate,
          },
        },
      });

      months.push({
        month: date.toLocaleString('default', { month: 'short', year: 'numeric' }),
        count,
      });
    }

    return months;
  }

  private async getStoreRatingTrend(storeId: number) {
    // This is a simplified version. In a real app, you'd have timestamps on ratings
    // and calculate monthly averages properly
    const months = [];
    const currentDate = new Date();
    
    for (let i = 11; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      
      // For demo purposes, we'll use simplified data
      // In reality, you'd filter ratings by date and calculate averages
      const allRatings = await this.prisma.rating.findMany({
        where: { storeId },
        select: { rating: true },
      });

      const averageRating = allRatings.length > 0 
        ? allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length 
        : 0;

      months.push({
        month: date.toLocaleString('default', { month: 'short', year: 'numeric' }),
        averageRating: Math.round(averageRating * 10) / 10,
        totalRatings: allRatings.length,
      });
    }

    return months;
  }
}