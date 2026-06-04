import { Module } from '@nestjs/common';
import { InspectionGatewayController } from './inspection-gateway.controller';
import { HttpService } from '../shared/http.service';

@Module({
  controllers: [InspectionGatewayController],
  providers: [HttpService],
})
export class InspectionGatewayModule {}
