import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SupabaseModule } from './supabase/supabase.module';
import { AuthModule } from './auth/auth.module';
import { CheckInsModule } from './check-ins/check-ins.module';

@Module({
  imports: [
    // .env Datei laden — muss als erstes importiert werden
    ConfigModule.forRoot({ isGlobal: true }),
    // Supabase Client global verfügbar machen
    SupabaseModule,
    // Feature-Module
    AuthModule,
    CheckInsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
