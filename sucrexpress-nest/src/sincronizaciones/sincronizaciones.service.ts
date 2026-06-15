import { Injectable, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../common/supabase/supabase.service';

@Injectable()
export class SincronizacionesService {
  constructor(private readonly supabase: SupabaseService) {}

  private mapearTipoEventoPaquete(estado: string) {
    const mapeo: Record<string, { tipo_evento: string; icono_fa: string }> = {
      entregado: { tipo_evento: 'entregado', icono_fa: 'fas fa-check-circle' },
      en_ruta: { tipo_evento: 'en_ruta', icono_fa: 'fas fa-truck' },
      devuelto: { tipo_evento: 'devuelto', icono_fa: 'fas fa-undo' },
      en_ruta_con_incidencia: { tipo_evento: 'con_incidencia', icono_fa: 'fas fa-exclamation-circle' },
    };
    return mapeo[estado] || { tipo_evento: estado, icono_fa: 'fas fa-box' };
  }

  private mapearTipoEventoIncidencia(tipo_incidencia: string) {
    const mapeo: Record<string, { tipo_evento: string; icono_fa: string }> = {
      accidente_transito: { tipo_evento: 'accidente', icono_fa: 'fas fa-car-crash' },
      destinatario_ausente: { tipo_evento: 'destinatario_ausente', icono_fa: 'fas fa-user-slash' },
      direccion_incorrecta: { tipo_evento: 'direccion_incorrecta', icono_fa: 'fas fa-map-location-dot' },
      paquete_danado: { tipo_evento: 'danado', icono_fa: 'fas fa-box-open' },
      falla_vehiculo: { tipo_evento: 'falla_vehiculo', icono_fa: 'fas fa-engine-warning' },
      retencion_policial: { tipo_evento: 'retencion', icono_fa: 'fas fa-shield-halved' },
      otra: { tipo_evento: 'otra', icono_fa: 'fas fa-circle-exclamation' },
    };
    return mapeo[tipo_incidencia] || { tipo_evento: 'otra', icono_fa: 'fas fa-circle-exclamation' };
  }

  async getSincronizaciones(limite: number = 10) {
    const admin = this.supabase.getAdmin();

    const { data: paquetes, error: errPaq } = await admin
      .from('paquetes')
      .select('id, numero_guia, nombre_destinatario, ciudad_destino, estado, updated_at')
      .order('updated_at', { ascending: false })
      .limit(limite);

    if (errPaq) throw new BadRequestException(errPaq.message);

    const { data: incidencias, error: errInc } = await admin
      .from('incidencias')
      .select('id, numero_guia, repartidor_id, tipo_incidencia, estado, updated_at')
      .order('updated_at', { ascending: false })
      .limit(limite);

    if (errInc) throw new BadRequestException(errInc.message);

    const paquetesMapeados = paquetes.map((p) => {
      const { tipo_evento, icono_fa } = this.mapearTipoEventoPaquete(p.estado);
      return {
        id: p.id,
        tipo: 'paquete',
        tipo_evento,
        icono_fa,
        numero_guia: p.numero_guia,
        destinatario: p.nombre_destinatario,
        ciudad: p.ciudad_destino,
        estado: p.estado,
        timestamp: p.updated_at,
      };
    });

    const incidenciasMapeadas = await Promise.all(
      incidencias.map(async (inc) => {
        const { data: rep } = await admin
          .from('repartidores')
          .select('nombre_completo')
          .eq('uid', inc.repartidor_id)
          .single();
        const { tipo_evento, icono_fa } = this.mapearTipoEventoIncidencia(inc.tipo_incidencia);
        return {
          id: inc.id,
          tipo: 'incidencia',
          tipo_evento,
          icono_fa,
          numero_guia: inc.numero_guia,
          repartidor: rep?.nombre_completo || 'Desconocido',
          tipo_incidencia: inc.tipo_incidencia,
          estado_incidencia: inc.estado,
          timestamp: inc.updated_at,
        };
      }),
    );

    const combinados = [...paquetesMapeados, ...incidenciasMapeadas]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limite);

    return { success: true, data: combinados };
  }

  async getCambios(desdeTimestamp: string, limite: number = 10) {
    const admin = this.supabase.getAdmin();

    const { data: paquetes, error: errPaq } = await admin
      .from('paquetes')
      .select('id, numero_guia, nombre_destinatario, ciudad_destino, estado, updated_at')
      .gt('updated_at', desdeTimestamp)
      .order('updated_at', { ascending: false })
      .limit(limite);

    if (errPaq) throw new BadRequestException(errPaq.message);

    const { data: incidencias, error: errInc } = await admin
      .from('incidencias')
      .select('id, numero_guia, repartidor_id, tipo_incidencia, estado, updated_at')
      .gt('updated_at', desdeTimestamp)
      .order('updated_at', { ascending: false })
      .limit(limite);

    if (errInc) throw new BadRequestException(errInc.message);

    return {
      success: true,
      data: {
        paquetes: paquetes || [],
        incidencias: incidencias || [],
      },
    };
  }
}
