import { NextResponse } from 'next/server';
import { getConnection } from '@/lib/config/database';
import { verifyAuth } from '@/lib/auth';

export async function PUT(request, { params }) {
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

    const { data: incidenciaActualizada, error: errorUpdate } = await admin
      .from('incidencias')
      .update({ estado: 'resuelta', updated_at: ahora })
      .eq('id', id)
      .select()
      .single();

    if (errorUpdate) throw errorUpdate;

    return NextResponse.json({ success: true, message: 'Incidencia marcada como resuelta', data: incidenciaActualizada });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Error al resolver incidencia', error: error.message }, { status: 500 });
  }
}
