import { Injectable, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../common/supabase/supabase.service';

type Periodo = 'hoy' | 'semana' | 'mes';

@Injectable()
export class ReportesService {
  constructor(private readonly supabase: SupabaseService) {}

  private calcularFechas(periodo: Periodo) {
    const ahora = new Date();
    let fechaInicio: Date, fechaFin: Date;

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

  private agruparPorCampo(datos: Record<string, unknown>[], campo: string): Record<string, number> {
    const result: Record<string, number> = {};
    datos.forEach((item) => {
      const valor = (item[campo] as string) || 'Sin especificar';
      result[valor] = (result[valor] || 0) + 1;
    });
    return result;
  }

  private agruparPorDia(paquetes: Record<string, unknown>[], fechaInicio: string, fechaFin: string) {
    const dias: Record<string, { fecha: string; total: number; exitosos: number; no_exitosos: number; tasa_exito: number }> = {};
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);

    for (let d = new Date(inicio); d <= fin; d.setDate(d.getDate() + 1)) {
      const fechaKey = d.toISOString().split('T')[0];
      dias[fechaKey] = { fecha: fechaKey, total: 0, exitosos: 0, no_exitosos: 0, tasa_exito: 0 };
    }

    paquetes.forEach((p) => {
      const fechaPaquete = new Date(p.fecha_creacion as string).toISOString().split('T')[0];
      if (dias[fechaPaquete]) {
        dias[fechaPaquete].total++;
        if (p.estado === 'entregado') dias[fechaPaquete].exitosos++;
        else dias[fechaPaquete].no_exitosos++;
      }
    });

    Object.keys(dias).forEach((fecha) => {
      const d = dias[fecha];
      d.tasa_exito = d.total === 0 ? 0 : parseFloat(((d.exitosos / d.total) * 100).toFixed(2));
    });

    return Object.values(dias).filter((d) => d.total > 0);
  }

  async reportePaquetes(periodo: string = 'mes') {
    if (!['hoy', 'semana', 'mes'].includes(periodo)) {
      throw new BadRequestException('Período inválido. Usa: hoy, semana o mes');
    }

    const { fecha_inicio, fecha_fin } = this.calcularFechas(periodo as Periodo);
    const admin = this.supabase.getAdmin();

    const { data: paquetes, error } = await admin
      .from('paquetes')
      .select('*')
      .gte('fecha_creacion', fecha_inicio)
      .lte('fecha_creacion', fecha_fin);

    if (error) throw new BadRequestException(error.message);

    const total = paquetes.length;
    const entregados = paquetes.filter((p) => p.estado === 'entregado').length;
    const noEntregados = total - entregados;
    const tasaExito = total === 0 ? 0 : parseFloat(((entregados / total) * 100).toFixed(2));

    return {
      success: true,
      data: {
        periodo,
        fecha_inicio: new Date(fecha_inicio).toISOString().split('T')[0],
        fecha_fin: new Date(fecha_fin).toISOString().split('T')[0],
        total_paquetes: total,
        entregados_exitosos: entregados,
        no_entregados: noEntregados,
        tasa_exito: tasaExito,
        detalle: {
          por_dia: this.agruparPorDia(paquetes, fecha_inicio, fecha_fin),
          por_estado: this.agruparPorCampo(paquetes, 'estado'),
          por_ciudad: this.agruparPorCampo(paquetes, 'ciudad_destino'),
        },
      },
    };
  }

  async reporteIncidencias(periodo: string = 'mes') {
    if (!['hoy', 'semana', 'mes'].includes(periodo)) {
      throw new BadRequestException('Período inválido. Usa: hoy, semana o mes');
    }

    const { fecha_inicio, fecha_fin } = this.calcularFechas(periodo as Periodo);
    const admin = this.supabase.getAdmin();

    const { data: incidencias, error } = await admin
      .from('incidencias')
      .select('*')
      .gte('fecha_reporte', fecha_inicio)
      .lte('fecha_reporte', fecha_fin);

    if (error) throw new BadRequestException(error.message);

    const tiemposRespuesta = incidencias
      .filter((i) => i.fecha_respuesta && i.fecha_reporte)
      .map((i) => (new Date(i.fecha_respuesta).getTime() - new Date(i.fecha_reporte).getTime()) / (1000 * 60 * 60));

    const tiempoPromedio =
      tiemposRespuesta.length > 0
        ? tiemposRespuesta.reduce((a, b) => a + b, 0) / tiemposRespuesta.length
        : 0;

    // Agrupar por repartidor
    const repMap: Record<string, number> = {};
    for (const inc of incidencias) {
      if (inc.repartidor_id) {
        const { data: rep } = await admin
          .from('repartidores')
          .select('nombre_completo')
          .eq('id', inc.repartidor_id)
          .single();
        if (rep) {
          repMap[rep.nombre_completo] = (repMap[rep.nombre_completo] || 0) + 1;
        }
      }
    }

    const incidenciasPorRepartidor = Object.entries(repMap)
      .map(([nombre, cantidad]) => ({ nombre, cantidad }))
      .sort((a, b) => b.cantidad - a.cantidad);

    return {
      success: true,
      data: {
        periodo,
        fecha_inicio: new Date(fecha_inicio).toISOString().split('T')[0],
        fecha_fin: new Date(fecha_fin).toISOString().split('T')[0],
        total_incidencias: incidencias.length,
        por_estado: this.agruparPorCampo(incidencias, 'estado'),
        por_tipo: this.agruparPorCampo(incidencias, 'tipo_incidencia'),
        tiempo_promedio_respuesta_horas: parseFloat(tiempoPromedio.toFixed(2)),
        incidencias_por_repartidor: incidenciasPorRepartidor,
      },
    };
  }
}
