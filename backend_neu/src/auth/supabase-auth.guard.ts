import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';

/**
 * Prüft den Supabase-Login-Token aus dem Header "Authorization: Bearer <token>".
 * Hängt danach an den Request:
 *  - req.user     → der eingeloggte Supabase-User
 *  - req.supabase → ein Supabase-Client, der im Namen dieses Users arbeitet (RLS greift)
 */
@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const header: string | undefined = req.headers['authorization'];

    if (!header?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Kein Token mitgeschickt');
    }
    const token = header.slice('Bearer '.length);

    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_KEY!,
      {
        global: { headers: { Authorization: `Bearer ${token}` } },
        auth: { persistSession: false },
      },
    );

    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data.user) {
      throw new UnauthorizedException('Token ungültig oder abgelaufen');
    }

    req.user = data.user;
    req.supabase = supabase;
    return true;
  }
}
