// src/dashboard/dashboard.controller.ts
import {
  Controller,
  Get,
  UseGuards,
  Request,
} from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard, RolesGuard, Roles } from '../auth/guards/auth.guards';
import { Role } from '@prisma/client';
import { RequestWithUser } from '../auth/interfaces/jwt.payload.interface';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('admin')
  @UseGuards(RolesGuard)
  @Roles(Role.SYSTEM_ADMIN)
  async getAdminDashboard() {
    return this.dashboardService.getAdminDashboard();
  }

  @Get('store')
  @UseGuards(RolesGuard)
  @Roles(Role.STORE_OWNER)
  async getStoreOwnerDashboard(@Request() req: RequestWithUser) {
    return this.dashboardService.getStoreOwnerDashboard(req.user.id);
  }
}