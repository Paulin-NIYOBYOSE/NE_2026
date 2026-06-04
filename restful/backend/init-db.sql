-- ============================================================
-- Fire Extinguisher Management System — Database Initialisation
-- ============================================================
-- Creates per-service schemas and seeds two initial accounts.

-- ── Schemas (one per microservice) ─────────────────────────
CREATE SCHEMA IF NOT EXISTS auth_schema;
CREATE SCHEMA IF NOT EXISTS user_schema;
CREATE SCHEMA IF NOT EXISTS extinguisher_schema;
CREATE SCHEMA IF NOT EXISTS inspection_schema;
CREATE SCHEMA IF NOT EXISTS maintenance_schema;
CREATE SCHEMA IF NOT EXISTS reporting_schema;
CREATE SCHEMA IF NOT EXISTS notification_schema;

-- ── Permissions ─────────────────────────────────────────────
GRANT ALL PRIVILEGES ON SCHEMA auth_schema         TO postgres;
GRANT ALL PRIVILEGES ON SCHEMA user_schema         TO postgres;
GRANT ALL PRIVILEGES ON SCHEMA extinguisher_schema TO postgres;
GRANT ALL PRIVILEGES ON SCHEMA inspection_schema   TO postgres;
GRANT ALL PRIVILEGES ON SCHEMA maintenance_schema  TO postgres;
GRANT ALL PRIVILEGES ON SCHEMA reporting_schema    TO postgres;
GRANT ALL PRIVILEGES ON SCHEMA notification_schema TO postgres;

-- ============================================================
-- NOTE: The tables below are created automatically by TypeORM
-- (synchronize: true).  The INSERT statements seed the two
-- required initial accounts ONLY if the table already exists.
-- Run this seed block AFTER all services have started once.
-- ============================================================

-- ── Seed initial users (auth_schema.users) ──────────────────
-- Passwords are bcrypt-hashed (10 rounds):
--   admin@tzw.com  →  Admin123!
--   user@tzw.com   →  User123!

DO $$
BEGIN
  -- Only run if the users table exists (i.e. services have started)
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'auth_schema' AND table_name = 'users'
  ) THEN

    INSERT INTO auth_schema.users
      (id, email, password, "firstName", "lastName", role, "isActive", "createdAt", "updatedAt")
    VALUES
      (
        gen_random_uuid(),
        'admin@tzw.com',
        '$2b$10$OgTJCUEjWIBcVRZn8afVb.aMAt1f42bvb7O.wer0GoTqM4gZIlGMe',
        'System',
        'Admin',
        'admin',
        true,
        NOW(),
        NOW()
      ),
      (
        gen_random_uuid(),
        'user@tzw.com',
        '$2b$10$ygCAOcQdiW8U.7tt410I9ezMtdL25pLiJX0.5myklj2MX9Y3TBjwC',
        'Test',
        'User',
        'user',
        true,
        NOW(),
        NOW()
      )
    ON CONFLICT (email) DO NOTHING;

    RAISE NOTICE 'Seed users inserted (or already existed).';
  ELSE
    RAISE NOTICE 'auth_schema.users table not found — start services first, then re-run seed.';
  END IF;
END
$$;
