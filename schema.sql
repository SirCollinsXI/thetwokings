-- The Two Kings v2.1.0: gemeinsame sichere Leaderboard-Struktur
begin;

create table if not exists public.leaderboard (
  id bigint generated always as identity primary key,
  name text not null,
  score integer not null,
  "avatarDataUrl" text,
  comment text,
  created_at timestamptz not null default now(),
  session_id uuid,
  completed_at timestamptz,
  client_version text,
  verified boolean not null default false,
  game_type text not null default 'bogen'
);

alter table public.leaderboard add column if not exists created_at timestamptz not null default now();
alter table public.leaderboard add column if not exists session_id uuid;
alter table public.leaderboard add column if not exists completed_at timestamptz;
alter table public.leaderboard add column if not exists client_version text;
alter table public.leaderboard add column if not exists verified boolean not null default false;
alter table public.leaderboard add column if not exists game_type text not null default 'bogen';

update public.leaderboard set
  name=left(coalesce(nullif(trim(name),''),'Anonym'),15),
  comment=left(coalesce(comment,''),120),
  score=greatest(1000,least(coalesce(score,3600000),3600000)),
  "avatarDataUrl"=case when "avatarDataUrl" is null then null when char_length("avatarDataUrl")<=150000 and "avatarDataUrl" like 'data:image/png;base64,%' then "avatarDataUrl" else null end;

alter table public.leaderboard drop constraint if exists leaderboard_name_length_check;
alter table public.leaderboard drop constraint if exists leaderboard_comment_length_check;
alter table public.leaderboard drop constraint if exists leaderboard_score_range_check;
alter table public.leaderboard drop constraint if exists leaderboard_avatar_format_check;
alter table public.leaderboard drop constraint if exists leaderboard_client_version_length_check;
alter table public.leaderboard drop constraint if exists leaderboard_game_type_check;
alter table public.leaderboard add constraint leaderboard_name_length_check check(char_length(trim(name)) between 1 and 15);
alter table public.leaderboard add constraint leaderboard_comment_length_check check(char_length(coalesce(comment,''))<=120);
alter table public.leaderboard add constraint leaderboard_score_range_check check(score between 1000 and 3600000);
alter table public.leaderboard add constraint leaderboard_avatar_format_check check("avatarDataUrl" is null or (char_length("avatarDataUrl")<=150000 and "avatarDataUrl" like 'data:image/png;base64,%'));
alter table public.leaderboard add constraint leaderboard_client_version_length_check check(client_version is null or char_length(client_version)<=20);
alter table public.leaderboard add constraint leaderboard_game_type_check check(game_type in ('bogen','trex'));
create unique index if not exists leaderboard_session_id_unique on public.leaderboard(session_id) where session_id is not null;
create index if not exists leaderboard_game_score_idx on public.leaderboard(game_type,score asc,created_at asc);

alter table public.leaderboard enable row level security;
drop policy if exists "Leaderboard öffentlich lesen" on public.leaderboard;
drop policy if exists "Leaderboard Einträge hinzufügen" on public.leaderboard;
create policy "Leaderboard öffentlich lesen" on public.leaderboard for select to anon,authenticated using(true);
revoke all on table public.leaderboard from anon,authenticated;
grant select on table public.leaderboard to anon,authenticated;

commit;
