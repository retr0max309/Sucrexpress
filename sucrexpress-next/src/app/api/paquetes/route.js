import { NextResponse } from 'next/server';
import Paquete from '@/lib/models/Paquete';
import { generateQRCode } from '@/lib/utils/qrGenerator';
import { verifyAuth } from '@/lib/auth';

export async function GET(request) {
  const auth = verifyAuth(request);
  if (!auth.success) return NextResponse.json(auth, { status: auth.status });

  try {
    const { searchParams } = new URL(request.url);
    const estado = searchParams.get('estado');
    const ciudad = searchParams.get('ciudad');
    
    let whereClause = {};
    if (estado) whereClause.estado = estado;
    if (ciudad) whereClause.ciudad_destino = ciudad;
    
    const paquetes = await Paquete.findAll(whereClause);
    return NextResponse.json({ success: true, data: paquetes });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Error al obtener los paquetes', error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  const auth = verifyAuth(request);
  if (!auth.success) return NextResponse.json(auth, { status: auth.status });

  try {
    const body = await request.json();
    const {
      numero_guia, nombre_destinatario, apellido_destinatario, ci_destinatario,
      email_destinatario, telefono_destinatario, direccion_destino, numero_casa,
      numero_departamento, ciudad_destino, contenido, peso, precio_envio, observaciones,
      latitud_destino, longitud_destino
    } = body;

    if (!numero_guia || !nombre_destinatario || !apellido_destinatario || !ci_destinatario || 
        !email_destinatario || !telefono_destinatario || !direccion_destino || !numero_casa || 
        !ciudad_destino || !peso || !contenido || !precio_envio) {
      return NextResponse.json({ success: false, message: 'Todos los campos obligatorios deben ser proporcionados' }, { status: 400 });
    }

    let nroPedidoCliente = 1;
    try {
      nroPedidoCliente = await Paquete.getProximoNroPedidoCliente(ci_destinatario);
    } catch (error) {
      console.error('Error calculando número de pedido:', error);
    }

    const paqueteData = {
      numero_guia, nombre_destinatario, apellido_destinatario, ci_destinatario, email_destinatario,
      telefono_destinatario, direccion_exacta: direccion_destino, numero_casa, numero_departamento: numero_departamento || null,
      ciudad_destino, contenido, peso: parseFloat(peso), precio_envio: parseFloat(precio_envio),
      estado: 'pendiente', observaciones: observaciones || null, nro_pedido_cliente: nroPedidoCliente,
      // Coordenadas manuales del admin (si las marcó en el mapa)
      ...(latitud_destino && longitud_destino && {
        latitud_destino: parseFloat(latitud_destino),
        longitud_destino: parseFloat(longitud_destino),
        geocodificado_at: new Date().toISOString()
      })
    };

    const paquete = await Paquete.create(paqueteData);

    let qrCode = null;
    try {
      if (paquete && paquete.id) {
        const paqueteParaQR = {
          id: paquete.id, numero_guia: paquete.numero_guia, nombre_destinatario: paquete.nombre_destinatario,
          apellido_destinatario: paquete.apellido_destinatario, ciudad_destino: paquete.ciudad_destino,
          direccion_exacta: paquete.direccion_exacta, numero_casa: paquete.numero_casa
        };
        qrCode = await generateQRCode(paqueteParaQR);
        await Paquete.update(paquete.id, { qr_code: qrCode, qr_generated_at: new Date().toISOString() });
      }
    } catch (qrError) {
      console.error('Error generando QR:', qrError);
    }

    return NextResponse.json({ success: true, message: 'Paquete creado exitosamente', data: { ...paquete, qr_code: qrCode } }, { status: 201 });
  } catch (error) {
    if (error.code === 'PGRST301' || error.message.includes('not found in auth.jwt_token')) {
      return NextResponse.json({ success: false, message: 'No autorizado - Inicia sesión nuevamente' }, { status: 401 });
    }
    return NextResponse.json({ success: false, message: 'Error al crear el paquete', error: error.message }, { status: 500 });
  }
}
