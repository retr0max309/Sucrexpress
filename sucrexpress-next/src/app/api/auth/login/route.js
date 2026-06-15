import { NextResponse } from 'next/server';
import User from '@/lib/models/User';
import jwt from 'jsonwebtoken';

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const isGmail = (email) => email.toLowerCase().endsWith('@gmail.com');

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ success: false, message: 'email y contrasena son requeridos' }, { status: 400 });
    }
    if (!isValidEmail(email)) {
      return NextResponse.json({ success: false, message: 'formato de email invalido' }, { status: 400 });
    }
    if (!isGmail(email)) {
      return NextResponse.json({ success: false, message: 'solo se permiten cuentas de gmail (@gmail.com)' }, { status: 400 });
    }

    const user = await User.findByEmail(email);
    
    if (!user) {
      return NextResponse.json({ success: false, message: 'credenciales invalidas' }, { status: 401 });
    }

    const isValidPassword = await user.verifyPassword(password);
    
    if (!isValidPassword) {
      return NextResponse.json({ success: false, message: 'credenciales invalidas' }, { status: 401 });
    }

    if (!user.estado) {
      return NextResponse.json({ success: false, message: 'usuario inactivo' }, { status: 401 });
    }

    const token = jwt.sign(
      { userId: user.codigo_us, username: user.Usuario, email: user.email, tipoUsuario: user.codigo_tu },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    return NextResponse.json({
      success: true,
      message: 'login exitoso',
      data: {
        user: { codigo_us: user.codigo_us, Usuario: user.Usuario, email: user.email, codigo_tu: user.codigo_tu },
        token
      }
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'error interno del servidor', error: error.message }, { status: 500 });
  }
}
