import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@/core/modules/auth/guards/jwt.guard';
import { User } from '@/core/lib/decorators/user.decorator';
import { UserDocument } from '../../users/schemas/user.schema';
import { ApiTags } from '@nestjs/swagger';
import { EventsService } from '../services/events.service';

@Controller('/events')
@ApiTags('Events Controller')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async getEvents(@User() user: UserDocument) {
    return this.eventsService.getCalendarEvents(user);
  }
}
