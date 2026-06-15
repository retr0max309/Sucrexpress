import {
  Controller, Get, Post, Put,
  Param, Body, Query,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { IncidenciasService } from './incidencias.service';

@ApiTags('Incidencias')
@ApiBearerAuth('JWT')
@Controller('incidencias')
export class IncidenciasController {
  constructor(private readonly incidenciasService: IncidenciasService) {}

  // GET /api/incidencias
  @Get()
  @ApiOperation({ summary: 'Obtener incidencias con filtros y paginación' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'estado', required: false })
  @ApiQuery({ name: 'tipo_incidencia', required: false })
  @ApiQuery({ name: 'repartidor_id', required: false })
  @ApiQuery({ name: 'fecha_inicio', required: false })
  @ApiQuery({ name: 'fecha_fin', required: false })
  @ApiQuery({ name: 'search', required: false })
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('estado') estado?: string,
    @Query('tipo_incidencia') tipo_incidencia?: string,
    @Query('repartidor_id') repartidor_id?: string,
    @Query('fecha_inicio') fecha_inicio?: string,
    @Query('fecha_fin') fecha_fin?: string,
    @Query('search') search?: string,
  ) {
    return this.incidenciasService.findAll({
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 10,
      estado,
      tipo_incidencia,
      repartidor_id,
      fecha_inicio,
      fecha_fin,
      search,
    });
  }

  // GET /api/incidencias/estadisticas/resumen
  @Get('estadisticas/resumen')
  @ApiOperation({ summary: 'Estadísticas resumen de incidencias' })
  getEstadisticas() {
    return this.incidenciasService.getEstadisticas();
  }

  // GET /api/incidencias/:id
  @Get(':id')
  @ApiOperation({ summary: 'Obtener incidencia por ID' })
  findOne(@Param('id') id: string) {
    return this.incidenciasService.findOne(id);
  }

  // POST /api/incidencias
  @Post()
  @ApiOperation({ summary: 'Crear nueva incidencia' })
  create(@Body() body: Record<string, unknown>) {
    return this.incidenciasService.create(body);
  }

  // PUT /api/incidencias/:id
  @Put(':id')
  @ApiOperation({ summary: 'Actualizar incidencia' })
  update(@Param('id') id: string, @Body() body: Record<string, unknown>) {
    return this.incidenciasService.update(id, body);
  }

  // POST /api/incidencias/:id/responder
  @Post(':id/responder')
  @ApiOperation({ summary: 'Responder a una incidencia' })
  responder(
    @Param('id') id: string,
    @Body()
    body: {
      respuesta_admin: string;
      tipo_respuesta: string;
      nuevo_estado_paquete?: string;
      respondido_por?: string;
    },
  ) {
    return this.incidenciasService.responder(id, body);
  }

  // PUT /api/incidencias/:id/resolver
  @Put(':id/resolver')
  @ApiOperation({ summary: 'Marcar incidencia como resuelta' })
  resolver(@Param('id') id: string) {
    return this.incidenciasService.resolver(id);
  }
}
