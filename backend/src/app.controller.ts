import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  // Finds the health details.
  getHealth(): { status: string } {
    return { status: 'ok' };
  }
}
