import { Module } from '@nestjs/common';
import { RepartidoresService } from './repartidores.service';
import { RepartidoresController } from './repartidores.controller';

@Module({
  controllers: [RepartidoresController],
  providers: [RepartidoresService],
})
export class RepartidoresModule {}
