import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'admin@gmail.com' })
  @IsEmail({}, { message: 'Formato de email inválido' })
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'mi_contraseña' })
  @IsString()
  @IsNotEmpty()
  password: string;
}
