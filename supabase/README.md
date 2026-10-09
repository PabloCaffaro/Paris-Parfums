# Supabase

1. Ejecuta la migración de `migrations/` en el SQL Editor del proyecto.
2. Crea el usuario administrador en **Authentication > Users**.
3. Inserta su UUID en `public.admin_users`.
4. Copia URL y Publishable key a `.env.local`, siguiendo `.env.example`.

Nunca expongas una `service_role` key en el navegador.
