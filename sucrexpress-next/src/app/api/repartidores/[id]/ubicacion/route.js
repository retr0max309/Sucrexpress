import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { getConnection } from '@/lib/config/database';

// GET /api/repartidores/[id]/ubicacion — obtener ubicación actual del repartidor
export async function GET(request, { params }) {
  const auth = verifyAuth(request);
  if (!auth.success) return NextResponse.json(auth, { status: auth.status });

  try {
    const { id } = await params;
    const { admin } = await getConnection();

    const { data, error } = await admin
      .from('repartidores')
      .select('id, nombre_completo, latitud_actual, longitud_actual, ultima_ubicacion_at, estado, foto_perfil_url')
      .eq('id', id)
      .single();

    if (error || !data) {
      return NextResponse.json({ success: false, message: 'Repartidor no encontrado' }, { status: 404 });
    }

    const tieneUbicacion = !!(data.latitud_actual && data.longitud_actual);
    return NextResponse.json({
      success: true,
      data: {
        ...data,
        tiene_ubicacion: tieneUbicacion
      }
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Error al obtener ubicación', error: error.message }, { status: 500 });
  }
}
