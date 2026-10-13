import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CheckinService } from './checkin.service';
import { CreateCheckinDto } from './dto/create-checkin.dto';
import { UpdateCheckinDto } from './dto/update-checkin.dto';

@Controller('api')
export class CheckinController {
  constructor(private readonly checkinService: CheckinService) {}

  @Get('health')
  health() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }

  @Post('entries')
  create(@Body() dto: CreateCheckinDto) {
    return this.checkinService.create(dto);
  }

  @Get('entries')
  findAll() {
    return this.checkinService.findAll();
  }

  @Get('entries/:id')
  findOne(@Param('id') id: string) {
    return this.checkinService.findOne(id);
  }

  @Patch('entries/:id')
  update(@Param('id') id: string, @Body() dto: UpdateCheckinDto) {
    return this.checkinService.update(id, dto);
  }

  @Delete('entries/:id')
  remove(@Param('id') id: string) {
    return this.checkinService.remove(id);
  }
}