import { NextResponse } from 'next/server';
import Paquete from '@/lib/models/Paquete';
import { verifyAuth } from '@/lib/auth';

export async function GET(request) {
  const auth = verifyAuth(request);
  if (!auth.success) return NextResponse.json(auth, { status: auth.status });

  try {
    const paquetes = await Paquete.findAll({
      estado: 'pendiente',
      repartidor_id: null
    });

    return NextResponse.json({ success: true, data: paquetes });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Error al obtener paquetes disponibles', error: error.message }, { status: 500 });
  }
}
