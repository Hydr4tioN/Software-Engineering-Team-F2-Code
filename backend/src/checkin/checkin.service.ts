import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { CreateCheckinDto } from './dto/create-checkin.dto';
import { UpdateCheckinDto } from './dto/update-checkin.dto';

@Injectable()
export class CheckinService {
  private supabase: SupabaseClient;

  constructor() {
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error(
        'Missing Supabase environment variables: VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY',
      );
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async create(createCheckinDto: any) {
    // 1. TEMPORARILY BYPASSING AUTHENTICATION FOR TESTING
    
    const { data, error } = await this.supabase
      .from('stress_entries')
      .insert([
        {
          user_id: createCheckinDto.user_id, // <-- Catching the ID from React!
          stress_level: createCheckinDto?.stressLevel ?? 0,
          category: createCheckinDto?.category,
          note: createCheckinDto?.note,
          energy_level: createCheckinDto?.energyLevel,
        },
      ])
      .select();

    if (error) {
      throw new Error(`Supabase error: ${error.message}`);
    }

    return data?.[0];
  }

  async findAll() {
    // 1. TEMPORARILY BYPASSING AUTHENTICATION FOR TESTING

    const { data, error } = await this.supabase
      .from('stress_entries')
      .select('*')
      // .eq('user_id', user.id) <-- 2. Commented out so it downloads everything
      .order('entry_date', { ascending: false });

    if (error) {
      throw new Error(`Supabase error: ${error.message}`);
    }

    return data || [];
  }

  async findOne(id: string) {
    const { data, error } = await this.supabase
      .from('stress_entries')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(`Supabase error: ${error.message}`);
    }

    return data;
  }

  async update(id: string, updateCheckinDto: UpdateCheckinDto) {
    const { data, error } = await this.supabase
      .from('stress_entries')
      .update({
        stress_level: updateCheckinDto.stressLevel,
        category: updateCheckinDto.category,
        note: updateCheckinDto.note,
        energy_level: updateCheckinDto.energyLevel,
      })
      .eq('id', id)
      .select();

    if (error) {
      throw new Error(`Supabase error: ${error.message}`);
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
      throw new Error(`Supabase error: ${error.message}`);
    }

    return data?.[0];
  }
}

