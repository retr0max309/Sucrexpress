import { NextResponse } from 'next/server';
import Repartidor from '@/lib/models/Repartidor';
import { getConnection } from '@/lib/config/database';
import { verifyAuth } from '@/lib/auth';

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const isValidPhone = (telefono) => /^\d{7,15}$/.test(telefono.replace(/\s/g, ''));

export async function GET() {
  try {
    const repartidores = await Repartidor.getAll();
    return NextResponse.json({ success: true, data: repartidores, total: repartidores.length });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Error al obtener repartidores', error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  const auth = verifyAuth(request);
  if (!auth.success) return NextResponse.json(auth, { status: auth.status });

  try {
    const body = await request.json();
    const { nombre_completo, email, password, telefono, numero_ci, tipo_vehiculo, ciudad, estado, verificado } = body;

    if (!nombre_completo || !email || !password || !telefono || !numero_ci || !tipo_vehiculo || !ciudad) {
      return NextResponse.json({ success: false, message: 'Todos los campos obligatorios deben ser proporcionados' }, { status: 400 });
    }
    if (!isValidEmail(email)) return NextResponse.json({ success: false, message: 'Formato de email inválido' }, { status: 400 });
    if (!isValidPhone(telefono)) return NextResponse.json({ success: false, message: 'Formato de teléfono inválido (7-15 dígitos)' }, { status: 400 });
    if (password.length < 6) return NextResponse.json({ success: false, message: 'La contraseña debe tener al menos 6 caracteres' }, { status: 400 });

    const existingEmail = await Repartidor.findByEmail(email);
    if (existingEmail) return NextResponse.json({ success: false, message: 'Este email ya está registrado' }, { status: 409 });

    const existingCI = await Repartidor.findByCI(numero_ci);
    if (existingCI) return NextResponse.json({ success: false, message: 'Este número de CI ya está registrado' }, { status: 409 });

    const { admin } = await getConnection();
    const { data: authData, error: authError } = await admin.auth.admin.createUser({ email, password, email_confirm: true });
    
    if (authError) return NextResponse.json({ success: false, message: `Error de autenticación: ${authError.message}` }, { status: 500 });

    const uid = authData.user.id;
    const newRepartidor = await Repartidor.create({
      uid, nombre_completo, email, telefono, numero_ci, tipo_vehiculo, ciudad, estado: estado || 'Activo', verificado: verificado || false
    });

    return NextResponse.json({ success: true, message: 'Repartidor registrado exitosamente', data: newRepartidor }, { status: 201 });
  } catch (error) {
    if (error.code === '23505') {
      if (error.message.includes('email')) return NextResponse.json({ success: false, message: 'Este email ya está registrado' }, { status: 409 });
      if (error.message.includes('numero_ci')) return NextResponse.json({ success: false, message: 'Este número de CI ya está registrado' }, { status: 409 });
    }
    return NextResponse.json({ success: false, message: 'Error al registrar repartidor', error: error.message }, { status: 500 });
  }
}
