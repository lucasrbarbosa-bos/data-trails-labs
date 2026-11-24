-- Dataset for the course (only used when its engine is "postgres").
--
-- The engine loads this file when __SCHEMA__.notes does not exist yet (the "check"
-- in course.json), inside a single transaction, so:
--   * keep everything in the course's own schema, never in public;
--   * do not write BEGIN / COMMIT here;
--   * the check relation should be created by this dataset.
CREATE SCHEMA IF NOT EXISTS __SCHEMA__;

CREATE TABLE __SCHEMA__.notes (
    id       integer PRIMARY KEY,
    topic    text    NOT NULL,
    minutes  integer NOT NULL
);

INSERT INTO __SCHEMA__.notes (id, topic, minutes) VALUES
    (1, 'select',           15),
    (2, 'joins',            40),
    (3, 'window functions', 55);
