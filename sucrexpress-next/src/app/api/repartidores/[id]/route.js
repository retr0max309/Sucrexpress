import { NextResponse } from 'next/server';
import Repartidor from '@/lib/models/Repartidor';
import { verifyAuth } from '@/lib/auth';

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const isValidPhone = (telefono) => /^\d{7,15}$/.test(telefono.replace(/\s/g, ''));

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const repartidor = await Repartidor.findById(id);
    if (!repartidor) return NextResponse.json({ success: false, message: 'Repartidor no encontrado' }, { status: 404 });
    return NextResponse.json({ success: true, data: repartidor });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Error al obtener repartidor', error: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  const auth = verifyAuth(request);
  if (!auth.success) return NextResponse.json(auth, { status: auth.status });

  try {
    const { id } = await params;
    const updateData = await request.json();
    const existingRepartidor = await Repartidor.findById(id);
    if (!existingRepartidor) return NextResponse.json({ success: false, message: 'Repartidor no encontrado' }, { status: 404 });

    if (updateData.email && !isValidEmail(updateData.email)) return NextResponse.json({ success: false, message: 'Formato de email inválido' }, { status: 400 });
    if (updateData.telefono && !isValidPhone(updateData.telefono)) return NextResponse.json({ success: false, message: 'Formato de teléfono inválido' }, { status: 400 });

    const updatedRepartidor = await Repartidor.update(id, updateData);
    return NextResponse.json({ success: true, message: 'Repartidor actualizado exitosamente', data: updatedRepartidor });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Error al actualizar repartidor', error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const auth = verifyAuth(request);
  if (!auth.success) return NextResponse.json(auth, { status: auth.status });

  try {
    const { id } = await params;
    const existingRepartidor = await Repartidor.findById(id);
    if (!existingRepartidor) return NextResponse.json({ success: false, message: 'Repartidor no encontrado' }, { status: 404 });

    const deletedRepartidor = await Repartidor.delete(id);
    return NextResponse.json({ success: true, message: 'Repartidor eliminado exitosamente', data: deletedRepartidor });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Error al eliminar repartidor', error: error.message }, { status: 500 });
  }
}
