import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config'; 
import { CheckinModule } from './checkin/checkin.module';
import { EventsModule } from './events/events.module';

@Module({
  imports: [
    ConfigModule.forRoot(), 
    CheckinModule,
    EventsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
