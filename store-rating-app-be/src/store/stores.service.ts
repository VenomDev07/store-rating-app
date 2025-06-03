// src/stores/stores.service.ts
import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';
import {
  CreateStoreDto,
  GetStoresQueryDto,
  SearchStoresQueryDto,
  StoreResponseDto,
  StoresListResponseDto,
} from './dto/stores.dto';

@Injectable()
export class StoresService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: GetStoresQueryDto): Promise<StoresListResponseDto> {
    const { page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const [stores, total] = await Promise.all([
      this.prisma.store.findMany({
        skip,
        take: limit,
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          ratings: {
            select: {
              rating: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.store.count(),
    ]);

    const storesWithRatings = stores.map(store => {
      const ratings = store.ratings;
      const averageRating = ratings.length > 0 
        ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length 
        : 0;
      
      return {
        ...store,
        averageRating: Math.round(averageRating * 10) / 10,
        totalRatings: ratings.length,
        ratings: undefined, // Remove ratings array from response
      };
    });

    return {
      stores: storesWithRatings,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async search(query: SearchStoresQueryDto): Promise<StoresListResponseDto> {
    const { page = 1, limit = 10, name, address } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    
    if (name || address) {
      where.OR = [];
      
      if (name) {
        where.OR.push({ name: { contains: name, mode: 'insensitive' } });
      }
      
      if (address) {
        where.OR.push({ address: { contains: address, mode: 'insensitive' } });
      }
    }

    const [stores, total] = await Promise.all([
      this.prisma.store.findMany({
        where,
        skip,
        take: limit,
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          ratings: {
            select: {
              rating: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.store.count({ where }),
    ]);

    const storesWithRatings = stores.map(store => {
      const ratings = store.ratings;
      const averageRating = ratings.length > 0 
        ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length 
        : 0;
      
      return {
        ...store,
        averageRating: Math.round(averageRating * 10) / 10,
        totalRatings: ratings.length,
        ratings: undefined, // Remove ratings array from response
      };
    });

    return {
      stores: storesWithRatings,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: number): Promise<StoreResponseDto> {
    const store = await this.prisma.store.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        ratings: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: { id: 'desc' },
        },
      },
    });

    if (!store) {
      throw new NotFoundException('Store not found');
    }

    const averageRating = store.ratings.length > 0 
      ? store.ratings.reduce((sum, r) => sum + r.rating, 0) / store.ratings.length 
      : 0;

    return {
      ...store,
      averageRating: Math.round(averageRating * 10) / 10,
      totalRatings: store.ratings.length,
    };
  }

  async create(createStoreDto: CreateStoreDto): Promise<StoreResponseDto> {
    const { name, email, address, ownerId } = createStoreDto;

    // Check if store email already exists
    const existingStore = await this.prisma.store.findUnique({
      where: { email },
    });

    if (existingStore) {
      throw new ConflictException('Store with this email already exists');
    }

    // Check if owner exists and doesn't already have a store
    const owner = await this.prisma.user.findUnique({
      where: { id: ownerId },
    });

    if (!owner) {
      throw new NotFoundException('Owner not found');
    }

    /* if (owner.store) {
      throw new ConflictException('This user already owns a store');
    } */

    // Update user role to STORE_OWNER and create store in a transaction
    const result = await this.prisma.$transaction(async (prisma) => {
      // Update user role
      await prisma.user.update({
        where: { id: ownerId },
        data: { role: Role.STORE_OWNER },
      });

      // Create store
      return prisma.store.create({
        data: {
          name,
          email,
          address,
          ownerId,
        },
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });
    });

    return {
      ...result,
      averageRating: 0,
      totalRatings: 0,
    };
  }
}