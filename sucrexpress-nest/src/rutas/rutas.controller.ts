import {
  Controller, Get, Post, Put,
  Param, Body, Query,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { RutasService } from './rutas.service';

@ApiTags('Rutas')
@ApiBearerAuth('JWT')
@Controller('rutas')
export class RutasController {
  constructor(private readonly rutasService: RutasService) {}

  // GET /api/rutas?repartidor_id=xxx&estado=pendiente
  @Get()
  @ApiOperation({ summary: 'Obtener todas las rutas' })
  @ApiQuery({ name: 'repartidor_id', required: false })
  @ApiQuery({ name: 'estado', required: false })
  findAll(
    @Query('repartidor_id') repartidor_id?: string,
    @Query('estado') estado?: string,
  ) {
    return this.rutasService.findAll({ repartidor_id, estado });
  }

  // GET /api/rutas/:id
  @Get(':id')
  @ApiOperation({ summary: 'Obtener ruta por ID' })
  findOne(@Param('id') id: string) {
    return this.rutasService.findOne(id);
  }

  // POST /api/rutas
  @Post()
  @ApiOperation({ summary: 'Crear nueva ruta' })
  create(@Body() body: Record<string, unknown>) {
    return this.rutasService.create(body);
  }

  // PUT /api/rutas/:id
  @Put(':id')
  @ApiOperation({ summary: 'Actualizar ruta (incluyendo cambio de estado)' })
  update(@Param('id') id: string, @Body() body: Record<string, unknown>) {
    return this.rutasService.update(id, body);
  }

  // POST /api/rutas/calcular
  @Post('calcular')
  @ApiOperation({ summary: 'Calcular ruta óptima con Google Routes API' })
  calcular(@Body() body: { repartidor_id: string; paquete_ids: string[] }) {
    return this.rutasService.calcular(body);
  }
}
