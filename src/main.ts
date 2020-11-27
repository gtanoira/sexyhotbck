import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
// Environment
import { SERVER_PORT } from './environment/environment.settings';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(SERVER_PORT);
  console.log(`Server listening on port ${SERVER_PORT}`)
}
bootstrap();
