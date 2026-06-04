import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ReportingModule } from './reporting/reporting.module';
import { Report } from './entities/report.entity';
import { AuditLog } from './entities/audit-log.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 5432,
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'fire_extinguisher_db',
      schema: process.env.DB_SCHEMA || 'reporting_schema',
      entities: [Report, AuditLog],
      synchronize: true,
    }),
    ClientsModule.register([
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
    ]),
    ReportingModule,
  ],
})
export class AppModule {}
