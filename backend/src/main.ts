import { NestFactory } from '@nestjs/core';
import { AppModule } from './staff/app.module';

// Starts the backend server and prepares the app.
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({ origin: true });
  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
