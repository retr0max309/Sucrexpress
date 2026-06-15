import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { SupabaseService } from '../common/supabase/supabase.service';
import { CreatePaqueteDto } from './dto/create-paquete.dto';
import * as QRCode from 'qrcode';

@Injectable()
export class PaquetesService {
  constructor(private readonly supabase: SupabaseService) {}

  async findAll(filters: { estado?: string; ciudad?: string }) {
    const admin = this.supabase.getAdmin();
    let query = admin.from('paquetes').select('*');

    if (filters.estado) query = query.eq('estado', filters.estado);
    if (filters.ciudad) query = query.eq('ciudad_destino', filters.ciudad);

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw new BadRequestException(error.message);
    return { success: true, data: data || [] };
  }

  async findOne(id: string) {
    const admin = this.supabase.getAdmin();
    const { data, error } = await admin
      .from('paquetes')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) throw new NotFoundException('Paquete no encontrado');
    return { success: true, data };
  }

  async create(dto: CreatePaqueteDto) {
    const admin = this.supabase.getAdmin();

    // Calcular número de pedido del cliente
    let nroPedidoCliente = 1;
    const { data: lastPedido } = await admin
      .from('paquetes')
      .select('nro_pedido_cliente')
      .eq('ci_destinatario', dto.ci_destinatario)
      .order('nro_pedido_cliente', { ascending: false })
      .limit(1)
      .single();

    if (lastPedido?.nro_pedido_cliente) {
      nroPedidoCliente = lastPedido.nro_pedido_cliente + 1;
    }

    const paqueteData = {
      numero_guia: dto.numero_guia,
      nombre_destinatario: dto.nombre_destinatario,
      apellido_destinatario: dto.apellido_destinatario,
      ci_destinatario: dto.ci_destinatario,
      email_destinatario: dto.email_destinatario,
      telefono_destinatario: dto.telefono_destinatario,
      direccion_exacta: dto.direccion_destino,
      numero_casa: dto.numero_casa,
      numero_departamento: dto.numero_departamento || null,
      ciudad_destino: dto.ciudad_destino,
      contenido: dto.contenido,
      peso: dto.peso,
      precio_envio: dto.precio_envio,
      estado: 'pendiente',
      observaciones: dto.observaciones || null,
      nro_pedido_cliente: nroPedidoCliente,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...(dto.latitud_destino && dto.longitud_destino && {
        latitud_destino: dto.latitud_destino,
        longitud_destino: dto.longitud_destino,
        geocodificado_at: new Date().toISOString(),
      }),
    };

    const { data: paquete, error } = await admin
      .from('paquetes')
      .insert(paqueteData)
      .select()
      .single();

    if (error) throw new BadRequestException(`Error al crear paquete: ${error.message}`);

    // Generar QR
    let qrCode: string | null = null;
    try {
      const qrData = JSON.stringify({
        paquete_id: paquete.id,
        numero_guia: paquete.numero_guia,
        nombre_destinatario: paquete.nombre_destinatario,
        apellido_destinatario: paquete.apellido_destinatario,
        ciudad_destino: paquete.ciudad_destino,
        direccion_exacta: paquete.direccion_exacta,
        numero_casa: paquete.numero_casa,
      });

      qrCode = await QRCode.toDataURL(qrData, {
        errorCorrectionLevel: 'H',
        type: 'image/png',
        margin: 1,
        width: 300,
      });

      await admin
        .from('paquetes')
        .update({ qr_code: qrCode, qr_generated_at: new Date().toISOString() })
        .eq('id', paquete.id);
    } catch {
      // El QR no es crítico, continúa sin él
    }

    return {
      success: true,
      message: 'Paquete creado exitosamente',
      data: { ...paquete, qr_code: qrCode },
    };
  }

  async update(id: string, updateData: Record<string, unknown>) {
    const admin = this.supabase.getAdmin();

    const { data: existing } = await admin
      .from('paquetes')
      .select('id')
      .eq('id', id)
      .single();

    if (!existing) throw new NotFoundException('Paquete no encontrado');

    const { data, error } = await admin
      .from('paquetes')
      .update({ ...updateData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new BadRequestException(error.message);
    return { success: true, message: 'Paquete actualizado exitosamente', data };
  }

  async remove(id: string) {
    const admin = this.supabase.getAdmin();

    const { data: paquete } = await admin
      .from('paquetes')
      .select('estado')
      .eq('id', id)
      .single();

    if (!paquete) throw new NotFoundException('Paquete no encontrado');
    if (paquete.estado !== 'pendiente') {
      throw new BadRequestException('Solo se pueden eliminar paquetes pendientes');
    }

    const { error } = await admin.from('paquetes').delete().eq('id', id);
    if (error) throw new BadRequestException(error.message);

    return { success: true, message: 'Paquete eliminado exitosamente' };
  }

  async getDisponibles() {
    const admin = this.supabase.getAdmin();
    const { data, error } = await admin
      .from('paquetes')
      .select('*')
      .eq('estado', 'pendiente')
      .is('repartidor_id', null)
      .order('created_at', { ascending: false });

    if (error) throw new BadRequestException(error.message);
    return { success: true, data: data || [] };
  }

  async asignar(id: string, body: { repartidor_id: string; repartidor_nombre: string }) {
    const admin = this.supabase.getAdmin();

    const { data: paquete } = await admin
      .from('paquetes')
      .select('estado')
      .eq('id', id)
      .single();

    if (!paquete) throw new NotFoundException('Paquete no encontrado');

    if (paquete.estado === 'pendiente') {
      throw new BadRequestException(
        'El repartidor debe aceptar el paquete desde la app antes de que el administrador pueda asignarle una ruta.',
      );
    }
    if (paquete.estado !== 'asignado') {
      throw new BadRequestException('Este paquete ya no está disponible para asignar');
    }

    const { data, error } = await admin
      .from('paquetes')
      .update({
        repartidor_id: body.repartidor_id,
        repartidor_nombre: body.repartidor_nombre,
        estado: 'en_ruta',
        fecha_asignacion: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new BadRequestException(error.message);
    return { success: true, message: 'Paquete asignado exitosamente', data };
  }

  async aceptar(id: string, body: Record<string, unknown>) {
    const admin = this.supabase.getAdmin();
    const { data: paquete } = await admin
      .from('paquetes')
      .select('id')
      .eq('id', id)
      .single();

    if (!paquete) throw new NotFoundException('Paquete no encontrado');

    const { data, error } = await admin
      .from('paquetes')
      .update({ ...body, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new BadRequestException(error.message);
    return { success: true, message: 'Paquete actualizado exitosamente', data };
  }

  async getQR(id: string) {
    const admin = this.supabase.getAdmin();
    const { data: paquete } = await admin
      .from('paquetes')
      .select('id, numero_guia, nombre_destinatario, apellido_destinatario, ciudad_destino, direccion_exacta, numero_casa, qr_code')
      .eq('id', id)
      .single();

    if (!paquete) throw new NotFoundException('Paquete no encontrado');

    if (paquete.qr_code) {
      return { success: true, data: { qr_code: paquete.qr_code } };
    }

    // Regenerar QR si no existe
    const qrData = JSON.stringify({
      paquete_id: paquete.id,
      numero_guia: paquete.numero_guia,
      nombre_destinatario: paquete.nombre_destinatario,
      apellido_destinatario: paquete.apellido_destinatario,
      ciudad_destino: paquete.ciudad_destino,
      direccion_exacta: paquete.direccion_exacta,
      numero_casa: paquete.numero_casa,
    });

    const qrCode = await QRCode.toDataURL(qrData, { errorCorrectionLevel: 'H', width: 300 });

    await admin
      .from('paquetes')
      .update({ qr_code: qrCode, qr_generated_at: new Date().toISOString() })
      .eq('id', paquete.id);

    return { success: true, data: { qr_code: qrCode } };
  }
}
