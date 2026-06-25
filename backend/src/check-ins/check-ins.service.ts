import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateCheckInDto } from './check-in.dto';

/** Tabellenname in Supabase — muss mit Migration übereinstimmen */
const TABLE = 'stress_entries';

@Injectable()
export class CheckInsService {
  constructor(private readonly supabaseService: SupabaseService) {}

  /**
   * US-049 / TASK-031: Check-In speichern.
   * Zeitstempel wird von Supabase automatisch gesetzt (DEFAULT now()).
   */
  async create(userId: string, dto: CreateCheckInDto) {
    const { data, error } = await this.supabaseService
      .getClient()
      .from(TABLE)
      .insert({
        user_id: userId,
        stress_level: dto.stress_level,
        energy_level: dto.energy_level,
        note: dto.note ?? null,
        // recorded_at wird per DB-Default gesetzt → TS-002
      })
      .select()
      .single();

    if (error) {
      throw new InternalServerErrorException(
        `Check-In konnte nicht gespeichert werden: ${error.message}`,
      );
    }

    return { message: 'Check-In erfolgreich gespeichert', data };
  }

  /**
   * US-050 / TASK-034–036: Alle Check-Ins des Nutzers chronologisch abrufen.
   * RLS in Supabase stellt sicher, dass nur eigene Daten zurückkommen —
   * wir filtern hier trotzdem explizit (Defense in Depth).
   */
  async findAll(userId: string) {
    const { data, error } = await this.supabaseService
      .getClient()
      .from(TABLE)
      .select('id, stress_level, energy_level, note, recorded_at')
      .eq('user_id', userId)
      .order('recorded_at', { ascending: true });

    if (error) {
      throw new InternalServerErrorException(
        `Daten konnten nicht abgerufen werden: ${error.message}`,
      );
    }

    if (!data || data.length === 0) {
      return { message: 'Keine Daten vorhanden', data: [] };
    }

    return { data };
  }

  /**
   * US-005a/b + US-010: Aufbereitete Datenreihen für Diagramme.
   * Gibt Stress- und Energiewerte als separate Arrays zurück,
   * jeweils mit Zeitstempel — kompatibel mit recharts/chart.js.
   */
  async getChartData(userId: string) {
    const { data, error } = await this.supabaseService
      .getClient()
      .from(TABLE)
      .select('stress_level, energy_level, recorded_at')
      .eq('user_id', userId)
      .order('recorded_at', { ascending: true });

    if (error) {
      throw new InternalServerErrorException(
        `Diagrammdaten konnten nicht geladen werden: ${error.message}`,
      );
    }

    if (!data || data.length === 0) {
      return {
        message: 'Keine Daten vorhanden',
        labels: [],
        stressData: [],
        energyData: [],
      };
    }

    // TS-001: Einheitliches Format für Frontend
    return {
      labels: data.map((entry) => entry.recorded_at),
      stressData: data.map((entry) => ({
        x: entry.recorded_at,
        y: entry.stress_level,
      })),
      energyData: data.map((entry) => ({
        x: entry.recorded_at,
        y: entry.energy_level,
      })),
    };
  }

  /**
   * Einzelnen Check-In löschen (optional, falls ihr das noch braucht).
   */
  async remove(userId: string, id: string) {
    const { error } = await this.supabaseService
      .getClient()
      .from(TABLE)
      .delete()
      .eq('id', id)
      .eq('user_id', userId); // sicherstellen, dass nur eigene Einträge gelöscht werden

    if (error) {
      throw new NotFoundException(
        `Eintrag nicht gefunden oder Zugriff verweigert`,
      );
    }

    return { message: 'Eintrag gelöscht' };
  }
}