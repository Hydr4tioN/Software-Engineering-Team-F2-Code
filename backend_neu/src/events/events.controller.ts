
import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import { EventsService } from './events.service';
import { CreateEventOccurrenceDto } from './dto/create-event-occurrence.dto';

@Controller('api/events')
@UseGuards(SupabaseAuthGuard)
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post(':id/occurrences')
  addOccurrence(
    @Req() req: any,
    @Param('id') eventId: string,
    @Body() dto: CreateEventOccurrenceDto,
  ) {
    return this.eventsService.addOccurrence(
      req.supabase,
      req.user.id,
      eventId,
      dto,
    );
  }

  @Get()
  findAll(@Req() req: any) {
    return this.eventsService.findAll(
      req.supabase,
      req.user.id,
    );
  }
}
