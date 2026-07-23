-- Adiciona o tipo de marcha (MB/MP) a categoria em julgamento no momento.
alter table nm_categoria_atual
  add column if not exists tipo_marcha text check (tipo_marcha in ('MB', 'MP'));

-- Precisa dropar porque o tipo de retorno mudou de text para uma linha (categoria, tipo_marcha).
drop function if exists nm_get_categoria_atual();

create or replace function nm_get_categoria_atual()
returns table(categoria text, tipo_marcha text)
language sql
security definer
set search_path = public
as $$
  select categoria, tipo_marcha from nm_categoria_atual where id = 1;
$$;

grant execute on function nm_get_categoria_atual() to anon, authenticated;

drop function if exists nm_admin_set_categoria_atual(text);

create or replace function nm_admin_set_categoria_atual(p_categoria text, p_tipo_marcha text)
returns void
language sql
security definer
set search_path = public
as $$
  update nm_categoria_atual
  set categoria = p_categoria, tipo_marcha = p_tipo_marcha, updated_at = now()
  where id = 1;
$$;

grant execute on function nm_admin_set_categoria_atual(text, text) to anon, authenticated;
