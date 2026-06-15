import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseService } from '../common/supabase/supabase.service';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly supabase: SupabaseService,
    private readonly config: ConfigService,
  ) {}

  async login(dto: LoginDto) {
    const { email, password } = dto;

    if (!email.toLowerCase().endsWith('@gmail.com')) {
      throw new BadRequestException('Solo se permiten cuentas de Gmail (@gmail.com)');
    }

    const admin = this.supabase.getAdmin();

    // Buscar usuario SIN filtrar por estado primero (para debug)
    const { data: user, error } = await admin
      .from('tb_usuarios')
      .select('codigo_us, usuario, "Contraseña", email, codigo_tu, estado')
      .eq('email', email)
      .single();

    // Log para diagnosticar (visible en la terminal del servidor NestJS)
    this.logger.debug(`Buscando usuario: ${email}`);
    this.logger.debug(`Supabase error: ${JSON.stringify(error)}`);
    this.logger.debug(`Usuario encontrado: ${user ? 'SÍ' : 'NO'}`);

    if (error || !user) {
      this.logger.warn(`Usuario no encontrado para email: ${email}`);
      throw new UnauthorizedException('Credenciales inválidas');
    }

    this.logger.debug(`Estado del usuario: ${user.estado} (tipo: ${typeof user.estado})`);
    this.logger.debug(`Contraseña guardada empieza con: ${String(user['Contraseña']).substring(0, 10)}...`);

    // Verificar que el usuario esté activo (compatible con boolean, 1, 'true', 'Activo')
    const estaActivo =
      user.estado === true ||
      user.estado === 1 ||
      user.estado === 'true' ||
      user.estado === 'Activo' ||
      user.estado === 'activo';

    if (!estaActivo) {
      this.logger.warn(`Usuario inactivo: ${email}, estado=${user.estado}`);
      throw new UnauthorizedException('Usuario inactivo');
    }

    // Verificar contraseña con bcrypt
    const contrasena = user['Contraseña'] as string;
    const passwordOk = await bcrypt.compare(password, contrasena);

    this.logger.debug(`Verificación bcrypt: ${passwordOk ? 'OK' : 'FALLÓ'}`);

    if (!passwordOk) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Generar JWT
    const secret = this.config.get<string>('JWT_SECRET');
    const expiresIn = this.config.get<string>('JWT_EXPIRES_IN') || '24h';

    const token = jwt.sign(
      {
        userId: user.codigo_us,
        username: user.usuario,
        email: user.email,
        tipoUsuario: user.codigo_tu,
      },
      secret!,
      { expiresIn } as jwt.SignOptions,
    );

    this.logger.log(`Login exitoso: ${email}`);

    return {
      success: true,
      message: 'Login exitoso',
      data: {
        user: {
          codigo_us: user.codigo_us,
          Usuario: user.usuario,
          email: user.email,
          codigo_tu: user.codigo_tu,
        },
        token,
      },
    };
  }

  async register(dto: RegisterDto) {
    const { usuario, email, password, codigo_tu } = dto;

    if (!email.toLowerCase().endsWith('@gmail.com')) {
      throw new BadRequestException('Solo se permiten cuentas de Gmail (@gmail.com)');
    }

    const admin = this.supabase.getAdmin();

    const { data: existing } = await admin
      .from('tb_usuarios')
      .select('codigo_us')
      .eq('email', email)
      .single();

    if (existing) {
      throw new ConflictException('El email ya está registrado');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const { data: newUser, error } = await admin
      .from('tb_usuarios')
      .insert([
        {
          usuario,
          'Contraseña': hashedPassword,
          email,
          codigo_tu: codigo_tu || 1,
          estado: true,
        },
      ])
      .select()
      .single();

    if (error) {
      throw new BadRequestException(`Error al registrar: ${error.message}`);
    }

    return {
      success: true,
      message: 'Usuario registrado exitosamente',
      data: {
        codigo_us: newUser.codigo_us,
        usuario: newUser.usuario,
        email: newUser.email,
      },
    };
  }

  verifyToken(token: string) {
    const secret = this.config.get<string>('JWT_SECRET');
    try {
      const decoded = jwt.verify(token, secret!);
      return { success: true, user: decoded };
    } catch {
      throw new UnauthorizedException('Token inválido o expirado');
    }
  }
}
