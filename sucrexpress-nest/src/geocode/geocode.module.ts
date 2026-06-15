import { Module } from '@nestjs/common';
import { GeocodeService } from './geocode.service';
import { GeocodeController } from './geocode.controller';

@Module({
  controllers: [GeocodeController],
  providers: [GeocodeService],
})
export class GeocodeModule {}
