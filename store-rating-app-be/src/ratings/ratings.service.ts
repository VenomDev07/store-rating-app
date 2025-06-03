// src/ratings/ratings.service.ts
import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateRatingDto,
  UpdateRatingDto,
  GetStoreRatingsQueryDto,
  RatingResponseDto,
  StoreRatingsDto,
} from './dto/ratings.dto';

@Injectable()
export class RatingsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: number, createRatingDto: CreateRatingDto): Promise<RatingResponseDto> {
    const { rating, storeId } = createRatingDto;

    // Check if store exists
    const store = await this.prisma.store.findUnique({
      where: { id: storeId },
      include: { owner: true },
    });

    if (!store) {
      throw new NotFoundException('Store not found');
    }

    // Prevent store owners from rating their own store
    if (store.owner.id === userId) {
      throw new ForbiddenException('You cannot rate your own store');
    }

    // Check if user has already rated this store
    const existingRating = await this.prisma.rating.findUnique({
      where: {
        userId_storeId: {
          userId,
          storeId,
        },
      },
    });

    if (existingRating) {
      throw new ConflictException('You have already rated this store');
    }

    const newRating = await this.prisma.rating.create({
      data: {
        rating,
        userId,
        storeId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
        store: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return newRating;
  }

  async update(
    id: number,
    userId: number,
    updateRatingDto: UpdateRatingDto,
  ): Promise<RatingResponseDto> {
    const { rating } = updateRatingDto;

    // Find the rating and check if it belongs to the user
    const existingRating = await this.prisma.rating.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
        store: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!existingRating) {
      throw new NotFoundException('Rating not found');
    }

    if (existingRating.userId !== userId) {
      throw new ForbiddenException('You can only update your own ratings');
    }

    const updatedRating = await this.prisma.rating.update({
      where: { id },
      data: { rating },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
        store: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return updatedRating;
  }

  async getStoreRatings(
    storeId: number,
    query: GetStoreRatingsQueryDto,
  ): Promise<StoreRatingsDto> {
    const { page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    // Check if store exists
    const store = await this.prisma.store.findUnique({
      where: { id: storeId },
      select: {
        id: true,
        name: true,
      },
    });

    if (!store) {
      throw new NotFoundException('Store not found');
    }

    // Get paginated ratings
    const [ratings, total, allRatings] = await Promise.all([
      this.prisma.rating.findMany({
        where: { storeId },
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { id: 'desc' },
      }),
      this.prisma.rating.count({ where: { storeId } }),
      this.prisma.rating.findMany({
        where: { storeId },
        select: { rating: true },
      }),
    ]);

    // Calculate statistics
    const averageRating = allRatings.length > 0 
      ? allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length 
      : 0;

    // Calculate rating distribution
    const ratingDistribution = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };

    allRatings.forEach(r => {
      ratingDistribution[r.rating as keyof typeof ratingDistribution]++;
    });

    return {
      storeId: store.id,
      storeName: store.name,
      ratings,
      averageRating: Math.round(averageRating * 10) / 10,
      totalRatings: allRatings.length,
      ratingDistribution,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}