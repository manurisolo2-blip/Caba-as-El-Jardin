-- =========================================================================
-- SISTEMA DE RESERVAS | PASO 1: CREAR LA BASE DE DATOS Y LAS REGLAS
-- -------------------------------------------------------------------------
-- Cómo usarlo:
--   1. En Supabase, abrir "SQL Editor" > "New query".
--   2. Copiar TODO este archivo, pegarlo y tocar "Run".
--   3. Debe aparecer "Success. No rows returned".
--
-- Se puede ejecutar más de una vez: no borra reservas existentes.
--
-- Qué crea:
--   - reservas:        solicitudes de reserva de los huéspedes.
--   - bloqueos:        fechas bloqueadas a mano por el administrador.
--   - administradores: usuarios con permiso para usar el panel.
--   - Reglas de seguridad (RLS):
--       Visitantes:     consultar disponibilidad y crear solicitudes.
--       Administrador:  ver, confirmar, cancelar y eliminar reservas;
--                       bloquear y desbloquear fechas.
-- =========================================================================


-- Extensión necesaria para impedir reservas superpuestas
create extension if not exists btree_gist with schema extensions;


-- =========================================================================
-- 1. TABLAS
-- =========================================================================

create table if not exists public.administradores (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  creado_en  timestamptz not null default now()
);

create table if not exists public.reservas (
  id                  uuid primary key default gen_random_uuid(),
  cabana              smallint not null check (cabana between 1 and 3),
  fecha_entrada       date not null,
  fecha_salida        date not null,
  nombre_huesped      text not null check (char_length(nombre_huesped) between 2 and 80),
  -- EDITAR si cambia la capacidad máxima (hoy: 4 personas)
  cantidad_huespedes  smallint not null check (cantidad_huespedes between 1 and 4),
  mensaje             text check (char_length(mensaje) <= 500),
  creada_en           timestamptz not null default now(),
  estado              text not null default 'pendiente'
                      check (estado in ('pendiente', 'confirmada', 'cancelada')),

  constraint reservas_fechas_validas check (fecha_salida > fecha_entrada),

  -- Dos reservas activas (no canceladas) de la misma cabaña no pueden
  -- superponerse. La fecha de salida queda libre para una nueva entrada.
  constraint reservas_sin_superposicion exclude using gist (
    cabana with =,
    daterange(fecha_entrada, fecha_salida, '[)') with &&
  ) where (estado <> 'cancelada')
);

create index if not exists reservas_fecha_entrada_idx on public.reservas (fecha_entrada);

-- Bloqueos manuales: se bloquean todas las noches desde fecha_desde
-- hasta fecha_hasta, AMBAS INCLUIDAS.
create table if not exists public.bloqueos (
  id           uuid primary key default gen_random_uuid(),
  cabana       smallint not null check (cabana between 1 and 3),
  fecha_desde  date not null,
  fecha_hasta  date not null,
  motivo       text check (char_length(motivo) <= 120),
  creado_en    timestamptz not null default now(),

  constraint bloqueos_fechas_validas check (fecha_hasta >= fecha_desde)
);


-- =========================================================================
-- 2. FUNCIONES
-- =========================================================================

-- ¿El usuario que hace la consulta es administrador?
create or replace function public.es_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.administradores a
    where a.user_id = auth.uid()
  );
$$;

-- Limpia y valida cada reserva antes de guardarla
create or replace function public.preparar_reserva()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.nombre_huesped := btrim(new.nombre_huesped);
  new.mensaje := nullif(btrim(coalesce(new.mensaje, '')), '');

  -- Un visitante no puede elegir el estado, la fecha de creación ni el id
  if tg_op = 'INSERT' and not public.es_admin() then
    new.id := gen_random_uuid();
    new.estado := 'pendiente';
    new.creada_en := now();
  end if;

  -- No permitir reservas activas sobre fechas bloqueadas
  if new.estado <> 'cancelada' and exists (
    select 1
    from public.bloqueos b
    where b.cabana = new.cabana
      and daterange(b.fecha_desde, b.fecha_hasta, '[]')
          && daterange(new.fecha_entrada, new.fecha_salida, '[)')
  ) then
    raise exception 'FECHAS_BLOQUEADAS' using errcode = 'P0001';
  end if;

  return new;
end;
$$;

drop trigger if exists reservas_preparar on public.reservas;
create trigger reservas_preparar
  before insert or update on public.reservas
  for each row execute function public.preparar_reserva();

-- Disponibilidad pública: devuelve SOLO cabaña y noches ocupadas
-- (sin nombres, mensajes ni ningún otro dato de los huéspedes).
-- fecha_desde y fecha_hasta son noches ocupadas, ambas incluidas.
create or replace function public.obtener_disponibilidad(p_desde date, p_hasta date)
returns table (cabana smallint, fecha_desde date, fecha_hasta date)
language sql
stable
security definer
set search_path = ''
as $$
  select r.cabana, r.fecha_entrada, r.fecha_salida - 1
  from public.reservas r
  where r.estado <> 'cancelada'
    and r.fecha_salida > p_desde
    and r.fecha_entrada <= p_hasta
  union all
  select b.cabana, b.fecha_desde, b.fecha_hasta
  from public.bloqueos b
  where b.fecha_hasta >= p_desde
    and b.fecha_desde <= p_hasta;
$$;


-- =========================================================================
-- 3. PERMISOS
-- =========================================================================

alter table public.administradores enable row level security;
alter table public.reservas enable row level security;
alter table public.bloqueos enable row level security;

-- Se parte de cero y se habilita solo lo necesario
revoke all on public.administradores from anon, authenticated;
revoke all on public.reservas from anon, authenticated;
revoke all on public.bloqueos from anon, authenticated;

grant usage on schema public to anon, authenticated;
grant insert on public.reservas to anon, authenticated;
grant select, update, delete on public.reservas to authenticated;
grant select, insert, update, delete on public.bloqueos to authenticated;

revoke execute on function public.es_admin() from public, anon;
grant execute on function public.es_admin() to authenticated;

revoke execute on function public.preparar_reserva() from public, anon, authenticated;

revoke execute on function public.obtener_disponibilidad(date, date) from public;
grant execute on function public.obtener_disponibilidad(date, date) to anon, authenticated;


-- =========================================================================
-- 4. REGLAS DE SEGURIDAD (RLS)
-- =========================================================================

-- RESERVAS: cualquier visitante puede CREAR una solicitud pendiente
-- (desde hoy, hasta ~13 meses adelante y de hasta 30 noches).
drop policy if exists "Visitantes pueden solicitar reservas" on public.reservas;
create policy "Visitantes pueden solicitar reservas"
  on public.reservas
  for insert
  to anon, authenticated
  with check (
    estado = 'pendiente'
    and fecha_entrada >= (now() at time zone 'America/Argentina/Cordoba')::date
    and fecha_entrada <= (now() at time zone 'America/Argentina/Cordoba')::date + 400
    and fecha_salida - fecha_entrada <= 30
  );

-- RESERVAS: solo el administrador puede ver, modificar y eliminar
drop policy if exists "Administradores ven reservas" on public.reservas;
create policy "Administradores ven reservas"
  on public.reservas
  for select
  to authenticated
  using ((select public.es_admin()));

drop policy if exists "Administradores modifican reservas" on public.reservas;
create policy "Administradores modifican reservas"
  on public.reservas
  for update
  to authenticated
  using ((select public.es_admin()))
  with check ((select public.es_admin()));

drop policy if exists "Administradores eliminan reservas" on public.reservas;
create policy "Administradores eliminan reservas"
  on public.reservas
  for delete
  to authenticated
  using ((select public.es_admin()));

-- BLOQUEOS: solo el administrador (los visitantes los ven únicamente
-- como fechas ocupadas, a través de obtener_disponibilidad)
drop policy if exists "Administradores gestionan bloqueos" on public.bloqueos;
create policy "Administradores gestionan bloqueos"
  on public.bloqueos
  for all
  to authenticated
  using ((select public.es_admin()))
  with check ((select public.es_admin()));

-- ADMINISTRADORES: sin reglas = nadie puede leerla ni modificarla desde la web.
-- Se administra solamente desde el SQL Editor de Supabase (ver archivo 2).
