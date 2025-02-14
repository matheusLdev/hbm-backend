import { Module } from '@nestjs/common';
import { HbmGateway } from './hbm.gateway';
import { HbmService } from './hbm.service';

@Module({
  providers: [HbmGateway, HbmService],
})
export class HbmModule {}
