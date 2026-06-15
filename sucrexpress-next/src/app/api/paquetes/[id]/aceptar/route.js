import { NextResponse } from 'next/server';
import Paquete from '@/lib/models/Paquete';
import { verifyAuth } from '@/lib/auth';

export async function POST(request, { params }) {
  const auth = verifyAuth(request);
  if (!auth.success) return NextResponse.json(auth, { status: auth.status });

  try {
    const { id } = await params;
    const paquete = await Paquete.findByPk(id);

    if (!paquete) {
      return NextResponse.json({ success: false, message: 'Paquete no encontrado' }, { status: 404 });
    }

    if (paquete.estado !== 'pendiente') {
      return NextResponse.json({ success: false, message: 'Este paquete no está disponible para aceptar' }, { status: 400 });
    }

    const updatedPaquete = await Paquete.update(id, {
      repartidor_id: auth.user.userId,
      repartidor_nombre: auth.user.username || auth.user.email,
      estado: 'asignado', // Aceptado por repartidor, listo para asignar ruta
      fecha_asignacion: new Date().toISOString()
    });

    return NextResponse.json({ success: true, message: 'Paquete aceptado exitosamente', data: updatedPaquete });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Error al aceptar el paquete', error: error.message }, { status: 500 });
  }
}
