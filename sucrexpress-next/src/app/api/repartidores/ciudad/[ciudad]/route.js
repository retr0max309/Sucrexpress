import { NextResponse } from 'next/server';
import Repartidor from '@/lib/models/Repartidor';

export async function GET(request, { params }) {
  try {
    const { ciudad } = await params;
    const repartidores = await Repartidor.getByCiudad(ciudad);
    return NextResponse.json({ success: true, message: `Repartidores en ${ciudad}`, data: repartidores, total: repartidores.length });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Error al obtener repartidores', error: error.message }, { status: 500 });
  }
}
