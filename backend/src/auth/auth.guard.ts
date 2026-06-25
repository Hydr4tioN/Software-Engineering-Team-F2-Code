import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Kein Authentifizierungstoken gefunden');
    }

    const token = authHeader.slice(7);

    // Verifiziert Token gegen Supabase und hängt den User ans Request-Objekt
    const user = await this.authService.verifyToken(token);
    (request as any).user = user;

    return true;
  }
}