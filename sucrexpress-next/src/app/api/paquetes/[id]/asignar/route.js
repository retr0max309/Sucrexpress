import { NextResponse } from 'next/server';
import Paquete from '@/lib/models/Paquete';
import { verifyAuth } from '@/lib/auth';

export async function PUT(request, { params }) {
  const auth = verifyAuth(request);
  if (!auth.success) return NextResponse.json(auth, { status: auth.status });

  try {
    const { id } = await params;
    const { repartidor_id, repartidor_nombre } = await request.json();

    const paquete = await Paquete.findByPk(id);
    if (!paquete) {
      return NextResponse.json({ success: false, message: 'Paquete no encontrado' }, { status: 404 });
    }

    if (paquete.estado === 'pendiente') {
      return NextResponse.json({ success: false, message: 'El repartidor debe aceptar el paquete desde la app antes de que el administrador pueda asignarle una ruta.' }, { status: 422 });
    }
    if (paquete.estado !== 'asignado') {
      return NextResponse.json({ success: false, message: 'Este paquete ya no está disponible para asignar' }, { status: 400 });
    }

    const updatedPaquete = await Paquete.update(id, {
      repartidor_id,
      repartidor_nombre,
      estado: 'en_ruta',
      fecha_asignacion: new Date().toISOString()
    });

    return NextResponse.json({ success: true, message: 'Paquete asignado exitosamente', data: updatedPaquete });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Error al asignar el paquete', error: error.message }, { status: 500 });
  }
}
