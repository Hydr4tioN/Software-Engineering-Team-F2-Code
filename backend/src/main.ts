import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS für Frontend (React/Vite auf localhost:5173 in dev)
  app.enableCors({
    origin: process.env.FRONTEND_URL ?? 'http://localhost:5173',
    methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Globale Validierung (DTO-Fehler als 400er zurückgeben)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,        // unbekannte Felder aus Body entfernen
      forbidNonWhitelisted: true,
      transform: true,        // Typen automatisch casten (z.B. string → number)
    }),
  );

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`Backend läuft auf http://localhost:${port}`);
}
bootstrap();