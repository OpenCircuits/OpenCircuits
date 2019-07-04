package db

import (
	"database/sql"
	"github.com/OpenCircuits/OpenCircuits/site/go/model"

	_ "github.com/mattn/go-sqlite3"
)

type sqliteDb struct {
	baseDb baseSqlDb
}

func (d sqliteDb) LoadCircuit(id int64) (*model.Circuit, error) {
	return d.baseDb.LoadCircuit(id)
}

func (d sqliteDb) EnumerateCircuits(userId string) ([]model.CircuitHandle, error) {
	return d.baseDb.EnumerateCircuits(userId)
}

func (d sqliteDb) CreateCircuit(circuit *model.Circuit) error {
	return d.baseDb.CreateCircuit(circuit)
}

func (d sqliteDb) UpdateCircuit(circuit *model.Circuit) error {
	return d.baseDb.UpdateCircuit(circuit)
}

func (d sqliteDb) Close() {
	d.Close()
}

func OpenSqliteDb(path string) (AbstractDatabase, error) {
	var store sqliteDb
	database, err := sql.Open("sqlite3", path)
	if err != nil {
		return store, err
	}
	store.baseDb, err = genBaseSqlDb(database)
	return store, err
}
