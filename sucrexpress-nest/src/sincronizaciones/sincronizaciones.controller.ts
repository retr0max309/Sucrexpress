import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { SincronizacionesService } from './sincronizaciones.service';

@ApiTags('Sincronizaciones')
@ApiBearerAuth('JWT')
@Controller('sincronizaciones')
export class SincronizacionesController {
  constructor(private readonly sincronizacionesService: SincronizacionesService) {}

  // GET /api/sincronizaciones?limite=10
  @Get()
  @ApiOperation({ summary: 'Obtener eventos recientes de paquetes e incidencias' })
  @ApiQuery({ name: 'limite', required: false, type: Number })
  getSincronizaciones(@Query('limite') limite?: number) {
    return this.sincronizacionesService.getSincronizaciones(limite ? Number(limite) : 10);
  }

  // GET /api/sincronizaciones/cambios?desde=2024-01-01T00:00:00Z
  @Get('cambios')
  @ApiOperation({ summary: 'Obtener cambios desde un timestamp específico' })
  @ApiQuery({ name: 'desde', required: true })
  @ApiQuery({ name: 'limite', required: false, type: Number })
  getCambios(
    @Query('desde') desde: string,
    @Query('limite') limite?: number,
  ) {
    return this.sincronizacionesService.getCambios(desde, limite ? Number(limite) : 10);
  }
}
