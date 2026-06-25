-- ============================================================
-- Migration: stress_entries Tabelle
-- TASK-027, TASK-028, TS-001, TS-002
-- ============================================================

-- Tabelle erstellen
CREATE TABLE IF NOT EXISTS public.stress_entries (
  id          uuid          DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     uuid          NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  stress_level  integer     NOT NULL CHECK (stress_level BETWEEN 1 AND 10),
  energy_level  integer     NOT NULL CHECK (energy_level BETWEEN 1 AND 10),
  note        text,
  recorded_at timestamptz   NOT NULL DEFAULT now()   -- TS-002: automatischer Zeitstempel
);

-- Index für schnelles Laden nach User + Zeitstempel (US-050, TASK-036)
CREATE INDEX IF NOT EXISTS idx_stress_entries_user_time
  ON public.stress_entries (user_id, recorded_at ASC);

-- ============================================================
-- Row Level Security (RLS) — US-050: nur eigene Daten sichtbar
-- ============================================================
ALTER TABLE public.stress_entries ENABLE ROW LEVEL SECURITY;

-- Nutzer sieht nur seine eigenen Einträge
CREATE POLICY "Eigene Einträge lesen"
  ON public.stress_entries
  FOR SELECT
  USING (auth.uid() = user_id);

-- Nutzer kann nur eigene Einträge anlegen
CREATE POLICY "Eigene Einträge erstellen"
  ON public.stress_entries
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Nutzer kann nur eigene Einträge löschen
CREATE POLICY "Eigene Einträge löschen"
  ON public.stress_entries
  FOR DELETE
  USING (auth.uid() = user_id);

-- Service-Role (Backend) umgeht RLS — daher SERVICE_ROLE_KEY im Backend verwenden
-- anon-Key niemals im Backend!
