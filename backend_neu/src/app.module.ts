import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config'; 
import { CheckinModule } from './checkin/checkin.module';
import { EventsModule } from './events/events.module';
import { CalendarModule } from './calender/calendar.module';
import { StressToleranceModule } from './stress-tolerance/stress-tolerance.module';

@Module({
  imports: [
    ConfigModule.forRoot(), 
    CheckinModule,
    EventsModule,
    CalendarModule,
    StressToleranceModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
