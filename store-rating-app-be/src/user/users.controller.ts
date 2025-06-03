// src/users/users.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  Request,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard, RolesGuard, Roles } from '../auth/guards/auth.guards';
import { Role } from '@prisma/client';
import {
  CreateUserDto,
  UpdateUserPasswordDto,
  GetUsersQueryDto,
} from './dto/users.dto';
import { GetUser } from 'src/auth/decorators/get-user.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @UseGuards(RolesGuard)
  @Roles(Role.SYSTEM_ADMIN)
  async findAll(@Query() query: GetUsersQueryDto) {
    return this.usersService.findAll(query);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.SYSTEM_ADMIN)
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  // Returns all ratings made by current user
  @Get('ratings')
  @HttpCode(HttpStatus.OK)
  async getUserRatings(@GetUser() user: any) {
    return this.usersService.getUserRatings(user.id);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }


  @Put(':id/password')
  @UseGuards(RolesGuard)
  @Roles(Role.SYSTEM_ADMIN)
  @HttpCode(HttpStatus.OK)
  async updatePassword(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserPasswordDto: UpdateUserPasswordDto,
  ) {
    return this.usersService.updatePassword(id, updateUserPasswordDto);
  }
}