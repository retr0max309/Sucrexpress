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

    if (!paquete.qr_code) {
      return NextResponse.json({ success: false, message: 'QR no disponible para este paquete' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        qr_code: paquete.qr_code,
        numero_guia: paquete.numero_guia,
        nombre_destinatario: paquete.nombre_destinatario,
        ciudad_destino: paquete.ciudad_destino
      }
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Error al obtener el QR', error: error.message }, { status: 500 });
  }
}
