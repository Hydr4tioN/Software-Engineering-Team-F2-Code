import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { CreateCheckinDto } from './dto/create-checkin.dto';
import { UpdateCheckinDto } from './dto/update-checkin.dto';

/**
 * Jede Methode bekommt den Supabase-Client des eingeloggten Users (aus dem Guard)
 * und dessen userId. Die userId kommt aus dem geprüften Token, NIE aus dem Request-Body.
 */
@Injectable()
export class CheckinService {
  private readonly logger = new Logger(CheckinService.name);

  private fail(action: string, message: string): never {
    this.logger.error(`${action} fehlgeschlagen: ${message}`);
    throw new InternalServerErrorException(`Supabase error: ${message}`);
  }

  async create(supabase: SupabaseClient, userId: string, dto: CreateCheckinDto) {
    const { data, error } = await supabase
      .from('stress_entries')
      .insert([
        {
          user_id: userId,
          stress_level: dto.stressLevel,
          category: dto.category,
          note: dto.note,
          energy_level: dto.energyLevel,
        },
      ])
      .select();

    if (error) this.fail('create', error.message);
    return data?.[0];
  }

  async findAll(supabase: SupabaseClient, userId: string) {
    const { data, error } = await supabase
      .from('stress_entries')
      .select('*')
      .eq('user_id', userId)
      .order('entry_date', { ascending: false });

    if (error) this.fail('findAll', error.message);
    return data || [];
  }

  async findOne(supabase: SupabaseClient, userId: string, id: string) {
    const { data, error } = await supabase
      .from('stress_entries')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .maybeSingle();

    if (error) this.fail('findOne', error.message);
    if (!data) throw new NotFoundException(`Eintrag ${id} nicht gefunden`);
    return data;
  }

  async update(
    supabase: SupabaseClient,
    userId: string,
    id: string,
    dto: UpdateCheckinDto,
  ) {
    const { data, error } = await supabase
      .from('stress_entries')
      .update({
        stress_level: dto.stressLevel,
        category: dto.category,
        note: dto.note,
        energy_level: dto.energyLevel,
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select();

    if (error) this.fail('update', error.message);
    if (!data?.length) throw new NotFoundException(`Eintrag ${id} nicht gefunden`);
    return data[0];
  }

  async remove(supabase: SupabaseClient, userId: string, id: string) {
    const { data, error } = await supabase
      .from('stress_entries')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)
      .select();

    if (error) this.fail('remove', error.message);
    if (!data?.length) throw new NotFoundException(`Eintrag ${id} nicht gefunden`);
    return data[0];
  }
}
