import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, IsBoolean } from 'class-validator';

export class CreateRepartidorDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  uid?: string;

  @ApiProperty({ example: 'Carlos Mamani' })
  @IsString()
  @IsNotEmpty()
  nombre_completo: string;

  @ApiProperty({ example: 'carlos@gmail.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: '70000001' })
  @IsString()
  @IsNotEmpty()
  telefono: string;

  @ApiProperty({ example: '12345678' })
  @IsString()
  @IsNotEmpty()
  numero_ci: string;

  @ApiProperty({ example: 'moto', enum: ['moto', 'bicicleta', 'auto', 'camion'] })
  @IsString()
  @IsNotEmpty()
  tipo_vehiculo: string;

  @ApiProperty({ example: 'Cochabamba' })
  @IsString()
  @IsNotEmpty()
  ciudad: string;

  @ApiProperty({ required: false, example: 'Activo' })
  @IsString()
  @IsOptional()
  estado?: string;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  verificado?: boolean;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  foto_perfil_url?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  foto_ci_url?: string;
}
