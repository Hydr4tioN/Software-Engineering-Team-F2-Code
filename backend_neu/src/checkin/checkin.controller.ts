import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CheckinService } from './checkin.service';
import { CreateCheckinDto } from './dto/create-checkin.dto';
import { UpdateCheckinDto } from './dto/update-checkin.dto';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';

@Controller('api')
export class CheckinController {
  constructor(private readonly checkinService: CheckinService) {}

  @Get('health')
  health() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }

  @UseGuards(SupabaseAuthGuard)
  @Post('entries')
  create(@Req() req, @Body() dto: CreateCheckinDto) {
    return this.checkinService.create(req.supabase, req.user.id, dto);
  }

  @UseGuards(SupabaseAuthGuard)
  @Get('entries')
  findAll(@Req() req) {
    return this.checkinService.findAll(req.supabase, req.user.id);
  }

  @UseGuards(SupabaseAuthGuard)
  @Get('entries/:id')
  findOne(@Req() req, @Param('id') id: string) {
    return this.checkinService.findOne(req.supabase, req.user.id, id);
  }

  @UseGuards(SupabaseAuthGuard)
  @Patch('entries/:id')
  update(@Req() req, @Param('id') id: string, @Body() dto: UpdateCheckinDto) {
    return this.checkinService.update(req.supabase, req.user.id, id, dto);
  }

  @UseGuards(SupabaseAuthGuard)
  @Delete('entries/:id')
  remove(@Req() req, @Param('id') id: string) {
    return this.checkinService.remove(req.supabase, req.user.id, id);
  }
}
