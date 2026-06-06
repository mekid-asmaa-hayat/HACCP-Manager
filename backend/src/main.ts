import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { UsersService } from './users/users.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: false,
    transform: true,
  }));

  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('HACCPManager API')
    .setDescription('API REST du progiciel de gestion HACCP')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Seed des utilisateurs de démo au premier démarrage
  const usersService = app.get(UsersService);
  await usersService.seedDemoUsers();

  const port = process.env.PORT || 4000;
  await app.listen(port);
  console.log(`🚀 HACCPManager API démarrée sur http://localhost:${port}`);
  console.log(`📚 Swagger : http://localhost:${port}/api`);
}
bootstrap();
