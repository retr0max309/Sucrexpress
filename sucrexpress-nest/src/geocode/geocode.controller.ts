import { Controller, Get, Query, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { GeocodeService } from './geocode.service';

@ApiTags('Geocode')
@ApiBearerAuth('JWT')
@Controller('geocode')
export class GeocodeController {
  constructor(private readonly geocodeService: GeocodeService) {}

  // GET /api/geocode/reverse?lat=-17.39&lng=-66.15
  @Get('reverse')
  @ApiOperation({ summary: 'Geocodificación inversa (coordenadas → dirección)' })
  @ApiQuery({ name: 'lat', required: true })
  @ApiQuery({ name: 'lng', required: true })
  reverseGeocode(@Query('lat') lat: string, @Query('lng') lng: string) {
    if (!lat || !lng) {
      throw new BadRequestException('Se requieren lat y lng');
    }
    return this.geocodeService.reverseGeocode(lat, lng);
  }
}
