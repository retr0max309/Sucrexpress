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

function calcularTasaExito(entregados, total) {
  if (total === 0) return 0;
  return parseFloat(((entregados / total) * 100).toFixed(2));
}

function agruparPorCampo(datos, campo) {
  return datos.reduce((acc, item) => {
    const valor = item[campo] || 'Sin especificar';
    acc[valor] = (acc[valor] || 0) + 1;
    return acc;
  }, {});
}

function agruparPorDia(paquetes, fechaInicio, fechaFin) {
  const dias = {};
  const inicio = new Date(fechaInicio);
  const fin = new Date(fechaFin);
  for (let d = new Date(inicio); d <= fin; d.setDate(d.getDate() + 1)) {
    const fechaKey = d.toISOString().split('T')[0];
    dias[fechaKey] = { fecha: fechaKey, total: 0, exitosos: 0, no_exitosos: 0, tasa_exito: 0 };
  }
  paquetes.forEach(paquete => {
    const fechaPaquete = new Date(paquete.fecha_creacion).toISOString().split('T')[0];
    if (dias[fechaPaquete]) {
      dias[fechaPaquete].total++;
      if (paquete.estado === 'entregado') dias[fechaPaquete].exitosos++;
      else dias[fechaPaquete].no_exitosos++;
    }
  });
  Object.keys(dias).forEach(fecha => { dias[fecha].tasa_exito = calcularTasaExito(dias[fecha].exitosos, dias[fecha].total); });
  return Object.values(dias).filter(dia => dia.total > 0);
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
    
    const { data: paquetes, error } = await supabase
      .from('paquetes')
      .select('*')
      .gte('fecha_creacion', fecha_inicio)
      .lte('fecha_creacion', fecha_fin);

    if (error) throw error;

    const totalPaquetes = paquetes.length;
    const entregadosExitosos = paquetes.filter(p => p.estado === 'entregado').length;
    const noEntregados = totalPaquetes - entregadosExitosos;
    const tasaExito = calcularTasaExito(entregadosExitosos, totalPaquetes);

    const porEstado = agruparPorCampo(paquetes, 'estado');
    const porCiudad = agruparPorCampo(paquetes, 'ciudad_destino');
    const porDia = agruparPorDia(paquetes, fecha_inicio, fecha_fin);

    return NextResponse.json({
      success: true,
      data: {
        periodo, fecha_inicio: new Date(fecha_inicio).toISOString().split('T')[0], fecha_fin: new Date(fecha_fin).toISOString().split('T')[0],
        total_paquetes: totalPaquetes, entregados_exitosos: entregadosExitosos, no_entregados: noEntregados, tasa_exito: tasaExito,
        detalle: { por_dia: porDia, por_estado: porEstado, por_ciudad: porCiudad }
      }
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Error al generar reporte de paquetes', error: error.message }, { status: 500 });
  }
}
