/* eslint-disable prettier/prettier */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { TransformInterceptor } from './transform/transform.interceptor';
import { HttpExceptionFilter } from './http/http.filter';
import * as bodyParser from 'body-parser';
import * as dotenv from 'dotenv';
dotenv.config();



async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Aumenta o limite do JSON para 100MB (ou outro valor necessário)
  app.use(bodyParser.json({ limit: '100mb' }));
  app.use(bodyParser.urlencoded({ limit: '100mb', extended: true }));


  // Habilitar CORS para localhost, zuela.pt, zuela.vercel.app
  app.enableCors({
    origin: "*",
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS', // Métodos permitidos
    allowedHeaders: 'Content-Type, Authorization', // Cabeçalhos permitidos
    credentials: false, // Não envia cookies ou credenciais, mas pode ser ajustado conforme necessário
  });


  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalFilters(new HttpExceptionFilter());
  await app.listen(4000);
}
bootstrap();
