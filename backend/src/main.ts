import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { runUuidRoundtripSanity } from './modules/database/sanity';
import { DataSource } from 'typeorm';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  // Self-check: exercises a UUID roundtrip on the Account PK.
  // Enable with SANITY_CHECK=true in env. No test framework.
  const dataSource = app.get(DataSource);
  await runUuidRoundtripSanity(dataSource);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
