import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'Juan Perez' })
  @IsString()
  @IsNotEmpty()
  usuario: string;

  @ApiProperty({ example: 'juan@gmail.com' })
  @IsEmail({}, { message: 'Formato de email inválido' })
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'mi_contraseña' })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({ example: 1, required: false, description: '1=admin, 2=repartidor, 3=cliente' })
  @IsNumber()
  @IsOptional()
  codigo_tu?: number;
}
