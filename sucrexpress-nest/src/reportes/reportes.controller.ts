import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ReportesService } from './reportes.service';

@ApiTags('Reportes')
@ApiBearerAuth('JWT')
@Controller('reportes')
export class ReportesController {
  constructor(private readonly reportesService: ReportesService) {}

  // GET /api/reportes/paquetes?periodo=mes
  @Get('paquetes')
  @ApiOperation({ summary: 'Reporte de paquetes por período' })
  @ApiQuery({ name: 'periodo', required: false, enum: ['hoy', 'semana', 'mes'] })
  reportePaquetes(@Query('periodo') periodo?: string) {
    return this.reportesService.reportePaquetes(periodo);
  }

  // GET /api/reportes/incidencias?periodo=semana
  @Get('incidencias')
  @ApiOperation({ summary: 'Reporte de incidencias por período' })
  @ApiQuery({ name: 'periodo', required: false, enum: ['hoy', 'semana', 'mes'] })
  reporteIncidencias(@Query('periodo') periodo?: string) {
    return this.reportesService.reporteIncidencias(periodo);
  }
}
