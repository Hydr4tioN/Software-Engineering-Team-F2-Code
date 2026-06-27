
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config'; 
import { CheckinModule } from './checkin/checkin.module';

@Module({
  imports: [
    ConfigModule.forRoot(), 
    CheckinModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
