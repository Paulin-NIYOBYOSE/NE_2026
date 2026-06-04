import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { SharedModule } from './modules/shared/shared.module';
import { AuthGatewayModule } from './modules/auth/auth-gateway.module';
import { UserGatewayModule } from './modules/user/user-gateway.module';
import { ExtinguisherGatewayModule } from './modules/extinguisher/extinguisher-gateway.module';
import { InspectionGatewayModule } from './modules/inspection/inspection-gateway.module';
import { MaintenanceGatewayModule } from './modules/maintenance/maintenance-gateway.module';
import { ReportingGatewayModule } from './modules/reporting/reporting-gateway.module';
import { NotificationGatewayModule } from './modules/notification/notification-gateway.module';

@Module({
  imports: [
    SharedModule,
    ThrottlerModule.forRoot([{
      ttl: parseInt(process.env.THROTTLE_TTL) || 60,
      limit: parseInt(process.env.THROTTLE_LIMIT) || 100,
    }]),
    ClientsModule.register([
      {
        name: 'AUTH_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672'],
          queue: 'auth_queue',
          queueOptions: { durable: true },
        },
      },
      {
        name: 'USER_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672'],
          queue: 'user_queue',
          queueOptions: { durable: true },
        },
      },
      {
        name: 'EXTINGUISHER_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672'],
          queue: 'extinguisher_queue',
          queueOptions: { durable: true },
        },
      },
      {
        name: 'INSPECTION_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672'],
          queue: 'inspection_queue',
          queueOptions: { durable: true },
        },
      },
      {
        name: 'MAINTENANCE_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672'],
          queue: 'maintenance_queue',
          queueOptions: { durable: true },
        },
      },
      {
        name: 'REPORTING_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672'],
          queue: 'reporting_queue',
          queueOptions: { durable: true },
        },
      },
      {
        name: 'NOTIFICATION_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672'],
          queue: 'notification_queue',
          queueOptions: { durable: true },
        },
      },
    ]),
    AuthGatewayModule,
    UserGatewayModule,
    ExtinguisherGatewayModule,
    InspectionGatewayModule,
    MaintenanceGatewayModule,
    ReportingGatewayModule,
    NotificationGatewayModule,
  ],
})
export class AppModule {}
