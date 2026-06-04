import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ExtinguisherController } from './extinguisher.controller';
import { ExtinguisherService } from './extinguisher.service';
import { FireExtinguisher } from '../entities/fire-extinguisher.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([FireExtinguisher]),
    ClientsModule.register([
      {
        name: 'NOTIFICATION_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672'],
          queue: 'notification_queue',
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
    ]),
  ],
  controllers: [ExtinguisherController],
  providers: [ExtinguisherService],
  exports: [ExtinguisherService],
})
export class ExtinguisherModule {}
