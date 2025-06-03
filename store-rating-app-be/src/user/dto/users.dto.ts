// src/users/dto/users.dto.ts
import { IsEmail, IsString, Length, MaxLength, IsEnum, IsOptional, IsInt, Min } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { Role } from '@prisma/client';

export class CreateUserDto {
  @IsString()
  @Length(1, 60, { message: 'Name must be between 1 and 60 characters' })
  name: string;

  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @IsString()
  @MaxLength(400, { message: 'Address cannot exceed 400 characters' })
  address: string;

  @IsEnum(Role, { message: 'Invalid role provided' })
  role: Role;

@IsString()
  @Length(8, 16, { message: 'Password must be between 8 and 16 characters' })
  password: string;
}

export class UpdateUserPasswordDto {
  @IsString()
  @Length(8, 16, { message: 'Password must be between 8 and 16 characters' })
  password: string;
}

export class GetUsersQueryDto {
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

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(Role)
  role?: Role;
}

export class UserResponseDto {
  id: number;
  name: string;
  email: string;
  address: string;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
}

export class UsersListResponseDto {
  users: UserResponseDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}