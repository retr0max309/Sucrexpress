import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseService } from '../common/supabase/supabase.service';

const GEOCODING_URL = 'https://maps.googleapis.com/maps/api/geocode/json';
const ROUTES_URL = 'https://routes.googleapis.com/directions/v2:computeRoutes';

@Injectable()
export class RutasService {
  constructor(
    private readonly supabase: SupabaseService,
    private readonly config: ConfigService,
  ) {}

  async findAll(filters: { repartidor_id?: string; estado?: string }) {
    const admin = this.supabase.getAdmin();
    let query = admin
      .from('rutas')
      .select('*, repartidores(nombre_completo, foto_perfil_url, ciudad)')
      .order('created_at', { ascending: false });

    if (filters.repartidor_id) query = query.eq('repartidor_id', filters.repartidor_id);
    if (filters.estado) query = query.eq('estado', filters.estado);

    const { data, error } = await query;
    if (error) throw new BadRequestException(error.message);
    return { success: true, data: data || [] };
  }

  async findOne(id: string) {
    const admin = this.supabase.getAdmin();
    const { data, error } = await admin
      .from('rutas')
      .select('*, repartidores(nombre_completo, foto_perfil_url, ciudad, telefono)')
      .eq('id', id)
      .single();

    if (error || !data) throw new NotFoundException('Ruta no encontrada');
    return { success: true, data };
  }

  async create(body: Record<string, unknown>) {
    const admin = this.supabase.getAdmin();
    const { data, error } = await admin
      .from('rutas')
      .insert([{ ...body, estado: 'pendiente', calculada_at: new Date().toISOString() }])
      .select()
      .single();

    if (error) throw new BadRequestException(error.message);
    return { success: true, message: 'Ruta creada exitosamente', data };
  }

  async update(id: string, body: Record<string, unknown>) {
    const admin = this.supabase.getAdmin();

    // Si viene un estado, registrar timestamp correspondiente
    const timestampField: Record<string, string> = {
      en_progreso: 'iniciada_at',
      completada: 'completada_at',
      enviada: 'enviada_at',
    };

    const estado = body.estado as string | undefined;
    const extraCampos: Record<string, unknown> = {};
    if (estado && timestampField[estado]) {
      extraCampos[timestampField[estado]] = new Date().toISOString();
    }

    const { data, error } = await admin
      .from('rutas')
      .update({ ...body, ...extraCampos, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error || !data) throw new NotFoundException('Ruta no encontrada');
    return { success: true, message: 'Ruta actualizada', data };
  }

  async calcular(body: { repartidor_id: string; paquete_ids: string[] }) {
    const { repartidor_id, paquete_ids } = body;
    const apiKey = this.config.get<string>('GOOGLE_ROUTES_API_KEY');

    if (!repartidor_id || !paquete_ids?.length) {
      throw new BadRequestException('Se requiere repartidor_id y al menos un paquete_id');
    }
    if (paquete_ids.length > 10) {
      throw new BadRequestException('Máximo 10 paquetes por ruta');
    }

    const admin = this.supabase.getAdmin();

    // 1. Obtener repartidor
    const { data: repartidor, error: repError } = await admin
      .from('repartidores')
      .select('id, nombre_completo, latitud_actual, longitud_actual')
      .eq('id', repartidor_id)
      .single();

    if (repError || !repartidor) {
      throw new NotFoundException('Repartidor no encontrado');
    }
    if (!repartidor.latitud_actual || !repartidor.longitud_actual) {
      throw new UnprocessableEntityException(
        'El repartidor no tiene ubicación GPS registrada. Debe tener la app móvil activa.',
      );
    }

    // 2. Obtener paquetes
    const { data: paquetes, error: paqError } = await admin
      .from('paquetes')
      .select('id, numero_guia, nombre_destinatario, apellido_destinatario, direccion_destino, direccion_exacta, ciudad_destino, latitud_destino, longitud_destino')
      .in('id', paquete_ids);

    if (paqError || !paquetes?.length) {
      throw new NotFoundException('No se encontraron los paquetes especificados');
    }

    // 3. Geocodificar paquetes sin coordenadas
    const paquetesConCoords = await Promise.all(
      paquetes.map(async (p) => {
        if (p.latitud_destino && p.longitud_destino) {
          return { ...p, lat: parseFloat(p.latitud_destino), lng: parseFloat(p.longitud_destino) };
        }
        const direccionCompleta = `${p.direccion_destino || p.direccion_exacta}, ${p.ciudad_destino}, Bolivia`;
        const url = `${GEOCODING_URL}?address=${encodeURIComponent(direccionCompleta)}&key=${apiKey}`;
        const res = await fetch(url);
        const json = await res.json() as { status: string; results?: Array<{ geometry: { location: { lat: number; lng: number } } }> };

        if (json.status !== 'OK' || !json.results?.[0]) {
          throw new BadRequestException(`No se pudo geocodificar: ${direccionCompleta}`);
        }

        const { lat, lng } = json.results[0].geometry.location;

        // Guardar coordenadas para no volver a geocodificar
        await admin
          .from('paquetes')
          .update({ latitud_destino: lat, longitud_destino: lng, geocodificado_at: new Date().toISOString() })
          .eq('id', p.id);

        return { ...p, lat, lng };
      }),
    );

    // 4. Construir payload para Google Routes API
    const origenLatLng = {
      latitude: parseFloat(repartidor.latitud_actual),
      longitude: parseFloat(repartidor.longitud_actual),
    };

    const destinoLatLng =
      paquetesConCoords.length === 1
        ? { latitude: paquetesConCoords[0].lat, longitude: paquetesConCoords[0].lng }
        : origenLatLng;

    const intermedios =
      paquetesConCoords.length > 1
        ? paquetesConCoords.map((p) => ({
            location: { latLng: { latitude: p.lat, longitude: p.lng } },
          }))
        : [];

    const routesPayload: Record<string, unknown> = {
      origin: { location: { latLng: origenLatLng } },
      destination: { location: { latLng: destinoLatLng } },
      ...(intermedios.length > 0 && { intermediates: intermedios }),
      travelMode: 'DRIVE',
      routingPreference: 'TRAFFIC_AWARE',
      optimizeWaypointOrder: paquetesConCoords.length > 1,
      computeAlternativeRoutes: false,
      routeModifiers: { avoidTolls: false, avoidHighways: false },
      languageCode: 'es',
      units: 'METRIC',
    };

    const routesRes = await fetch(ROUTES_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey!,
        'X-Goog-FieldMask':
          'routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline,routes.optimizedIntermediateWaypointIndex',
      },
      body: JSON.stringify(routesPayload),
    });

    const routesData = await routesRes.json() as { routes?: Array<{ polyline?: { encodedPolyline: string }; distanceMeters?: number; duration?: string; optimizedIntermediateWaypointIndex?: number[] }> };

    if (!routesData.routes?.[0]) {
      throw new BadRequestException('No se pudo calcular la ruta. Verifica que las direcciones sean válidas.');
    }

    const route = routesData.routes[0];
    const waypointOrder =
      route.optimizedIntermediateWaypointIndex || paquetesConCoords.map((_, i) => i);

    // 5. Reordenar paquetes según el orden optimizado
    const paquetesOrdenados = (waypointOrder as number[]).map((originalIndex: number, orden: number) => {
      const p = paquetesConCoords[originalIndex];
      return {
        orden: orden + 1,
        paquete_id: p.id,
        numero_guia: p.numero_guia,
        destinatario: `${p.nombre_destinatario} ${p.apellido_destinatario || ''}`.trim(),
        direccion: p.direccion_destino || p.direccion_exacta,
        ciudad: p.ciudad_destino,
        lat: p.lat,
        lng: p.lng,
      };
    });

    return {
      success: true,
      data: {
        repartidor_id,
        origen_lat: parseFloat(repartidor.latitud_actual),
        origen_lng: parseFloat(repartidor.longitud_actual),
        polyline: route.polyline?.encodedPolyline || null,
        distancia_total_m: route.distanceMeters || 0,
        duracion_estimada_s: parseInt(route.duration?.replace('s', '') || '0'),
        paquetes_orden: paquetesOrdenados,
      },
    };
  }
}
