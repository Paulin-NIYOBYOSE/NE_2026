import { Module } from '@nestjs/common';
import { NotificationGatewayController } from './notification-gateway.controller';
import { HttpService } from '../shared/http.service';

@Module({
  controllers: [NotificationGatewayController],
  providers: [HttpService],
})
export class NotificationGatewayModule {}
