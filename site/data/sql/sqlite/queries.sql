-- name: load-circuit-entry
SELECT id, designer, name, ownerId FROM circuits WHERE id=?;

-- name: store-circuit-entry
UPDATE circuits SET designer=?, name=?, ownerId=? WHERE id=?;

-- name: create-circuit-entry
INSERT INTO circuits(designer, ownerId, name) VALUES (?, ?, ?);

-- name: query-user-circuits
SELECT id, name, ownerId FROM circuits WHERE ownerId=?;
