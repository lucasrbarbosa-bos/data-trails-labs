-- Case study: creator marketplace (chapter 8), in its own schema.
-- Loaded by the lab engine when marketplace.creators is missing (see trails/sql/trail.json).
-- The engine runs each dataset in a single transaction, so there is no BEGIN/COMMIT here.

CREATE SCHEMA IF NOT EXISTS marketplace;
SET LOCAL search_path = marketplace;

CREATE TABLE creators (
  creator_id  INT PRIMARY KEY,
  name        TEXT NOT NULL,
  country     TEXT NOT NULL,
  signup_date DATE NOT NULL
);

CREATE TABLE samples (
  sample_id  INT PRIMARY KEY,
  creator_id INT NOT NULL REFERENCES creators (creator_id),
  title      TEXT NOT NULL
);

CREATE TABLE licenses (
  license_id    INT PRIMARY KEY,
  sample_id     INT NOT NULL REFERENCES samples (sample_id),
  price         NUMERIC(10, 2) NOT NULL,
  purchase_date DATE NOT NULL
);

CREATE TABLE creator_payouts (
  payout_id  INT PRIMARY KEY,
  creator_id INT NOT NULL REFERENCES creators (creator_id),
  license_id INT NOT NULL REFERENCES licenses (license_id),
  amount     NUMERIC(10, 2) NOT NULL,
  status     TEXT NOT NULL
);

INSERT INTO creators VALUES
  (1, 'Ana Costa',  'BR', '2024-03-10'),
  (2, 'Ben Carter', 'US', '2023-11-02'),
  (3, 'Nova',       'US', '2025-01-15'),
  (4, 'Nova',       'US', '2025-06-01'),
  (5, 'Kai Tanaka', 'JP', '2026-02-20'),
  (6, 'Lea Martin', 'FR', '2025-09-05');

INSERT INTO samples VALUES
  (101, 1, 'Warm Rhodes Chords'),
  (102, 1, 'Bossa Guitar Loop'),
  (103, 2, 'Trap Hi-Hats Vol. 2'),
  (104, 3, 'Ambient Pad Swell'),
  (105, 4, 'Lo-fi Vinyl Drums'),
  (106, 6, 'French Horn Stabs'),
  (107, 2, '808 Bass One-Shots');

INSERT INTO licenses VALUES
  (1001, 101, 20.00, '2026-05-01'),
  (1002, 102, 30.00, '2026-06-12'),
  (1003, 101, 20.00, '2026-07-03'),
  (1004, 103, 40.00, '2026-05-20'),
  (1005, 107, 30.00, '2026-08-15'),
  (1006, 104, 15.00, '2026-09-01'),
  (1007, 105, 25.00, '2026-09-10'),
  (1008, 105, 25.00, '2026-10-05');

INSERT INTO creator_payouts VALUES
  (1, 1, 1001, 10.00, 'paid'),
  (2, 1, 1002, 15.00, 'paid'),
  (3, 1, 1003, 10.00, 'pending'),
  (4, 2, 1004, 20.00, 'failed'),
  (5, 2, 1004, 20.00, 'paid'),
  (6, 2, 1005, 15.00, 'paid'),
  (7, 3, 1006,  7.50, 'paid'),
  (8, 4, 1007, 12.50, 'paid');

-- Unqualified names (FROM creators) resolve in both schemas for new sessions.
DO $$
BEGIN
    EXECUTE format('ALTER DATABASE %I SET search_path = public, marketplace', current_database());
END
$$;

