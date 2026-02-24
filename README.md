# UniTraker

Bienvenido a **UniTraker**: tu compañero para llevar el progreso de la carrera al día.

Acá podés marcar qué materias ya aprobaste, cuáles tenés en final y cuáles te faltan. Tenés un mapa del plan de estudios, estadísticas de avance y la posibilidad de comparar tu progreso con amigos.


![unitrakerscreen](https://github.com/user-attachments/assets/932896d0-a6af-4783-822e-61fbf6fa1e2c)


---

**Para desarrolladores:** clonar el repo, copiar `.env.example` a `.env` y configurar `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`. Los scripts SQL están en la carpeta `supabase/` (ver orden en `supabase/README.md`). En Vercel, `vercel.json` hace que todas las rutas de la app sirvan el SPA (evita 404 al recargar en `/app/map`); los usuarios no logueados que entren a `/app/*` son redirigidos a la bienvenida `/` desde el cliente.
