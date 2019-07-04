package db

import (
	"database/sql"
	"github.com/OpenCircuits/OpenCircuits/site/go/model"
	_ "github.com/mattn/go-sqlite3"
)

type baseSqlDb struct {
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
	sqlDb.createEntryStmt, err = db.Prepare("INSERT INTO circuits(content, ownerId, name) VALUES (?, ?, ?)")
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

func (d baseSqlDb) LoadCircuit(id int64) (*model.Circuit, error) {
	var c model.Circuit
	err := d.loadEntryStmt.QueryRow(id).Scan(&c.Id, &c.Content, &c.Metadata.Name, &c.Metadata.Owner)
	if err == sql.ErrNoRows {
		return nil, nil
	} else if err != nil {
		return nil, err
	}
	return &c, nil
}
func (d baseSqlDb) EnumerateCircuits(userId string) ([]model.CircuitHandle, error) {
	rows, err := d.enumCircuitsStmt.Query(userId)
	if err != nil {
		return nil, err
	}
	var c model.CircuitHandle
	var cs []model.CircuitHandle
	for rows.Next() {
		err := rows.Scan(&c.Id, &c.Metadata.Name, &c.Metadata.Owner)
		if err != nil {
			return nil, err
		}
		cs = append(cs, c)
	}
	return cs, rows.Close()
}
func (d baseSqlDb) CreateCircuit(circuit *model.Circuit) error {
	res, err := d.createEntryStmt.Exec(circuit.Content, circuit.Id)
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
