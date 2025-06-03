// src/users/users.service.ts
import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { HashService } from '../auth/services/hash.service';
import {
  CreateUserDto,
  UpdateUserPasswordDto,
  GetUsersQueryDto,
  UserResponseDto,
  UsersListResponseDto,
} from './dto/users.dto';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private hashService: HashService,
  ) {}

  async findAll(query: GetUsersQueryDto): Promise<UsersListResponseDto> {
    const { page = 1, limit = 10, search, role } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (role) {
      where.role = role;
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          email: true,
          address: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: number): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        address: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const { name, email, address, role, password } = createUserDto;

    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Generate a default password (should be changed by user)

    const hashedPassword = await this.hashService.hashPassword(password);

    const user = await this.prisma.user.create({
      data: {
        name,
        email,
        address,
        role,
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
        address: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // In a real application, you would send the default password via email
    console.log(`Default password for ${email}: ${password}`);

    return user;
  }

  async updatePassword(
    id: number,
    updateUserPasswordDto: UpdateUserPasswordDto,
  ): Promise<{ message: string }> {
    const { password } = updateUserPasswordDto;

    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if new password is different from current
    const isSamePassword = await this.hashService.comparePassword(
      password,
      user.password,
    );

    if (isSamePassword) {
      throw new BadRequestException('New password must be different from current password');
    }

    const hashedPassword = await this.hashService.hashPassword(password);

    await this.prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    });

    return { message: 'Password updated successfully' };
  }

  async getUserRatings(userId: number) {
    return this.prisma.rating.findMany({
      where: {
        userId: userId,
      },
      include: {
        store: {
          select: {
            id: true,
            name: true,
            email: true,
            address: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  private generateRandomPassword(): string {
    const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
    const numberChars = '0123456789';
    const specialChars = '!@#$&*';
    
    const allChars = uppercaseChars + lowercaseChars + numberChars + specialChars;
    
    let password = '';
    
    // Ensure at least one character from each required category
    password += uppercaseChars.charAt(Math.floor(Math.random() * uppercaseChars.length));
    password += specialChars.charAt(Math.floor(Math.random() * specialChars.length));
    
    // Fill the rest randomly
    for (let i = 2; i < 12; i++) {
      password += allChars.charAt(Math.floor(Math.random() * allChars.length));
    }
    
    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('');
  }
}