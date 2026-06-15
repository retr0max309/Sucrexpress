import { NextResponse } from 'next/server';
import { getConnection } from '@/lib/config/database';
import { verifyAuth } from '@/lib/auth';

function calcularFechas(periodo) {
  const ahora = new Date();
  let fechaInicio, fechaFin;
  if (periodo === 'hoy') {
    fechaInicio = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate(), 0, 0, 0);
    fechaFin = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate(), 23, 59, 59);
  } else if (periodo === 'semana') {
    fechaInicio = new Date(ahora.getTime() - 7 * 24 * 60 * 60 * 1000);
    fechaFin = ahora;
  } else {
    fechaInicio = new Date(ahora.getFullYear(), ahora.getMonth(), 1, 0, 0, 0);
    fechaFin = ahora;
  }
  return { fecha_inicio: fechaInicio.toISOString(), fecha_fin: fechaFin.toISOString() };
}

function agruparPorCampo(datos, campo) {
  return datos.reduce((acc, item) => {
    const valor = item[campo] || 'Sin especificar';
    acc[valor] = (acc[valor] || 0) + 1;
    return acc;
  }, {});
}

export async function GET(request) {
  const auth = verifyAuth(request);
  if (!auth.success) return NextResponse.json(auth, { status: auth.status });

  try {
    const { searchParams } = new URL(request.url);
    const periodo = searchParams.get('periodo') || 'mes';

    if (!['hoy', 'semana', 'mes'].includes(periodo)) {
      return NextResponse.json({ success: false, message: 'Período inválido. Usa: hoy, semana o mes' }, { status: 400 });
    }

    const { fecha_inicio, fecha_fin } = calcularFechas(periodo);
    const { admin: supabase } = await getConnection();
    
    const { data: incidencias, error } = await supabase
      .from('incidencias')
      .select('*')
      .gte('fecha_reporte', fecha_inicio)
      .lte('fecha_reporte', fecha_fin);

    if (error) throw error;

    const totalIncidencias = incidencias.length;
    const porEstado = agruparPorCampo(incidencias, 'estado');
    const porTipo = agruparPorCampo(incidencias, 'tipo_incidencia');

    const tiemposRespuesta = incidencias
      .filter(inc => inc.fecha_respuesta && inc.fecha_reporte)
      .map(inc => (new Date(inc.fecha_respuesta) - new Date(inc.fecha_reporte)) / (1000 * 60 * 60));

    const tiempoPromedioRespuesta = tiemposRespuesta.length > 0
      ? tiemposRespuesta.reduce((a, b) => a + b, 0) / tiemposRespuesta.length
      : 0;

    const incidenciasPorRepartidorMap = {};
    for (const inc of incidencias) {
      if (inc.repartidor_id) {
        const { data: repartidor } = await supabase.from('repartidores').select('nombre_completo').eq('id', inc.repartidor_id).single();
        if (repartidor) {
          const nombreCompleto = repartidor.nombre_completo;
          incidenciasPorRepartidorMap[nombreCompleto] = (incidenciasPorRepartidorMap[nombreCompleto] || 0) + 1;
        }
      }
    }

    const incidenciasPorRepartidorArray = Object.entries(incidenciasPorRepartidorMap)
      .map(([nombre, cantidad]) => ({ nombre, cantidad }))
      .sort((a, b) => b.cantidad - a.cantidad);

    return NextResponse.json({
      success: true,
      data: {
        periodo, fecha_inicio: new Date(fecha_inicio).toISOString().split('T')[0], fecha_fin: new Date(fecha_fin).toISOString().split('T')[0],
        total_incidencias: totalIncidencias, por_estado: porEstado, por_tipo: porTipo,
        tiempo_promedio_respuesta_horas: parseFloat(tiempoPromedioRespuesta.toFixed(2)),
        incidencias_por_repartidor: incidenciasPorRepartidorArray
      }
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Error al generar reporte de incidencias', error: error.message }, { status: 500 });
  }
}
