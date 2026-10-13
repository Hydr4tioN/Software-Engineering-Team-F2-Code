import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { CreateCheckinDto } from './dto/create-checkin.dto';
import { UpdateCheckinDto } from './dto/update-checkin.dto';

@Injectable()
export class CheckinService {
  private supabase: SupabaseClient;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error(
        'Missing Supabase environment variables: SUPABASE_URL or SUPABASE_KEY',
      );
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async create(dto: CreateCheckinDto) {
    const { data, error } = await this.supabase
      .from('stress_entries')
      .insert([
        {
          user_id: dto.user_id,
          stress_level: dto.stressLevel ?? 0,
          category: dto.category,
          note: dto.note,
          energy_level: dto.energyLevel,
        },
      ])
      .select();

    if (error) {
      throw new InternalServerErrorException(`Supabase error: ${error.message}`);
    }
    return data?.[0];
  }

  async findAll() {
    const { data, error } = await this.supabase
      .from('stress_entries')
      .select('*')
      .order('entry_date', { ascending: false });

    if (error) {
      throw new InternalServerErrorException(`Supabase error: ${error.message}`);
    }
    return data || [];
  }

  async findOne(id: string) {
    const { data, error } = await this.supabase
      .from('stress_entries')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      throw new InternalServerErrorException(`Supabase error: ${error.message}`);
    }
    if (!data) {
      throw new NotFoundException(`Eintrag ${id} nicht gefunden`);
    }
    return data;
  }

  async update(id: string, dto: UpdateCheckinDto) {
    const { data, error } = await this.supabase
      .from('stress_entries')
      .update({
        stress_level: dto.stressLevel,
        category: dto.category,
        note: dto.note,
        energy_level: dto.energyLevel,
      })
      .eq('id', id)
      .select();

    if (error) {
      throw new InternalServerErrorException(`Supabase error: ${error.message}`);
    }
    return data?.[0];
  }

  async remove(id: string) {
    const { data, error } = await this.supabase
      .from('stress_entries')
      .delete()
      .eq('id', id)
      .select();

    if (error) {
      throw new InternalServerErrorException(`Supabase error: ${error.message}`);
    }
    return data?.[0];
  }
}