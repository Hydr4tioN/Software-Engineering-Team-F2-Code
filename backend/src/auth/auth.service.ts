import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { RegisterDto, LoginDto } from './auth.dto';

@Injectable()
export class AuthService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async register(dto: RegisterDto) {
    const { data, error } = await this.supabaseService
      .getClient()
      .auth.admin.createUser({
        email: dto.email,
        password: dto.password,
        email_confirm: true, // direkt bestätigt, kein E-Mail-Verify-Flow nötig
      });

    if (error) {
      // Supabase gibt 422 bei bereits registrierter E-Mail
      throw new BadRequestException(error.message);
    }

    return {
      message: 'Registrierung erfolgreich',
      userId: data.user.id,
    };
  }

  async login(dto: LoginDto) {
    const { data, error } = await this.supabaseService
      .getClient()
      .auth.signInWithPassword({
        email: dto.email,
        password: dto.password,
      });

    if (error) {
      throw new UnauthorizedException('Ungültige Anmeldedaten');
    }

    return {
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
      expiresAt: data.session.expires_at,
      user: {
        id: data.user.id,
        email: data.user.email,
      },
    };
  }

  async logout(accessToken: string) {
    // Supabase invalidiert die Session serverseitig
    await this.supabaseService.getClient().auth.admin.signOut(accessToken);
    return { message: 'Erfolgreich abgemeldet' };
  }

  /**
   * Verifiziert das JWT und gibt den Supabase-User zurück.
   * Wird vom AuthGuard intern aufgerufen.
   */
  async verifyToken(accessToken: string) {
    const { data, error } = await this.supabaseService
      .getClient()
      .auth.getUser(accessToken);

    if (error || !data.user) {
      throw new UnauthorizedException('Ungültiges oder abgelaufenes Token');
    }

    return data.user;
  }
}