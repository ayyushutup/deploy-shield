-- Deploy‑Shield PostgreSQL schema
CREATE TABLE IF NOT EXISTS apps (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  repo TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS security_logs (
  id SERIAL PRIMARY KEY,
  app_id INTEGER REFERENCES apps(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  ip INET,
  created_at TIMESTAMPTZ DEFAULT now()
);
