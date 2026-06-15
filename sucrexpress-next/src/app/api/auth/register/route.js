import { NextResponse } from 'next/server';
import User from '@/lib/models/User';
import jwt from 'jsonwebtoken';

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const isGmail = (email) => email.toLowerCase().endsWith('@gmail.com');

export async function POST(request) {
  try {
    const { username, email, password, confirmPassword } = await request.json();

    if (!username || !email || !password || !confirmPassword) {
      return NextResponse.json({ success: false, message: 'todos los campos son requeridos' }, { status: 400 });
    }
    if (!isValidEmail(email)) {
      return NextResponse.json({ success: false, message: 'formato de email invalido' }, { status: 400 });
    }
    if (!isGmail(email)) {
      return NextResponse.json({ success: false, message: 'solo se permiten cuentas de gmail (@gmail.com)' }, { status: 400 });
    }
    if (password !== confirmPassword) {
      return NextResponse.json({ success: false, message: 'las contrasenas no coinciden' }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ success: false, message: 'la contrasena debe tener al menos 6 caracteres' }, { status: 400 });
    }

    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return NextResponse.json({ success: false, message: 'este email ya esta registrado' }, { status: 409 });
    }

    const newUser = await User.create({ usuario: username, email: email, password: password, codigo_tu: 1 });

    const token = jwt.sign(
      { userId: newUser.codigo_us, username: newUser.Usuario, email: newUser.email, tipoUsuario: newUser.codigo_tu },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    return NextResponse.json({
      success: true,
      message: 'usuario registrado exitosamente',
      data: {
        user: { codigo_us: newUser.codigo_us, Usuario: newUser.Usuario, email: newUser.email, codigo_tu: newUser.codigo_tu },
        token
      }
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'error interno del servidor', error: error.message }, { status: 500 });
  }
}
