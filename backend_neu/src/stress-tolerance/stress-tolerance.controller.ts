import { Controller, Get, Query, Req, UseGuards } from "@nestjs/common";
import { SupabaseAuthGuard } from "../auth/supabase-auth.guard";
import { StressToleranceService } from "./stress-tolerance.service";

@Controller("api/stress-tolerance")
@UseGuards(SupabaseAuthGuard)
export class StressToleranceController {
  constructor(
    private readonly stressToleranceService: StressToleranceService,
  ) {}

  /** GET /api/stress-tolerance?date=2026-11-18 */
  @Get()
  getForDay(@Req() req: any, @Query("date") date: string) {
    return this.stressToleranceService.getForDay(
      req.supabase,
      req.user.id,
      date,
    );
  }
}
