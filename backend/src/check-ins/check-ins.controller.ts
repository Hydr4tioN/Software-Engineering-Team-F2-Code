import {
  Body, Controller, Delete, Get, HttpCode, HttpStatus,
  Param, Post, Req, UseGuards, UsePipes, ValidationPipe,
} from '@nestjs/common';
import type { Request } from 'express';
import { CheckInsService } from './check-ins.service';
import { CreateCheckInDto } from './check-in.dto';
import { AuthGuard } from '../auth/auth.guard';

@Controller('check-ins')
@UseGuards(AuthGuard)
@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
export class CheckInsController {
  constructor(private readonly checkInsService: CheckInsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Req() req: Request, @Body() dto: CreateCheckInDto) {
    const userId = (req as any).user.id;
    return this.checkInsService.create(userId, dto);
  }

  @Get()
  findAll(@Req() req: Request) {
    const userId = (req as any).user.id;
    return this.checkInsService.findAll(userId);
  }

  @Get('chart')
  getChartData(@Req() req: Request) {
    const userId = (req as any).user.id;
    return this.checkInsService.getChartData(userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@Req() req: Request, @Param('id') id: string) {
    const userId = (req as any).user.id;
    return this.checkInsService.remove(userId, id);
  }
}