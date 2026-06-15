import { Module } from '@nestjs/common';
import { SincronizacionesService } from './sincronizaciones.service';
import { SincronizacionesController } from './sincronizaciones.controller';

@Module({
  controllers: [SincronizacionesController],
  providers: [SincronizacionesService],
})
export class SincronizacionesModule {}
