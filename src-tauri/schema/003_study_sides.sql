-- 3: the side Write and Learn last asked for, per set, so a new round starts
-- there instead of always on "answer with the term". It outlives the round
-- (study_sessions forgets a finished one). Deleting a set takes its rows.
CREATE TABLE study_sides (
  set_id      INTEGER NOT NULL REFERENCES sets(id) ON DELETE CASCADE,
  mode        TEXT NOT NULL CHECK (mode IN ('write', 'learn')),
  answer_with TEXT NOT NULL CHECK (answer_with IN ('term', 'definition')),
  PRIMARY KEY (set_id, mode)
);
