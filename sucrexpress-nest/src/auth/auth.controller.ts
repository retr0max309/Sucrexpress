import { Controller, Post, Get, Body, Headers } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { Public } from '../common/guards/jwt-auth.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // POST /api/auth/login  (ruta pública, no requiere token)
  @Public()
  @Post('login')
  @ApiOperation({ summary: 'Login de usuario' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  // POST /api/auth/register  (ruta pública)
  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Registro de nuevo usuario' })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  // GET /api/auth/verify  (requiere token)
  @Get('verify')
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Verificar validez del token' })
  verify(@Headers('authorization') authHeader: string) {
    const token = authHeader?.split(' ')[1];
    return this.authService.verifyToken(token);
  }
}
