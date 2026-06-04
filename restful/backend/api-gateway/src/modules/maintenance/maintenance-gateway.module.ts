import { Module } from '@nestjs/common';
import { MaintenanceGatewayController } from './maintenance-gateway.controller';
import { HttpService } from '../shared/http.service';

@Module({
  controllers: [MaintenanceGatewayController],
  providers: [HttpService],
})
export class MaintenanceGatewayModule {}
