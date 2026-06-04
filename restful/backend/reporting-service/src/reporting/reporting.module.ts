import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ReportingController } from './reporting.controller';
import { ReportingService } from './reporting.service';
import { AuditLogController } from '../audit/audit-log.controller';
import { AuditLogService } from '../audit/audit-log.service';
import { Report } from '../entities/report.entity';
import { AuditLog } from '../entities/audit-log.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Report, AuditLog]),
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
  ],
  controllers: [ReportingController, AuditLogController],
  providers: [ReportingService, AuditLogService],
  exports: [ReportingService, AuditLogService],
})
export class ReportingModule {}
