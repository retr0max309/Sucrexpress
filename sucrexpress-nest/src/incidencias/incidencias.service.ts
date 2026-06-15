import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { SupabaseService } from '../common/supabase/supabase.service';

export interface FiltrosIncidencias {
  page?: number;
  limit?: number;
  estado?: string;
  tipo_incidencia?: string;
  repartidor_id?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
  search?: string;
  numero_seguimiento?: string;
}

@Injectable()
export class IncidenciasService {
  constructor(private readonly supabase: SupabaseService) {}

  async findAll(filtros: FiltrosIncidencias) {
    const admin = this.supabase.getAdmin();
    const page = filtros.page || 1;
    const limit = filtros.limit || 10;
    const offset = (page - 1) * limit;

    let query = admin.from('incidencias').select('*', { count: 'exact' });

    if (filtros.estado && filtros.estado !== 'Todos')
      query = query.eq('estado', filtros.estado);
    if (filtros.tipo_incidencia && filtros.tipo_incidencia !== 'Todos')
      query = query.eq('tipo_incidencia', filtros.tipo_incidencia);
    if (filtros.repartidor_id)
      query = query.eq('repartidor_id', filtros.repartidor_id);
    if (filtros.fecha_inicio)
      query = query.gte('fecha_reporte', filtros.fecha_inicio);
    if (filtros.fecha_fin)
      query = query.lte('fecha_reporte', filtros.fecha_fin);
    if (filtros.search || filtros.numero_seguimiento) {
      const term = filtros.search || filtros.numero_seguimiento;
      query = query.ilike('numero_guia', `%${term}%`);
    }

    const { data, error, count } = await query
      .order('fecha_reporte', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw new BadRequestException(error.message);

    return {
      success: true,
      data: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        total_pages: Math.ceil((count || 0) / limit),
      },
    };
  }

  async findOne(id: string) {
    const admin = this.supabase.getAdmin();
    const { data, error } = await admin
      .from('incidencias')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) throw new NotFoundException('Incidencia no encontrada');
    return { success: true, data };
  }

  async create(body: Record<string, unknown>) {
    const admin = this.supabase.getAdmin();
    const { data, error } = await admin
      .from('incidencias')
      .insert([{ ...body, fecha_reporte: new Date().toISOString() }])
      .select()
      .single();

    if (error) throw new BadRequestException(`Error al crear incidencia: ${error.message}`);
    return { success: true, message: 'Incidencia creada exitosamente', data };
  }

  async update(id: string, body: Record<string, unknown>) {
    const admin = this.supabase.getAdmin();
    const { data, error } = await admin
      .from('incidencias')
      .update({ ...body, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error || !data) throw new NotFoundException('Incidencia no encontrada');
    return { success: true, message: 'Incidencia actualizada', data };
  }

  async responder(
    id: string,
    body: {
      respuesta_admin: string;
      tipo_respuesta: string;
      nuevo_estado_paquete?: string;
      respondido_por?: string;
    },
  ) {
    if (!body.respuesta_admin?.trim()) {
      throw new BadRequestException('La respuesta es obligatoria');
    }
    if (!body.tipo_respuesta) {
      throw new BadRequestException('El tipo de respuesta es obligatorio');
    }

    const admin = this.supabase.getAdmin();

    const { data: incidencia } = await admin
      .from('incidencias')
      .select('id')
      .eq('id', id)
      .single();

    if (!incidencia) throw new NotFoundException('Incidencia no encontrada');

    const ahora = new Date().toISOString();
    const campos: Record<string, unknown> = {
      estado: 'respondida',
      respuesta_admin: body.respuesta_admin.trim(),
      tipo_respuesta: body.tipo_respuesta.trim(),
      fecha_respuesta: ahora,
      updated_at: ahora,
    };

    if (body.nuevo_estado_paquete?.trim())
      campos.nuevo_estado_paquete = body.nuevo_estado_paquete.trim();
    if (body.respondido_por?.trim())
      campos.respondido_por = body.respondido_por.trim();

    const { data, error } = await admin
      .from('incidencias')
      .update(campos)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new BadRequestException('Error al responder incidencia');
    return { success: true, message: 'Incidencia respondida exitosamente', data };
  }

  async resolver(id: string) {
    const admin = this.supabase.getAdmin();

    const { data: incidencia } = await admin
      .from('incidencias')
      .select('id')
      .eq('id', id)
      .single();

    if (!incidencia) throw new NotFoundException('Incidencia no encontrada');

    const { data, error } = await admin
      .from('incidencias')
      .update({ estado: 'resuelta', updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new BadRequestException(error.message);
    return { success: true, message: 'Incidencia marcada como resuelta', data };
  }

  async getEstadisticas() {
    const admin = this.supabase.getAdmin();
    const { data, error } = await admin.from('incidencias').select('*');

    if (error) throw new BadRequestException(error.message);

    const todas = data || [];
    const porTipo: Record<string, number> = {};
    todas.forEach((inc) => {
      const tipo = inc.tipo_incidencia || 'desconocido';
      porTipo[tipo] = (porTipo[tipo] || 0) + 1;
    });

    return {
      success: true,
      data: {
        total_incidencias: todas.length,
        por_estado: {
          pendiente: todas.filter((i) => i.estado === 'pendiente').length,
          respondida: todas.filter((i) => i.estado === 'respondida').length,
          resuelta: todas.filter((i) => i.estado === 'resuelta').length,
          cancelada: todas.filter((i) => i.estado === 'cancelada').length,
        },
        por_tipo: porTipo,
      },
    };
  }
}
