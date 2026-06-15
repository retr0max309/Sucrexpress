import {
  Controller, Get, Post, Put, Delete,
  Param, Body, Query,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { PaquetesService } from './paquetes.service';
import { CreatePaqueteDto } from './dto/create-paquete.dto';

@ApiTags('Paquetes')
@ApiBearerAuth('JWT')
@Controller('paquetes')
export class PaquetesController {
  constructor(private readonly paquetesService: PaquetesService) {}

  // GET /api/paquetes?estado=pendiente&ciudad=Cochabamba
  @Get()
  @ApiOperation({ summary: 'Obtener todos los paquetes' })
  @ApiQuery({ name: 'estado', required: false })
  @ApiQuery({ name: 'ciudad', required: false })
  findAll(@Query('estado') estado?: string, @Query('ciudad') ciudad?: string) {
    return this.paquetesService.findAll({ estado, ciudad });
  }

  // GET /api/paquetes/disponibles
  @Get('disponibles')
  @ApiOperation({ summary: 'Obtener paquetes disponibles (pendientes sin repartidor)' })
  getDisponibles() {
    return this.paquetesService.getDisponibles();
  }

  // GET /api/paquetes/:id
  @Get(':id')
  @ApiOperation({ summary: 'Obtener paquete por ID' })
  findOne(@Param('id') id: string) {
    return this.paquetesService.findOne(id);
  }

  // GET /api/paquetes/:id/qr
  @Get(':id/qr')
  @ApiOperation({ summary: 'Obtener QR del paquete' })
  getQR(@Param('id') id: string) {
    return this.paquetesService.getQR(id);
  }

  // POST /api/paquetes
  @Post()
  @ApiOperation({ summary: 'Crear nuevo paquete' })
  create(@Body() dto: CreatePaqueteDto) {
    return this.paquetesService.create(dto);
  }

  // PUT /api/paquetes/:id
  @Put(':id')
  @ApiOperation({ summary: 'Actualizar paquete' })
  update(@Param('id') id: string, @Body() body: Record<string, unknown>) {
    return this.paquetesService.update(id, body);
  }

  // PUT /api/paquetes/:id/asignar
  @Put(':id/asignar')
  @ApiOperation({ summary: 'Asignar paquete a repartidor' })
  asignar(
    @Param('id') id: string,
    @Body() body: { repartidor_id: string; repartidor_nombre: string },
  ) {
    return this.paquetesService.asignar(id, body);
  }

  // PUT /api/paquetes/:id/aceptar
  @Put(':id/aceptar')
  @ApiOperation({ summary: 'Aceptar entrega del paquete' })
  aceptar(@Param('id') id: string, @Body() body: Record<string, unknown>) {
    return this.paquetesService.aceptar(id, body);
  }

  // DELETE /api/paquetes/:id
  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar paquete (solo pendientes)' })
  remove(@Param('id') id: string) {
    return this.paquetesService.remove(id);
  }
}
