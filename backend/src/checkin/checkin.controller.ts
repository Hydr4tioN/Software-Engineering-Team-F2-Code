import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CheckinService } from './checkin.service';
import { CreateCheckinDto } from './dto/create-checkin.dto';
import { UpdateCheckinDto as any } from './dto/update-checkin.dto';

@Controller('api')
export class CheckinController {
  constructor(private readonly checkinService: CheckinService) {}

  @Post('entries')
  async create(@Body() createCheckinDto: any) {
    console.log('Checkin created:', createCheckinDto);
    return this.checkinService.create(createCheckinDto);
  }

  @Get('entries')
  async findAll() {
    return this.checkinService.findAll();
  }

  @Get('entries/:id')
  async findOne(@Param('id') id: string) {
    return this.checkinService.findOne(id);
  }

  @Patch('entries/:id')
  async update(@Param('id') id: string, @Body() updateCheckinDto: any) {
    return this.checkinService.update(id, updateCheckinDto);
  }

  @Delete('entries/:id')
  async remove(@Param('id') id: string) {
    return this.checkinService.remove(id);
  }
}

