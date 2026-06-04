import { Module } from '@nestjs/common';
import { ReportingGatewayController } from './reporting-gateway.controller';
import { HttpService } from '../shared/http.service';

@Module({
  controllers: [ReportingGatewayController],
  providers: [HttpService],
})
export class ReportingGatewayModule {}
