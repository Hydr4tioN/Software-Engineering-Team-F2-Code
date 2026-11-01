
import { Module } from '@nestjs/common';

import { CalendarController } from './calendar.controller';
import { CalendarService } from './calendar.service';
import { CalendarDemoDataSource } from './calendar.demo-data-source';
import { CALENDAR_DATA_SOURCE } from './calendar.types';

@Module({
  controllers: [CalendarController],
  providers: [
    CalendarService,
    {
      provide: CALENDAR_DATA_SOURCE,
      useClass: CalendarDemoDataSource,
    },
  ],
})
export class CalendarModule {}
