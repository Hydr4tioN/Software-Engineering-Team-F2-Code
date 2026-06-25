import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: 'Ungültige E-Mail-Adresse' })
  email: string;

  @IsString()
  @MinLength(6, { message: 'Passwort muss mindestens 6 Zeichen lang sein' })
  password: string;
}

export class LoginDto {
  @IsEmail({}, { message: 'Ungültige E-Mail-Adresse' })
  email: string;

  @IsString()
  password: string;
}