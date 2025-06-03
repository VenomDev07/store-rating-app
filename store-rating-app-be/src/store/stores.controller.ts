// src/stores/stores.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  UseInterceptors,
} from '@nestjs/common';
import { StoresService } from './stores.service';
import { JwtAuthGuard, RolesGuard, Roles, OptionalJwtAuthGuard } from '../auth/guards/auth.guards';
import { Role } from '@prisma/client';
import {
  CreateStoreDto,
  GetStoresQueryDto,
  SearchStoresQueryDto,
} from './dto/stores.dto';
import { AnyFilesInterceptor } from '@nestjs/platform-express';

@Controller('stores')
export class StoresController {
  constructor(private readonly storesService: StoresService) {}

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  async findAll(@Query() query: GetStoresQueryDto) {
    return this.storesService.findAll(query);
  }

  @Get('search')
  @UseGuards(OptionalJwtAuthGuard)
  async search(@Query() query: SearchStoresQueryDto) {
    return this.storesService.search(query);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SYSTEM_ADMIN)
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createStoreDto: CreateStoreDto) {
    return this.storesService.create(createStoreDto);
  }

  @Get(':id')
  @UseGuards(OptionalJwtAuthGuard)
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.storesService.findOne(id);
  }
}