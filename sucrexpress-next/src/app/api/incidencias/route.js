import { NextResponse } from 'next/server';
import { getConnection } from '@/lib/config/database';
import { verifyAuth } from '@/lib/auth';

export async function GET(request) {
  const auth = verifyAuth(request);
  if (!auth.success) return NextResponse.json(auth, { status: auth.status });

  try {
    const { admin } = await getConnection();
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const offset = (page - 1) * limit;

    const estado = searchParams.get('estado');
    const tipo_incidencia = searchParams.get('tipo_incidencia');
    const repartidor_id = searchParams.get('repartidor_id');
    const fecha_inicio = searchParams.get('fecha_inicio');
    const fecha_fin = searchParams.get('fecha_fin');
    const search = searchParams.get('search');
    const numero_seguimiento = searchParams.get('numero_seguimiento');

    let query = admin.from('incidencias').select('*', { count: 'exact' });

    if (estado && estado !== 'Todos') query = query.eq('estado', estado);
    if (tipo_incidencia && tipo_incidencia !== 'Todos') query = query.eq('tipo_incidencia', tipo_incidencia);
    if (repartidor_id) query = query.eq('repartidor_id', repartidor_id);
    if (fecha_inicio) query = query.gte('fecha_reporte', fecha_inicio);
    if (fecha_fin) query = query.lte('fecha_reporte', fecha_fin);
    if (search || numero_seguimiento) {
      const searchTerm = search || numero_seguimiento;
      query = query.ilike('numero_guia', `%${searchTerm}%`);
    }

    const { data, error, count } = await query
      .order('fecha_reporte', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        total_pages: Math.ceil((count || 0) / limit)
      }
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Error al obtener incidencias', error: error.message }, { status: 500 });
  }
}
