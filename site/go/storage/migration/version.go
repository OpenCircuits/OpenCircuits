package version

import (
	"database/sql"
	"errors"
	"sort"

	_ "github.com/mattn/go-sqlite3" // We don't really need code in this package.
)

type versionStruct struct {
	id      int
	dateTag string
}

type sqliteVersionStorageInterface struct {
	db *sql.DB

	// loadEntryStmt    *sql.Stmt
	// storeEntryStmt   *sql.Stmt
	// createEntryStmt  *sql.Stmt
	// enumCircuitsStmt *sql.Stmt
	// deleteEntryStmt  *sql.Stmt
}

// TableInit initiaize version table. Called by main.
func TableInit(db *sql.DB) error {
	vs := parser(db)
	if !integrityCheck(vs) {
		return errors.New("Table corrupted")
	}

	return nil
}

func parser(db *sql.DB) []versionStruct {
	rows, err := db.Query("SELECT id, date-tag FROM version")
	defer rows.Close()
	if err != nil {
		return nil
	}

	var v versionStruct
	var vs []versionStruct
	for rows.Next() {
		err := rows.Scan(&v.id, &v.dateTag)
		if err != nil {
			return nil
		}
		vs = append(vs, v)
	}
	return vs
}

// Check if the table's integreity.
func integrityCheck(vs []versionStruct) bool {

	// sort version slice
	sort.Slice(vs, func(i, j int) bool {
		return vs[i].id < vs[j].id
	})

	// loop over...
	for i, v := range vs {
	}

	return true
}
