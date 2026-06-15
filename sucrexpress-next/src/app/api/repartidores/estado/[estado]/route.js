import { NextResponse } from 'next/server';
import Repartidor from '@/lib/models/Repartidor';

export async function GET(request, { params }) {
  try {
    const { estado } = await params;
    const repartidores = await Repartidor.getByEstado(estado);
    return NextResponse.json({ success: true, message: `Repartidores con estado ${estado}`, data: repartidores, total: repartidores.length });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Error al obtener repartidores', error: error.message }, { status: 500 });
  }
}
