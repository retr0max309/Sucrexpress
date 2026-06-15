import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsOptional, IsEmail } from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePaqueteDto {
  @ApiProperty({ example: 'GU-2024-001' })
  @IsString()
  @IsNotEmpty()
  numero_guia: string;

  @ApiProperty({ example: 'Juan' })
  @IsString()
  @IsNotEmpty()
  nombre_destinatario: string;

  @ApiProperty({ example: 'Perez' })
  @IsString()
  @IsNotEmpty()
  apellido_destinatario: string;

  @ApiProperty({ example: '12345678' })
  @IsString()
  @IsNotEmpty()
  ci_destinatario: string;

  @ApiProperty({ example: 'juan@gmail.com' })
  @IsEmail()
  @IsNotEmpty()
  email_destinatario: string;

  @ApiProperty({ example: '70000000' })
  @IsString()
  @IsNotEmpty()
  telefono_destinatario: string;

  @ApiProperty({ example: 'Av. Blanco Galindo km 5' })
  @IsString()
  @IsNotEmpty()
  direccion_destino: string;

  @ApiProperty({ example: '123' })
  @IsString()
  @IsNotEmpty()
  numero_casa: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  numero_departamento?: string;

  @ApiProperty({ example: 'Cochabamba' })
  @IsString()
  @IsNotEmpty()
  ciudad_destino: string;

  @ApiProperty({ example: 'Ropa y accesorios' })
  @IsString()
  @IsNotEmpty()
  contenido: string;

  @ApiProperty({ example: 2.5 })
  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  peso: number;

  @ApiProperty({ example: 50.0 })
  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  precio_envio: number;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  observaciones?: string;

  @ApiProperty({ required: false, example: -17.3936 })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  latitud_destino?: number;

  @ApiProperty({ required: false, example: -66.1571 })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  longitud_destino?: number;
}
