import { NextResponse } from 'next/server';
import Ruta from '@/lib/models/Ruta';
import { verifyAuth } from '@/lib/auth';

// GET /api/rutas?repartidor_id=...&estado=...
export async function GET(request) {
  const auth = verifyAuth(request);
  if (!auth.success) return NextResponse.json(auth, { status: auth.status });

  try {
    const { searchParams } = new URL(request.url);
    const repartidor_id = searchParams.get('repartidor_id');
    const estado = searchParams.get('estado');

    const rutas = await Ruta.getAll({ repartidor_id, estado });
    return NextResponse.json({ success: true, data: rutas, total: rutas.length });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Error al obtener rutas', error: error.message }, { status: 500 });
  }
}

// POST /api/rutas — guardar ruta calculada
export async function POST(request) {
  const auth = verifyAuth(request);
  if (!auth.success) return NextResponse.json(auth, { status: auth.status });

  try {
    const body = await request.json();
    const { repartidor_id, origen_lat, origen_lng, polyline, distancia_total_m, duracion_estimada_s, paquetes_orden } = body;

    if (!repartidor_id || !origen_lat || !origen_lng || !paquetes_orden?.length) {
      return NextResponse.json({ success: false, message: 'Faltan campos requeridos: repartidor_id, origen_lat, origen_lng, paquetes_orden' }, { status: 400 });
    }

    const ruta = await Ruta.create({ repartidor_id, origen_lat, origen_lng, polyline, distancia_total_m, duracion_estimada_s, paquetes_orden });
    return NextResponse.json({ success: true, message: 'Ruta guardada exitosamente', data: ruta }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Error al guardar la ruta', error: error.message }, { status: 500 });
  }
}
