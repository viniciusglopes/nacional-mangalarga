-- num_catalogo e texto, entao ordenar por ele direto ordena "10" antes de "2".
-- Esta coluna gerada guarda o valor numerico para ordenacao correta das listas.
alter table nm_animais
  add column if not exists num_catalogo_int int
  generated always as (
    case when num_catalogo ~ '^[0-9]+$' then num_catalogo::integer else null end
  ) stored;

create index if not exists nm_animais_num_catalogo_int_idx
  on nm_animais (num_catalogo_int);
