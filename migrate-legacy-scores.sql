-- EINMALIGE Migration bestehender gemischter Scores
-- Fachregel: Alle bereits vorhandenen Scores unter 2:00,00 Minuten gehören zu T. rex.
-- 2:00,00 Minuten selbst und längere Zeiten bleiben Bogen.

begin;

update public.leaderboard
set game_type = 'trex'
where score < 120000;

update public.leaderboard
set game_type = 'bogen'
where score >= 120000;

commit;

-- Kontrolle
select game_type, count(*) as eintraege,
       min(score) as schnellster_score_ms,
       max(score) as langsamster_score_ms
from public.leaderboard
group by game_type
order by game_type;
