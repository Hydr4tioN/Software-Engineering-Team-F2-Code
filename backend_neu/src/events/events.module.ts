import { Module } from '@nestjs/common';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { SupabaseEventRepository } from './supabase-event.repository';
import { EventRepository } from './event.repository';

@Module({
  controllers: [EventsController],
  providers: [
    EventsService,
    {
      provide: EventRepository,           
      useClass: SupabaseEventRepository,  
    },
  ],
})
export class EventsModule {}
