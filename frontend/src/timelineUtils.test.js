import { describe, it, expect } from 'vitest';
import { findConflicts } from './timelineUtils';

describe('findConflicts() - Doppelte / Überschneidende Termine', () => {
  
  it('sollte einen Konflikt erkennen, wenn sich Zeiten am selben Tag überschneiden', () => {
    const existingEvents = [
      {
        name: 'Vorlesung',
        event_date: '2026-06-06',
        start: '09:00',
        end: '11:00',
      },
    ];


    const newOccurrence = {
      event_date: '2026-06-06',
      start: '10:00',
      end: '12:00',
    };


    const conflicts = findConflicts(newOccurrence, existingEvents);


    expect(conflicts.length).toBe(1);
    expect(conflicts[0].name).toBe('Vorlesung');
  });

  it('sollte KEINEN Konflikt erkennen, wenn die Zeiten nacheinander stattfinden', () => {
    const existingEvents = [
      {
        name: 'Vorlesung',
        event_date: '2026-06-06',
        start: '09:00',
        end: '11:00',
      },
    ];

    const newOccurrence = {
      event_date: '2026-06-06',
      start: '11:00',
      end: '12:00',
    };

    const conflicts = findConflicts(newOccurrence, existingEvents);


    expect(conflicts.length).toBe(0);
  });
});