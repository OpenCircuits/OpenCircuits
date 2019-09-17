-- The initial schema for circuits.  All migrations will be run after this.  Until the migration code is setup, this
--  acts as the entire schema

-- name: create-migrations-table
CREATE TABLE migrations (name TEXT NOT NULL PRIMARY KEY UNIQUE);

-- name: create-circuits-table
CREATE TABLE circuits (id TEXT PRIMARY KEY UNIQUE,
                       name TEXT NOT NULL,
                       designer TEXT NOT NULL,
                       ownerId TEXT NOT NULL,
                       version TEXT NOT NULL,
                       thumbnail TEXT NOT NULL);

-- name: append-migration
INSERT INTO migrations (name) VALUES (?);

-- name: check-migration
SELECT 1 FROM migrations WHERE name=?;
