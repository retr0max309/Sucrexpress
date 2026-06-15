import { Module } from '@nestjs/common';
import { PaquetesService } from './paquetes.service';
import { PaquetesController } from './paquetes.controller';

@Module({
  controllers: [PaquetesController],
  providers: [PaquetesService],
})
export class PaquetesModule {}
