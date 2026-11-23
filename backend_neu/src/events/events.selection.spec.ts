
import {
  describe,
  it,
  expect,
  jest,
} from '@jest/globals';

import { InternalServerErrorException } from '@nestjs/common';
import { EventsService } from './events.service';

describe('EventsService - Auswahlmenü', () => {
  const service = new EventsService();

  // Supabase-Datenbank für Unit-Tests simulieren
  function createSupabaseMock(
    data: any[],
    error: any = null,
  ) {
    const order = jest.fn(
      async (
        _column: string,
        _options: { ascending: boolean },
      ) => ({
        data,
        error,
      }),
    );

    const select = jest.fn(
      (_columns: string) => ({
        order,
      }),
    );

    const from = jest.fn(
      (_table: string) => ({
        select,
      }),
    );

    return {
      from,
      select,
      order,
    };
  }

  // Test 1: Statische und normale Ereignisse trennen
  it('trennt normale und statische Ereignisse', async () => {
    const mock = createSupabaseMock([
      {
        id: '1',
        name: 'Lehrveranstaltung',
        type: 'statisch',
      },
      {
        id: '2',
        name: 'Nebenjob',
        type: 'statisch',
      },
      {
        id: '3',
        name: 'Sport',
        type: 'normal',
      },
      {
        id: '4',
        name: 'Lernzeit',
        type: 'normal',
      },
    ]);

    const result = await service.findForSelection(
      mock,
      'test-user',
    );

    expect(result.staticEvents).toEqual([
      {
        id: '1',
        name: 'Lehrveranstaltung',
      },
      {
        id: '2',
        name: 'Nebenjob',
      },
    ]);

    expect(result.normalEvents).toEqual([
      {
        id: '3',
        name: 'Sport',
      },
      {
        id: '4',
        name: 'Lernzeit',
      },
    ]);

    // Richtige Tabelle und Spalten überprüfen
    expect(mock.from).toHaveBeenCalledWith('events');

    expect(mock.select).toHaveBeenCalledWith(
      'id, name, type',
    );

    // Alphabetische Sortierung anfordern
    expect(mock.order).toHaveBeenCalledWith(
      'name',
      { ascending: true },
    );
  });

  // Test 2: Keine Ereignisse vorhanden
  it('gibt leere Listen zurück, wenn keine Ereignisse vorhanden sind', async () => {
    const mock = createSupabaseMock([]);

    const result = await service.findForSelection(
      mock,
      'test-user',
    );

    expect(result.staticEvents).toEqual([]);
    expect(result.normalEvents).toEqual([]);
  });

  // Test 3: Datenbankfehler behandeln
  it('meldet Datenbankfehler', async () => {
    const mock = createSupabaseMock(
      [],
      {
        message: 'Datenbankfehler',
      },
    );

    await expect(
      service.findForSelection(
        mock,
        'test-user',
      ),
    ).rejects.toThrow(
      InternalServerErrorException,
    );
  });
});
