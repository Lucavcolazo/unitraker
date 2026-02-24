-- ════════════════════════════════════════════════════════
-- UniTraker — Notas por materia (promoción directa / final)
-- Ejecutar en Supabase SQL Editor
-- ════════════════════════════════════════════════════════

-- Nota por promoción directa (sin final). NULL si aprobó por final.
ALTER TABLE public.subject_states
  ADD COLUMN IF NOT EXISTS grade_direct NUMERIC NULL
  CHECK (grade_direct IS NULL OR (grade_direct >= 1 AND grade_direct <= 10));

-- Notas de examen final (uno o más intentos). Vacío si aprobó por promoción directa.
ALTER TABLE public.subject_states
  ADD COLUMN IF NOT EXISTS grade_finals NUMERIC[] DEFAULT '{}';

-- Restricción: cada elemento del array entre 1 y 10 (se puede validar con CHECK + función)
-- Por simplicidad no añadimos CHECK en el array; la app valida 1-10.
