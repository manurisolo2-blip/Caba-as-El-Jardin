-- =========================================================================
-- SISTEMA DE RESERVAS | PASO 2: DAR PERMISOS DE ADMINISTRADOR
-- -------------------------------------------------------------------------
-- Ejecutar DESPUÉS de:
--   a) haber ejecutado 1-crear-base-de-datos.sql
--   b) haber creado el usuario en Supabase > Authentication > Users
--
-- Cómo usarlo:
--   1. Reemplazar CORREO_DEL_ADMINISTRADOR por el correo del usuario creado
--      (dejando las comillas simples). Ejemplo de formato: 'nombre@dominio.com'
--   2. SQL Editor > New query > pegar > Run.
--   3. Debe mostrar una fila con el correo: eso confirma que quedó registrado.
-- =========================================================================

insert into public.administradores (user_id)
select id
from auth.users
where email = lower('CORREO_DEL_ADMINISTRADOR')
on conflict (user_id) do nothing;

-- Verificación: lista los administradores registrados
select u.email, a.creado_en
from public.administradores a
join auth.users u on u.id = a.user_id;


-- -------------------------------------------------------------------------
-- Para QUITAR permisos de administrador a un usuario (opcional):
--
-- delete from public.administradores
-- where user_id = (select id from auth.users where email = lower('CORREO_DEL_ADMINISTRADOR'));
-- -------------------------------------------------------------------------
