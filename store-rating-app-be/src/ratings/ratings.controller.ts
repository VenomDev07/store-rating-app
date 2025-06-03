// src/ratings/ratings.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
} from '@nestjs/common';
import { RatingsService } from './ratings.service';
import { JwtAuthGuard, OptionalJwtAuthGuard } from '../auth/guards/auth.guards';
import { RequestWithUser } from '../auth/interfaces/jwt.payload.interface';
import {
  CreateRatingDto,
  UpdateRatingDto,
  GetStoreRatingsQueryDto,
} from './dto/ratings.dto';

@Controller('ratings')
export class RatingsController {
  constructor(private readonly ratingsService: RatingsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Request() req: RequestWithUser,
    @Body() createRatingDto: CreateRatingDto,
  ) {
    return this.ratingsService.create(req.user.id, createRatingDto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: RequestWithUser,
    @Body() updateRatingDto: UpdateRatingDto,
  ) {
    return this.ratingsService.update(id, req.user.id, updateRatingDto);
  }
}

@Controller('stores')
export class StoreRatingsController {
  constructor(private readonly ratingsService: RatingsService) {}

  @Get(':id/ratings')
  @UseGuards(OptionalJwtAuthGuard)
  async getStoreRatings(
    @Param('id', ParseIntPipe) storeId: number,
    @Query() query: GetStoreRatingsQueryDto,
  ) {
    return this.ratingsService.getStoreRatings(storeId, query);
  }
}