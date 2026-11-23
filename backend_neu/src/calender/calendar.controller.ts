
import {
  Controller,
  Get,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';

import { CalendarService } from './calendar.service';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';

@Controller('api/calendar')
@UseGuards(SupabaseAuthGuard)
export class CalendarController {
  constructor(
    private readonly calendarService: CalendarService,
  ) {}

  // Tagesansicht
  @Get('day')
  getDay(
    @Req() req: any,
    @Query('date') date: string,
  ) {
    return this.calendarService.getDay(
      req.supabase,
      req.user.id,
      date,
    );
  }

  // Wochenansicht
  @Get('week')
  getWeek(
    @Req() req: any,
    @Query('date') date: string,
  ) {
    return this.calendarService.getWeek(
      req.supabase,
      req.user.id,
      date,
    );
  }
}
