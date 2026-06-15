import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { SupabaseService } from '../common/supabase/supabase.service';
import { CreateRepartidorDto } from './dto/create-repartidor.dto';

@Injectable()
export class RepartidoresService {
  constructor(private readonly supabase: SupabaseService) {}

  async findAll() {
    const admin = this.supabase.getAdmin();
    const { data, error } = await admin
      .from('repartidores')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw new BadRequestException(error.message);
    return { success: true, data: data || [] };
  }

  async findOne(id: string) {
    const admin = this.supabase.getAdmin();
    const { data, error } = await admin
      .from('repartidores')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) throw new NotFoundException('Repartidor no encontrado');
    return { success: true, data };
  }

  async findByEstado(estado: string) {
    const admin = this.supabase.getAdmin();
    const { data, error } = await admin
      .from('repartidores')
      .select('*')
      .eq('estado', estado)
      .order('created_at', { ascending: false });

    if (error) throw new BadRequestException(error.message);
    return { success: true, data: data || [] };
  }

  async findByCiudad(ciudad: string) {
    const admin = this.supabase.getAdmin();
    const { data, error } = await admin
      .from('repartidores')
      .select('*')
      .eq('ciudad', ciudad)
      .order('created_at', { ascending: false });

    if (error) throw new BadRequestException(error.message);
    return { success: true, data: data || [] };
  }

  async create(dto: CreateRepartidorDto) {
    const admin = this.supabase.getAdmin();

    // Verificar duplicados por email y CI
    const { data: emailExiste } = await admin
      .from('repartidores')
      .select('id')
      .eq('email', dto.email.toLowerCase())
      .single();

    if (emailExiste) throw new ConflictException('Ya existe un repartidor con ese email');

    const { data: ciExiste } = await admin
      .from('repartidores')
      .select('id')
      .eq('numero_ci', dto.numero_ci)
      .single();

    if (ciExiste) throw new ConflictException('Ya existe un repartidor con ese número de CI');

    const { data, error } = await admin
      .from('repartidores')
      .insert([
        {
          uid: dto.uid,
          nombre_completo: dto.nombre_completo,
          email: dto.email.toLowerCase(),
          telefono: dto.telefono,
          numero_ci: dto.numero_ci,
          tipo_vehiculo: dto.tipo_vehiculo,
          ciudad: dto.ciudad,
          estado: dto.estado || 'Activo',
          verificado: dto.verificado || false,
          cantidad_entregas: 0,
          calificacion: 0.0,
          foto_perfil_url: dto.foto_perfil_url || null,
          foto_ci_url: dto.foto_ci_url || null,
        },
      ])
      .select()
      .single();

    if (error) throw new BadRequestException(`Error al crear repartidor: ${error.message}`);
    return { success: true, message: 'Repartidor creado exitosamente', data };
  }

  async update(id: string, updateData: Record<string, unknown>) {
    const admin = this.supabase.getAdmin();

    const { data: existing } = await admin
      .from('repartidores')
      .select('id')
      .eq('id', id)
      .single();

    if (!existing) throw new NotFoundException('Repartidor no encontrado');

    const { data, error } = await admin
      .from('repartidores')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new BadRequestException(error.message);
    return { success: true, message: 'Repartidor actualizado exitosamente', data };
  }

  // Soft delete: cambia estado a Inactivo
  async remove(id: string) {
    const admin = this.supabase.getAdmin();
    const { data, error } = await admin
      .from('repartidores')
      .update({ estado: 'Inactivo' })
      .eq('id', id)
      .select()
      .single();

    if (error || !data) throw new NotFoundException('Repartidor no encontrado');
    return { success: true, message: 'Repartidor desactivado exitosamente', data };
  }

  async updateUbicacion(id: string, body: { latitud: number; longitud: number }) {
    const admin = this.supabase.getAdmin();
    const { data, error } = await admin
      .from('repartidores')
      .update({
        latitud_actual: body.latitud,
        longitud_actual: body.longitud,
        ultima_ubicacion_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error || !data) throw new NotFoundException('Repartidor no encontrado');
    return { success: true, message: 'Ubicación actualizada', data };
  }
}
