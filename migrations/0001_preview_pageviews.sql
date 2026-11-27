CREATE TABLE IF NOT EXISTS preview_homepage_views (
  day TEXT PRIMARY KEY,
  views INTEGER NOT NULL CHECK (views > 0)
) WITHOUT ROWID;
