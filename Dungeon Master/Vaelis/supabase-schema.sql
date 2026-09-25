-- Ejecutar en el SQL Editor de Supabase (proyecto ya usado por la app: spell_selections)
-- Estas tablas/columnas alimentan: tipo de hechizo por tarjeta (Daño/Efecto), niveles de personaje
-- y creación de hechizos por el Dungeon Master.

-- 1) Tipo de hechizo por tarjeta: el Dungeon Master lo fija desde "Hechizos equipados" y se refleja
--    en el resto de pestañas/usuarios para ese mismo hechizo.
alter table spell_selections add column if not exists spell_type text;

-- 1b) Imagen por hechizo: el Dungeon Master la sube (o pega una URL) desde la pestaña de cada
--     personaje cuando la tarjeta no tiene imagen, y se refleja para todos los usuarios.
alter table spell_selections add column if not exists spell_image text;

-- (Opcional) Si ya habías creado antes la tabla "app_state" del filtro global, ya no se usa: puedes borrarla.
-- drop table if exists app_state;

-- 2) Niveles de personaje: PX y estrellas (0-4) por nivel de hechizo (1-9), asignados por el Dungeon Master
create table if not exists character_levels (
  character_id text primary key,
  px_level integer not null default 0,
  stars jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- 3) Hechizos personalizados creados por el Dungeon Master (tarjeta en blanco)
create table if not exists custom_spells (
  id uuid primary key default gen_random_uuid(),
  owner text not null,
  name text not null,
  description text,
  type text,
  level text,
  range text,
  effect text,
  concentration text,
  image text,
  created_at timestamptz not null default now()
);

-- Habilitar Realtime (opcional, recomendado) para reflejar los cambios sin esperar el sondeo de 5s de la app:
-- En el Table Editor de Supabase, abre cada tabla (character_levels, custom_spells, spell_selections)
-- y activa el interruptor "Enable Realtime" en su panel de configuración (icono de engranaje / "..." > Edit table).

-- Políticas RLS: se usan las mismas políticas abiertas ya existentes para "spell_selections" (acceso con la clave pública anon).
-- Ajusta estas políticas según tus necesidades de seguridad; están pensadas para un grupo cerrado de jugadores de confianza.
alter table character_levels enable row level security;
alter table custom_spells enable row level security;

drop policy if exists "character_levels anon all" on character_levels;
create policy "character_levels anon all" on character_levels for all to anon using (true) with check (true);

drop policy if exists "custom_spells anon all" on custom_spells;
create policy "custom_spells anon all" on custom_spells for all to anon using (true) with check (true);

