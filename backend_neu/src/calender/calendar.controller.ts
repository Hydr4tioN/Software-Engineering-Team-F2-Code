
import {
  Controller,
  Get,
  Query,
} from '@nestjs/common';

import { CalendarService } from './calendar.service';

@Controller('api/calendar')
export class CalendarController {
  constructor(
    private readonly calendarService: CalendarService,
  ) {}

  @Get('day')
  getDay(@Query('date') date: string) {
    // Nur für die lokale Demo.
    // Später Benutzer-ID aus Supabase Auth beziehen.
    const demoUserId = 'demo-user';

    return this.calendarService.getDay(
      date,
      demoUserId,
    );
  }
}
