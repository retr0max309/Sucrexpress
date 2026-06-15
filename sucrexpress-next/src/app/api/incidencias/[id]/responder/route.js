import { NextResponse } from 'next/server';
import { getConnection } from '@/lib/config/database';
import { verifyAuth } from '@/lib/auth';

export async function POST(request, { params }) {
  const auth = verifyAuth(request);
  if (!auth.success) return NextResponse.json(auth, { status: auth.status });

  try {
    const { id } = await params;
    const { respuesta_admin, tipo_respuesta, nuevo_estado_paquete, respondido_por } = await request.json();
    const { admin } = await getConnection();

    if (!respuesta_admin || typeof respuesta_admin !== 'string' || respuesta_admin.trim().length === 0) {
      return NextResponse.json({ success: false, message: 'La respuesta es obligatoria y debe ser texto válido', validationError: 'respuesta_admin' }, { status: 400 });
    }

    if (!tipo_respuesta) {
      return NextResponse.json({ success: false, message: 'El tipo de respuesta es obligatorio', validationError: 'tipo_respuesta' }, { status: 400 });
    }

    const { data: incidencia, error: errorBusqueda } = await admin.from('incidencias').select('*').eq('id', id).single();

    if (errorBusqueda || !incidencia) {
      return NextResponse.json({ success: false, message: 'Incidencia no encontrada' }, { status: 404 });
    }

    const ahora = new Date().toISOString();
    const camposActualizar = {
      estado: 'respondida',
      respuesta_admin: respuesta_admin.trim(),
      tipo_respuesta: tipo_respuesta.trim(),
      fecha_respuesta: ahora,
      updated_at: ahora
    };

    if (nuevo_estado_paquete && nuevo_estado_paquete.trim() !== '') camposActualizar.nuevo_estado_paquete = nuevo_estado_paquete.trim();
    if (respondido_por && respondido_por.trim() !== '') camposActualizar.respondido_por = respondido_por.trim();

    const { data: incidenciaActualizada, error: errorActualizacion } = await admin.from('incidencias').update(camposActualizar).eq('id', id).select().single();

    if (errorActualizacion || !incidenciaActualizada) {
      return NextResponse.json({ success: false, message: 'Error al actualizar incidencia en base de datos' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Incidencia respondida exitosamente', data: incidenciaActualizada });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Error al responder incidencia', error: error.message }, { status: 500 });
  }
}
