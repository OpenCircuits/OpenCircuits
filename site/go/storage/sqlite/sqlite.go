package sqlite

import (
	"database/sql"
	"github.com/OpenCircuits/OpenCircuits/site/go/core/interfaces"
	"github.com/OpenCircuits/OpenCircuits/site/go/core/model"
	"github.com/OpenCircuits/OpenCircuits/site/go/core/utils"
	"github.com/gchaincl/dotsql"
	_ "github.com/mattn/go-sqlite3"
)

// TODO: most of this could be factored into a common sql implementation
type sqliteCircuitStorageInterface struct {
	db *sql.DB

	loadEntryStmt    *sql.Stmt
	storeEntryStmt   *sql.Stmt
	createEntryStmt  *sql.Stmt
	enumCircuitsStmt *sql.Stmt
	deleteEntryStmt  *sql.Stmt
}

func NewInterfaceFactory(sqliteDir string) (interfaces.CircuitStorageInterfaceFactory, error) {
	return genSqliteInterface(sqliteDir)
}

func (d *sqliteCircuitStorageInterface) CreateCircuitStorageInterface() interfaces.CircuitStorageInterface {
	// Since the sqlite storage interface only needs one instance, it can be its own factory
	return d
}

// TODO: remove this when migrations are supported
func schemaInitialized(db *sql.DB) bool {
	rows, err := db.Query("SELECT name FROM sqlite_master WHERE type='table' AND name='circuits'")
	if err != nil {
		return false
	}
	return rows.Next()
}

func initializeSchema(db *sql.DB, path string) error {
	schemaDot, err := dotsql.LoadFromFile(path)
	if err != nil {
		return err
	}
	// This doesn't set up migrations (intentionally)
	_, err = schemaDot.Exec(db, "create-circuits-table")
	return err
}

func genSqliteInterface(workingDir string) (*sqliteCircuitStorageInterface, error) {
	var store sqliteCircuitStorageInterface
	db, err := sql.Open("sqlite3", workingDir+"/db")
	if err != nil {
		return nil, err
	}

	if !schemaInitialized(db) {
		err = initializeSchema(db, workingDir+"/schema.sql")
		if err != nil {
			return nil, err
		}
	}

	// Generate the statements for storing/loading from a generic SQL db
	dot, err := dotsql.LoadFromFile(workingDir + "/queries.sql")
	if err != nil {
		return nil, err
	}

	store.loadEntryStmt, err = dot.Prepare(db, "load-circuit-entry")
	if err != nil {
		return nil, err
	}
	store.storeEntryStmt, err = dot.Prepare(db, "store-circuit-entry")
	if err != nil {
		return nil, err
	}
	store.createEntryStmt, err = dot.Prepare(db, "create-circuit-entry")
	if err != nil {
		return nil, err
	}
	store.enumCircuitsStmt, err = dot.Prepare(db, "query-user-circuits")
	if err != nil {
		return nil, err
	}
	store.deleteEntryStmt, err = dot.Prepare(db, "delete-user-circuit")
	if err != nil {
		return nil, err
	}

	store.db = db

	// Return success
	return &store, nil
}

func (d sqliteCircuitStorageInterface) LoadCircuit(id model.CircuitId) *model.Circuit {
	var c model.Circuit
	err := d.loadEntryStmt.QueryRow(id).Scan(&c.Metadata.ID, &c.Designer.RawContent, &c.Metadata.Name, &c.Metadata.Owner, &c.Metadata.Version, &c.Metadata.Thumbnail)
	if err == sql.ErrNoRows || err != nil {
		return nil
	}
	return &c
}
func (d sqliteCircuitStorageInterface) EnumerateCircuits(userId model.UserId) []model.CircuitMetadata {
	rows, err := d.enumCircuitsStmt.Query(userId)
	defer rows.Close()

	if err != nil {
		return nil
	}
	var c model.CircuitMetadata
	var cs []model.CircuitMetadata
	for rows.Next() {
		err := rows.Scan(&c.ID, &c.Name, &c.Owner, &c.Version, &c.Thumbnail)
		if err != nil {
			return nil
		}
		cs = append(cs, c)
	}
	return cs
}
func (d sqliteCircuitStorageInterface) checkToken(token string) bool {
	err := d.loadEntryStmt.QueryRow(token).Scan()
	if err == sql.ErrNoRows {
		return true
	} else if err != nil {
		panic(err)
	}
	return false
}
func (d sqliteCircuitStorageInterface) NewCircuit() model.Circuit {
	id := utils.GenFreshCircuitId(d.checkToken)
	_, err := d.createEntryStmt.Exec(id, "", "", "", "", "")
	if err != nil {
		panic(err)
	}
	var circuit model.Circuit
	circuit.Metadata.ID = id
	return circuit
}
func (d sqliteCircuitStorageInterface) UpdateCircuit(circuit model.Circuit) {
	_, err := d.storeEntryStmt.Exec(circuit.Designer.RawContent, circuit.Metadata.Name, circuit.Metadata.Owner, circuit.Metadata.Version, circuit.Metadata.Thumbnail, circuit.Metadata.ID)
	if err != nil {
		panic(err)
	}
}
func (d sqliteCircuitStorageInterface) DeleteCircuit(id model.CircuitId) {
	_, err := d.deleteEntryStmt.Exec(id)
	if err != nil {
		panic(err)
	}
}
func (d sqliteCircuitStorageInterface) Close() {
	d.Close()
}
