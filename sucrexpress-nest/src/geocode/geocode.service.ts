import {
  Injectable,
  BadRequestException,
  ServiceUnavailableException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GeocodeService {
  constructor(private readonly config: ConfigService) {}

  async reverseGeocode(lat: string, lng: string) {
    const apiKey = this.config.get<string>('GOOGLE_ROUTES_API_KEY');

    if (!apiKey) {
      throw new ServiceUnavailableException('API key de geocoding no configurada');
    }

    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&language=es&key=${apiKey}`;
    const res = await fetch(url);
    const data = await res.json() as {
      status: string;
      results?: Array<{ formatted_address: string; types: string[] }>;
    };

    if (data.status !== 'OK' || !data.results?.length) {
      throw new UnprocessableEntityException(`Geocoding: ${data.status}`);
    }

    // Preferir street_address o route para mayor precisión
    const mejor =
      data.results.find(
        (r) => r.types.includes('street_address') || r.types.includes('route'),
      ) || data.results[0];

    return { success: true, address: mejor.formatted_address };
  }
}
