CREATE TABLE IF NOT EXISTS candidates (id TEXT PRIMARY KEY, title TEXT NOT NULL, source_url TEXT NOT NULL, source_date TEXT, region TEXT, audience TEXT, status TEXT NOT NULL DEFAULT 'candidate', draft TEXT, created_at TEXT NOT NULL, reviewed_at TEXT);
CREATE TABLE IF NOT EXISTS learning_events (id TEXT PRIMARY KEY, scenario_id TEXT NOT NULL, kind TEXT NOT NULL, first_try INTEGER NOT NULL, hints INTEGER NOT NULL, first_verdict TEXT, created_at TEXT NOT NULL);
CREATE INDEX IF NOT EXISTS learning_scenario ON learning_events(scenario_id);
