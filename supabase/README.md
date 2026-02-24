# Scripts de base de datos (Supabase)

Ejecutar en el SQL Editor de Supabase en este orden:

1. **schema.sql** — Tablas base (profiles, subject_states, RLS, triggers).
2. **plans.sql** — Planes de estudio (curriculum_plans, plan_subjects, profiles.active_plan_id).
3. **friends.sql** — Amigos y columnas extra en profiles (degree_track, profile_color, etc.).
4. **grades.sql** — Notas por materia (grade_direct, grade_finals en subject_states) para promedios.
