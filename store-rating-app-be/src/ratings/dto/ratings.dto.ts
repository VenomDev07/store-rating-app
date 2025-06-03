// src/ratings/dto/ratings.dto.ts
import { IsInt, Min, Max, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateRatingDto {
  @IsInt({ message: 'Rating must be a number' })
  @Min(1, { message: 'Rating must be at least 1' })
  @Max(5, { message: 'Rating cannot exceed 5' })
  rating: number;

  @IsInt({ message: 'Store ID must be a number' })
  @Min(1, { message: 'Store ID must be a positive number' })
  storeId: number;
}

export class UpdateRatingDto {
  @IsInt({ message: 'Rating must be a number' })
  @Min(1, { message: 'Rating must be at least 1' })
  @Max(5, { message: 'Rating cannot exceed 5' })
  rating: number;
}

export class GetStoreRatingsQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;
}

export class RatingResponseDto {
  id: number;
  rating: number;
  user: {
    id: number;
    name: string;
  };
  store: {
    id: number;
    name: string;
  };
}

export class StoreRatingsDto {
  storeId: number;
  storeName: string;
  ratings: {
    id: number;
    rating: number;
    user: {
      id: number;
      name: string;
    };
  }[];
  averageRating: number;
  totalRatings: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}