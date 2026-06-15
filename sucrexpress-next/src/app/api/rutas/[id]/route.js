import { NextResponse } from 'next/server';
import Ruta from '@/lib/models/Ruta';
import { verifyAuth } from '@/lib/auth';

export async function GET(request, { params }) {
  const auth = verifyAuth(request);
  if (!auth.success) return NextResponse.json(auth, { status: auth.status });

  try {
    const { id } = await params;
    const ruta = await Ruta.findById(id);
    if (!ruta) return NextResponse.json({ success: false, message: 'Ruta no encontrada' }, { status: 404 });
    return NextResponse.json({ success: true, data: ruta });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Error al obtener la ruta', error: error.message }, { status: 500 });
  }
}

// PATCH /api/rutas/[id] — cambiar estado (enviada, cancelada, en_progreso, completada)
export async function PATCH(request, { params }) {
  const auth = verifyAuth(request);
  if (!auth.success) return NextResponse.json(auth, { status: auth.status });

  try {
    const { id } = await params;
    const { estado } = await request.json();
    const estadosValidos = ['pendiente', 'enviada', 'en_progreso', 'completada', 'cancelada'];

    if (!estadosValidos.includes(estado)) {
      return NextResponse.json({ success: false, message: `Estado inválido. Valores permitidos: ${estadosValidos.join(', ')}` }, { status: 400 });
    }

    const ruta = await Ruta.updateEstado(id, estado);
    return NextResponse.json({ success: true, message: `Ruta actualizada a: ${estado}`, data: ruta });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Error al actualizar la ruta', error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const auth = verifyAuth(request);
  if (!auth.success) return NextResponse.json(auth, { status: auth.status });

  try {
    const { id } = await params;
    const ruta = await Ruta.findById(id);
    if (!ruta) return NextResponse.json({ success: false, message: 'Ruta no encontrada' }, { status: 404 });
    if (ruta.estado === 'en_progreso') {
      return NextResponse.json({ success: false, message: 'No se puede eliminar una ruta en progreso' }, { status: 400 });
    }

    await Ruta.delete(id);
    return NextResponse.json({ success: true, message: 'Ruta eliminada exitosamente' });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Error al eliminar la ruta', error: error.message }, { status: 500 });
  }
}
