import { Module } from '@nestjs/common';
import { ExtinguisherGatewayController } from './extinguisher-gateway.controller';
import { HttpService } from '../shared/http.service';

@Module({
  controllers: [ExtinguisherGatewayController],
  providers: [HttpService],
})
export class ExtinguisherGatewayModule {}
