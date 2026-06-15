import { NextResponse } from 'next/server';
import { getConnection } from '@/lib/config/database';
import { verifyAuth } from '@/lib/auth';

export async function GET(request, { params }) {
  const auth = verifyAuth(request);
  if (!auth.success) return NextResponse.json(auth, { status: auth.status });

  try {
    const { id } = await params;
    const { admin } = await getConnection();

    const { data: incidencia, error: errorIncidencia } = await admin
      .from('incidencias')
      .select('*')
      .eq('id', id)
      .single();

    if (errorIncidencia || !incidencia) {
      return NextResponse.json({ success: false, message: 'Incidencia no encontrada' }, { status: 404 });
    }

    let datosDestinario = { nombre_destinatario: 'No disponible', direccion_entrega: 'No disponible', telefono_destinatario: 'No disponible' };
    if (incidencia.paquete_id) {
      const { data: paquete } = await admin.from('paquetes').select('numero_guia, nombre_destinatario, direccion_exacta, telefono_destinatario').eq('id', incidencia.paquete_id).single();
      if (paquete) {
        datosDestinario = { nombre_destinatario: paquete.nombre_destinatario || 'No disponible', direccion_entrega: paquete.direccion_exacta || 'No disponible', telefono_destinatario: paquete.telefono_destinatario || 'No disponible' };
      }
    }

    let datosRepartidor = { repartidor_nombre: 'No disponible', repartidor_ciudad: 'No disponible' };
    if (incidencia.repartidor_id) {
      let { data: repartidor, error: errorRepartidor } = await admin.from('repartidores').select('nombre_completo, ciudad').eq('id', incidencia.repartidor_id).single();
      if (errorRepartidor && errorRepartidor.code === 'PGRST116') {
        const result = await admin.from('repartidores').select('nombre_completo, ciudad').eq('uid', incidencia.repartidor_id);
        repartidor = result.data?.[0] || null;
      }
      if (repartidor) {
        datosRepartidor = { repartidor_nombre: repartidor.nombre_completo || 'No disponible', repartidor_ciudad: repartidor.ciudad || 'No disponible' };
      }
    }

    const incidenciaFormateada = { ...incidencia, ...datosDestinario, ...datosRepartidor };

    return NextResponse.json({ success: true, data: incidenciaFormateada });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Error al obtener incidencia', error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const auth = verifyAuth(request);
  if (!auth.success) return NextResponse.json(auth, { status: auth.status });

  try {
    const { id } = await params;
    const { admin } = await getConnection();

    const { data: incidencia, error: errorIncidencia } = await admin.from('incidencias').select('*').eq('id', id).single();
    if (errorIncidencia || !incidencia) {
      return NextResponse.json({ success: false, message: 'Incidencia no encontrada' }, { status: 404 });
    }

    const ahora = new Date().toISOString();
    const { error: errorUpdate } = await admin.from('incidencias').update({ estado: 'cancelada', updated_at: ahora }).eq('id', id);

    if (errorUpdate) throw errorUpdate;

    return NextResponse.json({ success: true, message: 'Incidencia cancelada' });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Error al cancelar incidencia', error: error.message }, { status: 500 });
  }
}
