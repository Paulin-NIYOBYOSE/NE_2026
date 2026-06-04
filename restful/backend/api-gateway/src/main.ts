import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security
  app.use(helmet.default());

  // CORS
  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:4200', 'http://localhost:5173', 'http://127.0.0.1:3000'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id', 'x-user-role', 'x-user-email'],
  });

  // Validation
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // Global prefix
  app.setGlobalPrefix('api');

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Fire Extinguisher Management System - API Gateway')
    .setDescription(
      '## Fire Extinguisher Management System\n\n' +
      'Central API Gateway for the Fire Extinguisher Management Microservices System. ' +
      'This gateway routes requests to appropriate microservices and handles authentication.\n\n' +
      '---\n\n' +
      '## Test Credentials\n\n' +
      '| Role | Email | Password |\n' +
      '|------|-------|----------|\n' +
      '| Admin | `admin@tzw.com` | `Admin123!` |\n' +
      '| User | `user@tzw.com` | `User123!` |\n\n' +
      '---\n\n' +
      '## How to Use This API\n\n' +
      '### 1. Authenticate\n' +
      'Call **POST /api/auth/login** with a test account above.\n' +
      'The response returns an `accessToken`.\n\n' +
      '### 2. Authorize in Swagger\n' +
      'Click the **Authorize** button (🔒) at the top right, enter:\n' +
      '```\nBearer YOUR_ACCESS_TOKEN\n```\n\n' +
      '### 3. Explore Endpoints\n' +
      'Use any endpoint below. The gateway routes to the correct microservice.\n\n' +
      '---\n\n' +
      '## Role-Based Access\n\n' +
      '| Endpoint | Required Role |\n' +
      '|----------|---------------|\n' +
      '| Users (manage) | Admin |\n' +
      '| Extinguishers (CRUD) | Admin |\n' +
      '| Inspections (schedule) | Admin, Inspector |\n' +
      '| Maintenance (log) | Admin, Inspector, Technician |\n' +
      '| Reports (generate) | Admin, Inspector |\n' +
      '| Audit Logs | Admin |\n' +
      '| Notifications | Any authenticated user |\n\n' +
      '---\n\n' +
      '## Microservices Architecture\n\n' +
      '| Service | Port |\n|---------|------|\n' +
      '| API Gateway | 5000 |\n' +
      '| Auth Service | 5001 |\n' +
      '| User Service | 5002 |\n' +
      '| Extinguisher Service | 5003 |\n' +
      '| Inspection Service | 5004 |\n' +
      '| Maintenance Service | 5005 |\n' +
      '| Reporting Service | 5006 |\n' +
      '| Notification Service | 5007 |\n\n' +
      '---\n\n' +
      '## Quick Test Flow\n\n' +
      '1. `POST /api/auth/login` → get token\n' +
      '2. `GET /api/users/me` → see your profile\n' +
      '3. `GET /api/extinguishers` → list extinguishers\n' +
      '4. `GET /api/notifications/my` → see your notifications\n' +
      '5. (Admin) `GET /api/reports` → view reports\n' +
      '6. (Admin) `GET /api/audit-logs` → view audit logs\n' +
      '7. (Admin) `GET /api/users/role-requests` → view pending role requests',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Auth', 'Authentication & Authorization')
    .addTag('Users', 'User Profile Management')
    .addTag('Extinguishers', 'Fire Extinguisher Management')
    .addTag('Inspections', 'Inspection Scheduling & Tracking')
    .addTag('Maintenance', 'Maintenance Logging & History')
    .addTag('Reports', 'Reporting & Analytics')
    .addTag('Notifications', 'Notification Management')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.PORT || 5000);
  console.log(`API Gateway running on port ${process.env.PORT || 5000}`);
  console.log(`Swagger docs: http://localhost:${process.env.PORT || 5000}/api/docs`);
}
bootstrap();
