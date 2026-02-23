import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    throw new Error('Faltan las variables de entorno VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en .env');
}

// persistSession: true y storage en localStorage para que la sesión no se cierre al cerrar el navegador.
// El refresh token renueva el access token automáticamente para mantener la sesión mucho tiempo.
export const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        persistSession: true,
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
        autoRefreshToken: true,
    },
});
