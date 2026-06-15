import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { getConnection } from '@/lib/config/database';

const GOOGLE_ROUTES_KEY = process.env.GOOGLE_ROUTES_API_KEY;
const GEOCODING_URL = 'https://maps.googleapis.com/maps/api/geocode/json';
const ROUTES_URL = 'https://routes.googleapis.com/directions/v2:computeRoutes';

// Geocodifica una dirección y guarda las coordenadas en la tabla paquetes
async function geocodificarDireccion(paquete, admin) {
  // Si ya tiene coordenadas guardadas, las reutilizamos
  if (paquete.latitud_destino && paquete.longitud_destino) {
    return { lat: parseFloat(paquete.latitud_destino), lng: parseFloat(paquete.longitud_destino) };
  }

  const direccionCompleta = `${paquete.direccion_destino || paquete.direccion_exacta}, ${paquete.ciudad_destino}, Bolivia`;
  const url = `${GEOCODING_URL}?address=${encodeURIComponent(direccionCompleta)}&key=${GOOGLE_ROUTES_KEY}`;

  const res = await fetch(url);
  const json = await res.json();

  if (json.status !== 'OK' || !json.results?.[0]) {
    throw new Error(`No se pudo geocodificar la dirección: ${direccionCompleta}`);
  }

  const { lat, lng } = json.results[0].geometry.location;

  // Guardar para no volver a geocodificar
  await admin
    .from('paquetes')
    .update({ latitud_destino: lat, longitud_destino: lng, geocodificado_at: new Date().toISOString() })
    .eq('id', paquete.id);

  return { lat, lng };
}

// POST /api/rutas/calcular
export async function POST(request) {
  const auth = verifyAuth(request);
  if (!auth.success) return NextResponse.json(auth, { status: auth.status });

  try {
    const { repartidor_id, paquete_ids } = await request.json();

    if (!repartidor_id || !paquete_ids?.length) {
      return NextResponse.json({ success: false, message: 'Se requiere repartidor_id y al menos un paquete_id' }, { status: 400 });
    }
    if (paquete_ids.length > 10) {
      return NextResponse.json({ success: false, message: 'Máximo 10 paquetes por ruta' }, { status: 400 });
    }

    const { admin } = await getConnection();

    // 1. Obtener repartidor (necesitamos su ubicación actual)
    const { data: repartidor, error: repError } = await admin
      .from('repartidores')
      .select('id, nombre_completo, latitud_actual, longitud_actual')
      .eq('id', repartidor_id)
      .single();

    if (repError || !repartidor) {
      return NextResponse.json({ success: false, message: 'Repartidor no encontrado' }, { status: 404 });
    }
    if (!repartidor.latitud_actual || !repartidor.longitud_actual) {
      return NextResponse.json({ success: false, message: 'El repartidor no tiene ubicación GPS registrada. Debe tener la app móvil activa.' }, { status: 422 });
    }

    // 2. Obtener paquetes
    const { data: paquetes, error: paqError } = await admin
      .from('paquetes')
      .select('id, numero_guia, nombre_destinatario, apellido_destinatario, direccion_destino, direccion_exacta, ciudad_destino, latitud_destino, longitud_destino')
      .in('id', paquete_ids);

    if (paqError || !paquetes?.length) {
      return NextResponse.json({ success: false, message: 'No se encontraron los paquetes especificados' }, { status: 404 });
    }

    // 3. Geocodificar paquetes sin coordenadas
    const paquetesConCoords = await Promise.all(
      paquetes.map(async (p) => {
        const coords = await geocodificarDireccion(p, admin);
        return { ...p, lat: coords.lat, lng: coords.lng };
      })
    );

    // 4. Construir payload para Google Routes API
    // Coordenadas del repartidor (punto de partida y de llegada si hay múltiples paquetes)
    const origenLatLng = {
      latitude: parseFloat(repartidor.latitud_actual),
      longitude: parseFloat(repartidor.longitud_actual)
    };

    // Si hay 1 paquete: origen→paquete. Si hay varios: origen→paquetes(optimizados)→origen
    const destinoLatLng = paquetesConCoords.length === 1
      ? { latitude: paquetesConCoords[0].lat, longitude: paquetesConCoords[0].lng }
      : origenLatLng;

    // Los intermedios solo se usan cuando hay más de 1 paquete
    const intermedios = paquetesConCoords.length > 1
      ? paquetesConCoords.map(p => ({
          location: { latLng: { latitude: p.lat, longitude: p.lng } }
        }))
      : [];

    const routesPayload = {
      origin:      { location: { latLng: origenLatLng } },
      destination: { location: { latLng: destinoLatLng } },
      ...(intermedios.length > 0 && { intermediates: intermedios }),
      travelMode: 'DRIVE',
      routingPreference: 'TRAFFIC_AWARE',
      optimizeWaypointOrder: paquetesConCoords.length > 1,
      computeAlternativeRoutes: false,
      routeModifiers: { avoidTolls: false, avoidHighways: false },
      languageCode: 'es',
      units: 'METRIC'
    };

    const routesRes = await fetch(ROUTES_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': GOOGLE_ROUTES_KEY,
        'X-Goog-FieldMask': 'routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline,routes.optimizedIntermediateWaypointIndex'
      },
      body: JSON.stringify(routesPayload)
    });

    const routesData = await routesRes.json();

    if (!routesData.routes?.[0]) {
      console.error('Google Routes API error:', JSON.stringify(routesData));
      return NextResponse.json({ success: false, message: 'No se pudo calcular la ruta. Verifica que las direcciones sean válidas.', details: routesData }, { status: 502 });
    }

    const route = routesData.routes[0];
    const waypointOrder = route.optimizedIntermediateWaypointIndex || paquetesConCoords.map((_, i) => i);

    // 5. Reordenar paquetes según el orden optimizado
    const paquetesOrdenados = waypointOrder.map((originalIndex, orden) => {
      const p = paquetesConCoords[originalIndex];
      return {
        orden: orden + 1,
        paquete_id: p.id,
        numero_guia: p.numero_guia,
        destinatario: `${p.nombre_destinatario} ${p.apellido_destinatario || ''}`.trim(),
        direccion: p.direccion_destino || p.direccion_exacta,
        ciudad: p.ciudad_destino,
        lat: p.lat,
        lng: p.lng
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        repartidor_id,
        origen_lat: parseFloat(repartidor.latitud_actual),
        origen_lng: parseFloat(repartidor.longitud_actual),
        polyline: route.polyline?.encodedPolyline || null,
        distancia_total_m: route.distanceMeters || 0,
        duracion_estimada_s: parseInt(route.duration?.replace('s', '') || '0'),
        paquetes_orden: paquetesOrdenados
      }
    });

  } catch (error) {
    console.error('Error en /api/rutas/calcular:', error);
    return NextResponse.json({ success: false, message: 'Error interno al calcular la ruta', error: error.message }, { status: 500 });
  }
}
