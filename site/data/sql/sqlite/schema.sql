-- The initial schema for circuits.  All migrations will be run after this.  Until the migration code is setup, this
--  acts as the entire schema

-- name: create-migrations-table
CREATE TABLE migrations (name TEXT NOT NULL PRIMARY KEY UNIQUE);

-- name: create-circuits-table
CREATE TABLE circuits (id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE, name TEXT NOT NULL, designer TEXT NOT NULL, ownerId TEXT);

-- name: append-migration
INSERT INTO migrations (name) VALUES (?);

-- name: check-migration
SELECT 1 FROM migrations WHERE name=?;
