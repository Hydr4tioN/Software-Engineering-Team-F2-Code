import { Module } from "@nestjs/common";
import { StressToleranceController } from "./stress-tolerance.controller";
import { StressToleranceService } from "./stress-tolerance.service";
import { SupabaseStressToleranceDataSource } from "./supabase-stress-tolerance.data-source";
import { STRESS_TOLERANCE_DATA_SOURCE } from "./stress-tolerance.types";

@Module({
  controllers: [StressToleranceController],
  providers: [
    StressToleranceService,
    {
      provide: STRESS_TOLERANCE_DATA_SOURCE,
      useClass: SupabaseStressToleranceDataSource,
    },
  ],
})
export class StressToleranceModule {}
