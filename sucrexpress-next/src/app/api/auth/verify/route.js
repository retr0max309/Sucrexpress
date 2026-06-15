import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import User from '@/lib/models/User';

export async function GET(request) {
  const auth = verifyAuth(request);
  if (!auth.success) return NextResponse.json(auth, { status: auth.status });

  try {
    const user = await User.findById(auth.user.userId);
    if (!user) {
      return NextResponse.json({ success: false, message: 'Usuario no encontrado' }, { status: 404 });
    }

    if (!user.estado) {
      return NextResponse.json({ success: false, message: 'Usuario inactivo' }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      message: 'Token verificado exitosamente',
      data: {
        user: {
          codigo_us: user.codigo_us,
          Usuario: user.Usuario,
          email: user.email,
          codigo_tu: user.codigo_tu
        }
      }
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Error interno del servidor', error: error.message }, { status: 500 });
  }
}
