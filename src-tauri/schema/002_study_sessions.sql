-- 2: each study mode's unfinished round per set, which both windows carry on.
-- `data` is JSON in the shapes of src/lib/flashcards/saved.ts: card ids and
-- each card's state in the round, not the cards' text (only the answer on
-- screen, as typed or picked). Deleting a set takes its rows.
CREATE TABLE study_sessions (
  set_id     INTEGER NOT NULL REFERENCES sets(id) ON DELETE CASCADE,
  mode       TEXT NOT NULL CHECK (mode IN ('cards', 'write', 'learn')),
  data       TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  PRIMARY KEY (set_id, mode)
);
