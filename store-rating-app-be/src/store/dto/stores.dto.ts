// src/stores/dto/stores.dto.ts
import { IsEmail, IsString, Length, MaxLength, IsOptional, IsInt, Min } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class CreateStoreDto {
  @IsString()
  @Length(1, 100, { message: 'Store name must be between 1 and 100 characters' })
  name: string;

  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @IsString()
  @MaxLength(400, { message: 'Address cannot exceed 400 characters' })
  address: string;

  @IsInt({ message: 'Owner ID must be a valid number' })
  @Min(1, { message: 'Owner ID must be a positive number' })
  ownerId: number;
}

export class GetStoresQueryDto {
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

export class SearchStoresQueryDto extends GetStoresQueryDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  address?: string;
}

export class StoreResponseDto {
  id: number;
  name: string;
  email: string;
  address: string;
  createdAt: Date;
  updatedAt: Date;
  owner: {
    id: number;
    name: string;
    email: string;
  };
  ratings?: {
    id: number;
    rating: number;
    user: {
      id: number;
      name: string;
    };
  }[];
  averageRating?: number;
  totalRatings?: number;
}

export class StoresListResponseDto {
  stores: StoreResponseDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}