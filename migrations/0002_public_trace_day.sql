CREATE TABLE IF NOT EXISTS public_trace_day (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  day TEXT NOT NULL,
  wave INTEGER NOT NULL CHECK (wave >= 0),
  star INTEGER NOT NULL CHECK (star >= 0),
  crown INTEGER NOT NULL CHECK (crown >= 0),
  window_minute INTEGER NOT NULL,
  window_count INTEGER NOT NULL CHECK (window_count BETWEEN 0 AND 60)
);
INSERT OR IGNORE INTO public_trace_day VALUES (1, '', 0, 0, 0, 0, 0);
