import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { obtenerPaquetesRecientes, obtenerIncidenciasRecientes } from '../route';

export async function GET(request) {
  const auth = verifyAuth(request);
  if (!auth.success) return NextResponse.json(auth, { status: auth.status });

  try {
    const { searchParams } = new URL(request.url);
    const desde = searchParams.get('desde');
    
    if (!desde) {
      return NextResponse.json({ success: false, message: "El parámetro 'desde' es obligatorio" }, { status: 400 });
    }
    
    const paquetes = await obtenerPaquetesRecientes(50, desde);
    const incidencias = await obtenerIncidenciasRecientes(50, desde);
    
    const cambios = [...paquetes, ...incidencias].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    const hay_cambios = cambios.length > 0;
    
    return NextResponse.json({ success: true, hay_cambios, data: cambios });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Error al verificar cambios', error: error.message }, { status: 500 });
  }
}
