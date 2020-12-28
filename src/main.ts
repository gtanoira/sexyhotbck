import { NestFactory } from '@nestjs/core';
import { json, urlencoded } from 'express';
import { AppModule } from './app.module';
// Environment
import { SERVER_PORT } from './environment/environment.settings';

/*
  CORS Setup
*/  
// CORS origins habilitados a acceder a la app
const whiteList = [
  "http://gradesh.claxson.com",
  /http:\/\/10.4.[0-9]{1,3}.[0-9]{1,3}/,
  "http://localhost:4200",
];

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Http request size limits
  app.use(json({ limit: '10mb' }));
  app.use(urlencoded({ extended: true, limit: '10mb' }));
    
  // Enable CORS
  app.enableCors(
    {
      "origin": whiteList,
      "methods": "GET,PUT,PATCH,POST,DELETE",
      "allowedHeaders": "Access-Control-Allow-Origin, Access-Control-Allow-Headers, Authorization, Content-Type, Accept-Language",
      "exposedHeaders": "",
      "preflightContinue": false,
      "optionsSuccessStatus": 200
    }
  );

  await app.listen(SERVER_PORT);
  console.log(`Server listening on port ${SERVER_PORT}`)
}
bootstrap();
