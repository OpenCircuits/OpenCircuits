package storage

import (
	"database/sql"
	"github.com/OpenCircuits/OpenCircuits/site/go/core"
	"github.com/OpenCircuits/OpenCircuits/site/go/core/model"
)

type sqlCircuitStorageInterface struct {
	db *sql.DB

	loadEntryStmt    *sql.Stmt
	storeEntryStmt   *sql.Stmt
	createEntryStmt  *sql.Stmt
	enumCircuitsStmt *sql.Stmt
}

func genBaseSqlDb(db *sql.DB) (baseSqlDb, error) {
	var sqlDb = baseSqlDb{db: db}
	var err error

	// TODO: just make this a .sql file
	createCircuitStmt, err := db.Prepare("CREATE TABLE IF NOT EXISTS circuits (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, content TEXT NOT NULL, ownerId TEXT)")
	if err != nil {
		return sqlDb, err
	}
	_, err = createCircuitStmt.Exec()
	if err != nil {
		return sqlDb, err
	}

	// Generate the statements for storing/loading from a generic SQL db
	sqlDb.loadEntryStmt, err = db.Prepare("SELECT id, content, name, ownerId FROM circuits WHERE id=?")
	if err != nil {
		return sqlDb, err
	}
	sqlDb.storeEntryStmt, err = db.Prepare("UPDATE circuits SET content=? WHERE id=?")
	if err != nil {
		return sqlDb, err
	}
	sqlDb.createEntryStmt, err = db.Prepare("INSERT INTO circuits(content, ownerId, name) VALUES ('', '', '')")
	if err != nil {
		return sqlDb, err
	}
	sqlDb.enumCircuitsStmt, err = db.Prepare("SELECT id, name, ownerId FROM circuits WHERE ownerId=?")
	if err != nil {
		return sqlDb, err
	}

	// Return success
	return sqlDb, nil
}

func (d sqlCircuitStorageInterface) LoadCircuit(id core.CircuitId) *model.Circuit {
	var c model.Circuit
	err := d.loadEntryStmt.QueryRow(id).Scan(&c.Metadata.Id, &c.Content, &c.Metadata.Name, &c.Metadata.Owner)
	if err == sql.ErrNoRows || err != nil {
		return nil
	}
	return &c
}
func (d sqlCircuitStorageInterface) EnumerateCircuits(userId core.UserId) []model.CircuitMetadata {
	rows, err := d.enumCircuitsStmt.Query(userId)
	defer rows.Close()

	if err != nil {
		return nil
	}
	var c model.CircuitMetadata
	var cs []model.CircuitMetadata
	for rows.Next() {
		err := rows.Scan(&c.Id, &c.Name, &c.Owner)
		if err != nil {
			return nil
		}
		cs = append(cs, c)
	}
	return cs
}
func (d sqlCircuitStorageInterface) NewCircuit() model.Circuit {
	res, err := d.createEntryStmt.Exec()
	if err != nil {
		return err
	}
	id, err := res.LastInsertId()
	if err != nil {
		return err
	}
	circuit.Id = id
	return nil
}
func (d baseSqlDb) UpdateCircuit(circuit *model.Circuit) error {
	_, err := d.storeEntryStmt.Exec(circuit.Content, circuit.Id)
	return err
}
func (d baseSqlDb) Close() {
	d.Close()
}
