import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HbmModule } from './gateways/hbm/hbm.module';

@Module({
  imports: [HbmModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
