import { NextResponse } from 'next/server';
import Paquete from '@/lib/models/Paquete';
import { verifyAuth } from '@/lib/auth';

export async function GET(request, { params }) {
  const auth = verifyAuth(request);
  if (!auth.success) return NextResponse.json(auth, { status: auth.status });

  try {
    const { id } = await params;
    const paquete = await Paquete.findByPk(id);
    
    if (!paquete) {
      return NextResponse.json({ success: false, message: 'Paquete no encontrado' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: paquete });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Error al obtener el paquete', error: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  const auth = verifyAuth(request);
  if (!auth.success) return NextResponse.json(auth, { status: auth.status });

  try {
    const { id } = await params;
    const updateData = await request.json();

    const paquete = await Paquete.findByPk(id);
    if (!paquete) {
      return NextResponse.json({ success: false, message: 'Paquete no encontrado' }, { status: 404 });
    }

    const updatedPaquete = await Paquete.update(id, updateData);
    return NextResponse.json({ success: true, message: 'Paquete actualizado exitosamente', data: updatedPaquete });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Error al actualizar el paquete', error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const auth = verifyAuth(request);
  if (!auth.success) return NextResponse.json(auth, { status: auth.status });

  try {
    const { id } = await params;
    const paquete = await Paquete.findByPk(id);
    
    if (!paquete) {
      return NextResponse.json({ success: false, message: 'Paquete no encontrado' }, { status: 404 });
    }

    if (paquete.estado !== 'pendiente') {
      return NextResponse.json({ success: false, message: 'Solo se pueden eliminar paquetes pendientes' }, { status: 400 });
    }

    await Paquete.destroy(id);
    return NextResponse.json({ success: true, message: 'Paquete eliminado exitosamente' });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Error al eliminar el paquete', error: error.message }, { status: 500 });
  }
}
