import {
  Controller, Get, Post, Put, Delete,
  Param, Body,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { RepartidoresService } from './repartidores.service';
import { CreateRepartidorDto } from './dto/create-repartidor.dto';

@ApiTags('Repartidores')
@ApiBearerAuth('JWT')
@Controller('repartidores')
export class RepartidoresController {
  constructor(private readonly repartidoresService: RepartidoresService) {}

  // GET /api/repartidores
  @Get()
  @ApiOperation({ summary: 'Obtener todos los repartidores' })
  findAll() {
    return this.repartidoresService.findAll();
  }

  // GET /api/repartidores/estado/:estado
  @Get('estado/:estado')
  @ApiOperation({ summary: 'Obtener repartidores por estado' })
  findByEstado(@Param('estado') estado: string) {
    return this.repartidoresService.findByEstado(estado);
  }

  // GET /api/repartidores/ciudad/:ciudad
  @Get('ciudad/:ciudad')
  @ApiOperation({ summary: 'Obtener repartidores por ciudad' })
  findByCiudad(@Param('ciudad') ciudad: string) {
    return this.repartidoresService.findByCiudad(ciudad);
  }

  // GET /api/repartidores/:id
  @Get(':id')
  @ApiOperation({ summary: 'Obtener repartidor por ID' })
  findOne(@Param('id') id: string) {
    return this.repartidoresService.findOne(id);
  }

  // POST /api/repartidores
  @Post()
  @ApiOperation({ summary: 'Crear nuevo repartidor' })
  create(@Body() dto: CreateRepartidorDto) {
    return this.repartidoresService.create(dto);
  }

  // PUT /api/repartidores/:id
  @Put(':id')
  @ApiOperation({ summary: 'Actualizar repartidor' })
  update(@Param('id') id: string, @Body() body: Record<string, unknown>) {
    return this.repartidoresService.update(id, body);
  }

  // PUT /api/repartidores/:id/ubicacion
  @Put(':id/ubicacion')
  @ApiOperation({ summary: 'Actualizar ubicación GPS del repartidor' })
  updateUbicacion(
    @Param('id') id: string,
    @Body() body: { latitud: number; longitud: number },
  ) {
    return this.repartidoresService.updateUbicacion(id, body);
  }

  // DELETE /api/repartidores/:id
  @Delete(':id')
  @ApiOperation({ summary: 'Desactivar repartidor (soft delete)' })
  remove(@Param('id') id: string) {
    return this.repartidoresService.remove(id);
  }
}
