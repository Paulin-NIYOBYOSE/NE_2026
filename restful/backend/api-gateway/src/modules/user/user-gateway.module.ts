import { Module } from '@nestjs/common';
import { UserGatewayController } from './user-gateway.controller';
import { HttpService } from '../shared/http.service';

@Module({
  controllers: [UserGatewayController],
  providers: [HttpService],
})
export class UserGatewayModule {}
