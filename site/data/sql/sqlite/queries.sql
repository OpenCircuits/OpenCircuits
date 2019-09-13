-- name: load-circuit-entry
SELECT id, designer, name, ownerId, version, thumbnail FROM circuits WHERE id=?;

-- name: store-circuit-entry
UPDATE circuits SET designer=?, name=?, ownerId=?, version=?, thumbnail=? WHERE id=?;

-- name: create-circuit-entry
INSERT INTO circuits(designer, ownerId, name, version, thumbnail) VALUES (?, ?, ?, ?, ?);

-- name: query-user-circuits
SELECT id, name, ownerId, version, thumbnail FROM circuits WHERE ownerId=?;
