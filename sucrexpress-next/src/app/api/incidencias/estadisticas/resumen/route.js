import { NextResponse } from 'next/server';
import { getConnection } from '@/lib/config/database';
import { verifyAuth } from '@/lib/auth';

export async function GET(request) {
  const auth = verifyAuth(request);
  if (!auth.success) return NextResponse.json(auth, { status: auth.status });

  try {
    const { admin } = await getConnection();

    const { data: todasIncidencias, error: errorTotal } = await admin
      .from('incidencias')
      .select('*');

    if (errorTotal) throw errorTotal;

    const totalIncidencias = todasIncidencias.length;

    const porEstado = {
      pendiente: todasIncidencias.filter(i => i.estado === 'pendiente').length,
      respondida: todasIncidencias.filter(i => i.estado === 'respondida').length,
      resuelta: todasIncidencias.filter(i => i.estado === 'resuelta').length,
      cancelada: todasIncidencias.filter(i => i.estado === 'cancelada').length
    };

    const porTipo = {};
    todasIncidencias.forEach(inc => {
      const tipo = inc.tipo_incidencia || 'desconocido';
      porTipo[tipo] = (porTipo[tipo] || 0) + 1;
    });

    return NextResponse.json({
      success: true,
      data: {
        total_incidencias: totalIncidencias,
        por_estado: porEstado,
        por_tipo: porTipo
      }
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Error al obtener estadísticas', error: error.message }, { status: 500 });
  }
}
