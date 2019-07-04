package storage

import (
	"database/sql"
	"github.com/OpenCircuits/OpenCircuits/site/go/core"
	"github.com/OpenCircuits/OpenCircuits/site/go/core/model"
)

// TODO: how much of this can we factor out to a generic SQL implementation?
type sqliteCircuitStorageInterface struct {
	db *sql.DB

	loadEntryStmt    *sql.Stmt
	storeEntryStmt   *sql.Stmt
	createEntryStmt  *sql.Stmt
	enumCircuitsStmt *sql.Stmt
}

type SqliteCircuitStorageInterfaceFactory struct {
	Path string
	sqlite *sqliteCircuitStorageInterface
}

func (dbFactory *SqliteCircuitStorageInterfaceFactory) CreateCircuitStorageInterface() core.CircuitStorageInterface {
	if dbFactory.sqlite == nil {
		dbFactory.sqlite = genSqliteInterface(dbFactory.Path)
	}
	return dbFactory.sqlite
}

func genSqliteInterface(path string) *sqliteCircuitStorageInterface {
	var store sqliteCircuitStorageInterface
	db, err := sql.Open("sqlite3", path)
	if err != nil {
		panic(err)
	}

	// TODO: just make this a .sql file
	createCircuitStmt, err := db.Prepare("CREATE TABLE IF NOT EXISTS circuits (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, content TEXT NOT NULL, ownerId TEXT)")
	if err != nil {
		panic(err)
	}
	_, err = createCircuitStmt.Exec()
	if err != nil {
		panic(err)
	}

	// Generate the statements for storing/loading from a generic SQL db
	store.loadEntryStmt, err = db.Prepare("SELECT id, content, name, ownerId FROM circuits WHERE id=?")
	if err != nil {
		panic(err)
	}
	store.storeEntryStmt, err = db.Prepare("UPDATE circuits SET content=? WHERE id=?")
	if err != nil {
		panic(err)
	}
	store.createEntryStmt, err = db.Prepare("INSERT INTO circuits(content, ownerId, name) VALUES (?, ?, ?)")
	if err != nil {
		panic(err)
	}
	store.enumCircuitsStmt, err = db.Prepare("SELECT id, name, ownerId FROM circuits WHERE ownerId=?")
	if err != nil {
		panic(err)
	}

	store.db = db

	// Return success
	return &store
}

func (d sqliteCircuitStorageInterface) LoadCircuit(id core.CircuitId) *model.Circuit {
	var c model.Circuit
	err := d.loadEntryStmt.QueryRow(id).Scan(&c.Metadata.Id, &c.Content, &c.Metadata.Name, &c.Metadata.Owner)
	if err == sql.ErrNoRows || err != nil {
		return nil
	}
	return &c
}
func (d sqliteCircuitStorageInterface) EnumerateCircuits(userId core.UserId) []model.CircuitMetadata {
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
func (d sqliteCircuitStorageInterface) NewCircuit() model.Circuit {
	res, err := d.createEntryStmt.Exec("", "", "")
	if err != nil {
		panic(err)
	}
	id, err := res.LastInsertId()
	if err != nil {
		panic(err)
	}
	var circuit model.Circuit
	circuit.Metadata.Id = id
	return circuit
}
func (d sqliteCircuitStorageInterface) UpdateCircuit(circuit model.Circuit) {
	_, err := d.storeEntryStmt.Exec(circuit.Content, circuit.Metadata.Id)
	if err != nil {
		panic(err)
	}
}
func (d sqliteCircuitStorageInterface) Close() {
	d.Close()
}
