
import { describe, it, expect } from '@jest/globals';
import { InternalServerErrorException } from '@nestjs/common';
import { EventsService } from './events.service';

describe('EventsService - Auswahlmenü', () => {
  const service = new EventsService();

  function createSupabaseMock(
    data: any[],
    error: any = null,
  ) {
    return {
      from: (_table: string) => ({
        select: (_columns: string) => ({
          eq: (_field: string, _value: string) => ({
            order: async (
              _column: string,
              _options: any,
            ) => ({
              data,
              error,
            }),
          }),
        }),
      }),
    };
  }

  it('trennt normale und statische Ereignisse', async () => {
    const supabase = createSupabaseMock([
      {
        id: '1',
        name: 'Mathe',
        is_static: false,
      },
      {
        id: '2',
        name: 'Mittagspause',
        is_static: true,
      },
    ]);

    const result = await service.findForSelection(
      supabase,
      'test-user',
    );

    expect(result.normalEvents).toEqual([
      { id: '1', name: 'Mathe' },
    ]);

    expect(result.staticEvents).toEqual([
      { id: '2', name: 'Mittagspause' },
    ]);
  });

  it('gibt leere Listen zurück, wenn keine Ereignisse vorhanden sind', async () => {
    const supabase = createSupabaseMock([]);

    const result = await service.findForSelection(
      supabase,
      'test-user',
    );

    expect(result.normalEvents).toEqual([]);
    expect(result.staticEvents).toEqual([]);
  });

  it('meldet Datenbankfehler', async () => {
    const supabase = createSupabaseMock(
      [],
      { message: 'Datenbankfehler' },
    );

    await expect(
      service.findForSelection(supabase, 'test-user'),
    ).rejects.toThrow(InternalServerErrorException);
  });
});
