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


  // CORS configurado para permitir apenas as origens específicas
  app.enableCors({
    origin: ['https://ispsml.ao', 'https://ispsml-platform.vercel.app'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Authorization, app_name',
    credentials: false,
  });

  // Middleware para verificar o cabeçalho app_name
  app.use((req, res, next) => {
    const appName = req.headers['app_name'];
    
    // Se a requisição for OPTIONS (preflight), permitimos passar
    if (req.method === 'OPTIONS') {
      next();
      return;
    }
    
    // Verificar se o app_name está correto
    if (appName !== 'ispsml-platform-6816d69d5f71486c478112fd') {
      return res.status(403).json({
        statusCode: 403,
        message: 'Access denied. Invalid application.',
      });
    }
    
    next();
  });


  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalFilters(new HttpExceptionFilter());
  await app.listen(4000);
}
bootstrap();
